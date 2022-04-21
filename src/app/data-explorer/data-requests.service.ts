/*
Copyright 2022 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Injectable } from '@angular/core';
import {
  DataElement,
  DataModel,
  DataModelCreatePayload,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { FolderDetail } from '@maurodatamapper/mdm-resources';
import {
  defaultIfEmpty,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDetails } from '../security/user-details.service';
import { DataModelService } from '../mauro/data-model.service';
import { FolderService } from '../mauro/folder.service';
import { CatalogueUserService } from '../mauro/catalogue-user.service';
import { DataElementBasic, mapToDataRequest } from './data-explorer.types';
import { DataRequest } from '../data-explorer/data-explorer.types';
import { DataExplorerService } from './data-explorer.service';
import { SecurityService } from '../security/security.service';

/**
 * Work in progress replacement for DataModelIntersection, in which the source and target model
 * IDs are also present.
 */
export interface SourceTargetIntersection {
  sourceDataModelId: Uuid;

  targetDataModelId: Uuid;

  intersects: Uuid[];
}

/**
 * A collection of the above, plus data access requests.
 */
export interface SourceTargetIntersections {
  dataAccessRequests: DataModel[];

  sourceTargetIntersections: SourceTargetIntersection[];
}

@Injectable({
  providedIn: 'root',
})
export class DataRequestsService {
  constructor(
    private dataModels: DataModelService,
    private folder: FolderService,
    private catalogueUser: CatalogueUserService,
    private dataExplorer: DataExplorerService,
    private security: SecurityService
  ) {}

  /**
   * Retrieve the users data requests folder. Creates a new folder if there isn't one.
   *
   * @param userEmail - get the data requests folder for the user with the given unique username
   * @returns an observable containing a FolderDetail object
   */
  getRequestsFolder(userEmail: string): Observable<FolderDetail> {
    return this.folder.getOrCreate(`${environment.rootRequestFolder}`).pipe(
      switchMap((rootFolder: FolderDetail) => {
        return this.folder.getOrCreateChildOf(
          rootFolder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          this.getDataRequestsFolderName(userEmail)
        );
      })
    );
  }

  /**
   * Lists all of the users requests as {@link DataRequest} objects.
   *
   * @param userEmail the username of the user.
   * @returns an observable containing an array of data requests
   */
  list(userEmail: string): Observable<DataRequest[]> {
    return this.getRequestsFolder(userEmail).pipe(
      switchMap((requestsFolder: FolderDetail): Observable<DataModel[]> => {
        return this.dataModels.listInFolder(requestsFolder.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      map((dataModels) => dataModels.map(mapToDataRequest))
    );
  }

  /**
   * Gets all Data Elements within a given Data Request, flattened into a single list.
   *
   * @param request The {@link DataRequest} (Data Model) that contains the elements.
   * @returns An observable containing the list of Data Elements.
   */
  listDataElements(request: DataRequest): Observable<DataElement[]> {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.dataModels.getDataModelHierarchy(request.id!).pipe(
      map((dataModel) => {
        // Flatten every Data Element into one array. Each Data Element will
        // include a breadcrumb to locate where it came from
        const dataClasses = dataModel.childDataClasses ?? [];

        return dataClasses.flatMap((parentDataClass) => {
          const parentElements = parentDataClass.dataElements ?? [];
          const childElements =
            parentDataClass.dataClasses?.flatMap((childDataClass) => {
              return childDataClass.dataElements ?? [];
            }) ?? [];
          return parentElements.concat(childElements);
        });
      })
    );
  }

  /**
   * Creates a new Data Request for a user.
   *
   * @param user The user to crate the request for.
   * @param name The name of the new request.
   * @param description Optional description for the new request.
   * @returns An observable containing the new {@link DataRequest}.
   */
  create(user: UserDetails, name: string, description?: string): Observable<DataRequest> {
    return forkJoin([
      this.getRequestsFolder(user.email),
      this.catalogueUser.get(user.id),
    ]).pipe(
      switchMap(([folder, catalogueUser]) => {
        if (!folder || !folder.id) {
          return throwError(() => new Error('No requests folder available'));
        }

        const payload: DataModelCreatePayload = {
          label: name,
          description,
          type: 'Data Asset',
          folder: folder.id,
          author: `${user.firstName} ${user.lastName}`,
          organisation: catalogueUser.organisation ?? '',
        };

        return this.dataModels.addToFolder(folder.id, payload);
      }),
      map((dataModel) => {
        return mapToDataRequest(dataModel);
      })
    );
  }

  /**
   * Given a source data model, return an observable containing all intersections for all data access requests, by:
   * 1. List all data access requests
   * 2. For each data access request, get intersections
   * This is a step towards a new endpoint which will return all intersections for all data access requests in a single API call.
   * @param sourceDataModelId
   * @returns
   */
  getRequestsIntersections(
    sourceDataModelId: Uuid
  ): Observable<SourceTargetIntersections[]> {
    const user = this.security.getSignedInUser();

    if (user === null) {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }
    const sourceTargetIntersections: SourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };

    return this.list(user.email).pipe(
      switchMap((dataModels: DataModel[]) => {
        sourceTargetIntersections.dataAccessRequests = [...dataModels];

        const gets: Observable<SourceTargetIntersections>[] = [];

        sourceTargetIntersections.dataAccessRequests.forEach((item: DataModel) => {
          if (item.id) {
            gets.push(
              this.getIntersection(sourceDataModelId, item.id, sourceTargetIntersections)
            );
          }
        });

        return forkJoin(gets);
      })
    );
  }

  /**
   * Get the intersection between a source and target data model, returning an updated
   * version of the patameter sourceTargetIntersections. This is a step towards handling all intersections
   * in a single API call.
   * @param sourceDataModelId
   * @param targetDataModelId
   * @param sourceTargetIntersections
   * @returns
   */
  getIntersection(
    sourceDataModelId: Uuid,
    targetDataModelId: Uuid,
    sourceTargetIntersections: SourceTargetIntersections
  ): Observable<SourceTargetIntersections> {
    return this.dataModels.getIntersection(sourceDataModelId, targetDataModelId).pipe(
      map((x) => {
        const z: SourceTargetIntersection = {
          sourceDataModelId,
          targetDataModelId,
          intersects: x.intersects,
        };

        sourceTargetIntersections.sourceTargetIntersections.push(z);
        return sourceTargetIntersections;
      })
    );
  }

  /**
   * Creates an observable that adds a new data model to the user's requests folder.
   *
   * @param elements The list of data elements to copy.
   * @param user The user to crate the request for.
   * @param name The name of the new request.
   * @param description Optional description for the new request.
   * @returns An observable containing the new {@link DataRequest}.
   */
  createFromDataElements(
    elements: DataElementBasic[],
    user: UserDetails,
    name: string,
    description?: string
  ): Observable<DataRequest> {
    return forkJoin([
      // TODO: assume there is only one data model, will have to change in future
      this.dataExplorer.getRootDataModel(),
      this.create(user, name, description),
    ]).pipe(
      switchMap(([rootDataModel, dataRequest]) => {
        if (!rootDataModel || !rootDataModel.id) {
          return throwError(() => new Error('No root data model'));
        }

        if (!dataRequest || !dataRequest.id) {
          return throwError(() => new Error('No data request'));
        }

        return this.dataModels.copySubset(rootDataModel.id, dataRequest.id, {
          additions: elements.map((de) => de.id),
          deletions: [],
        });
      }),
      map((targetDataModel) => mapToDataRequest(targetDataModel))
    );
  }

  /**
   * Encode username to allow for use as a folder name in the mdm-backend.
   *
   * @param userEmail
   * @returns The input string with all instances of '@' replaced with
   * '[at]'
   */
  private getDataRequestsFolderName(userEmail: string): string {
    return userEmail.replace('@', '[at]');
  }
}
