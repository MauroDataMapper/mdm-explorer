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
import { Inject, Injectable } from '@angular/core';
import {
  DataElement,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import {
  FolderDetail,
  SourceTargetIntersection,
  SourceTargetIntersectionPayload,
} from '@maurodatamapper/mdm-resources';
import {
  catchError,
  concatMap,
  EMPTY,
  filter,
  forkJoin,
  from,
  map,
  Observable,
  of,
  OperatorFunction,
  switchMap,
  throwError,
  toArray,
} from 'rxjs';
import { UserDetails } from '../security/user-details.service';
import { DataModelService } from '../mauro/data-model.service';
import { CatalogueUserService } from '../mauro/catalogue-user.service';
import {
  DataElementBasic,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  mapToDataRequest,
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from './data-explorer.types';
import { DataRequest } from '../data-explorer/data-explorer.types';
import { DataExplorerService } from './data-explorer.service';
import { SecurityService } from '../security/security.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ResearchPluginService } from '../mauro/research-plugin.service';

/**
 * A collection data access requests and their intersections with target models.
 */
export interface DataAccessRequestsSourceTargetIntersections {
  dataAccessRequests: DataModel[];

  sourceTargetIntersections: SourceTargetIntersection[];
}

@Injectable({
  providedIn: 'root',
})
export class DataRequestsService {
  constructor(
    private dataModels: DataModelService,
    private pluginResearch: ResearchPluginService,
    private catalogueUser: CatalogueUserService,
    private dataExplorer: DataExplorerService,
    private security: SecurityService,
    @Inject(DATA_EXPLORER_CONFIGURATION) private config: DataExplorerConfiguration
  ) {}

  /**
   * Retrieve the users data requests folder, which is assumed to be in local storage.
   *
   * @returns an observable containing a FolderDetail object
   */
  getRequestsFolder(): Observable<FolderDetail> {
    const user = this.security.getSignedInUser();

    if (user && user.requestFolder) {
      return new Observable<FolderDetail>((subscriber) => {
        subscriber.next(user.requestFolder);
        subscriber.complete();
      });
    } else {
      return EMPTY;
    }
  }

  /**
   * Retrieve the users data requests folder. Updateing the label to a new value.
   * Called when a user changes thier email address
   * @param folderId - Id of the request folder to be updated
   * @param label - the new user email to be applied
   * @returns an observable containing a FolderDetail object
   */
  updateRequestsFolder(folderId: Uuid, label: string): Observable<FolderDetail> {
    return this.folder.update(folderId, {
      id: folderId,
      label: this.getDataRequestsFolderName(label),
    });
  }

  /**
   * Lists all of the users requests as {@link DataRequest} objects.
   *
   * @returns an observable containing an array of data requests
   */
  list(): Observable<DataRequest[]> {
    return this.getRequestsFolder().pipe(
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
   * Deletes multiple data elements from a data request, calling the delete endpoint once
   * for each element. Using concatMap sidestep backend exceptions
   *
   * @param items: The data elements to be removed
   *
   * @returns: Observable of DataElementMultipleOperationResult
   */
  deleteDataElementMultiple(
    elements: DataElementBasic[],
    targetModel: DataModelDetail
  ): Observable<DataElementMultipleOperationResult> {
    const items: DataElement[] = elements.map((dataElementBasic) => {
      return this.dataModels.dataElementFromBasic(dataElementBasic);
    });
    return of(items).pipe(
      switchMap((dataElements: DataElement[]) => {
        return this.dataModels.elementsInAnotherModel(targetModel, dataElements);
      }),
      switchMap((dataElements: (DataElement | null)[]) => from(dataElements)),
      filter((item) => item !== null) as OperatorFunction<
        DataElement | null,
        DataElement
      >,
      concatMap((item: DataElement) => {
        const dataElementBasic: DataElementBasic =
          this.dataModels.dataElementToBasic(item);
        return this.deleteDataElement(dataElementBasic);
      }),
      toArray(),
      switchMap((results: DataElementOperationResult[]) => {
        const successes: DataElementOperationResult[] = [];
        const failures: DataElementOperationResult[] = [];
        results.forEach((result: DataElementOperationResult) => {
          const destination = result.success ? successes : failures;
          destination.push(result);
        });
        return of({ successes, failures });
      })
    );
  }

  /**
   * Deletes a data element from a data request
   *
   * @param item: The data element to be removed
   *
   * @returns: Observable of DataElementOperationResult
   */
  deleteDataElement(item: DataElementBasic): Observable<DataElementOperationResult> {
    return this.dataModels.deleteDataElement(item).pipe(
      map((response: HttpResponse<any>) => {
        if (response.status === 200 || response.status === 204) {
          return { success: true, message: 'OK', item };
        } else {
          return { success: false, message: response.body, item };
        }
      }),
      catchError((response: HttpErrorResponse) => {
        return of({ success: false, message: response.message, item });
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
    return forkJoin([this.getRequestsFolder(), this.catalogueUser.get(user.id)]).pipe(
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
   * Given a source data model and list of data elements, get all unsent data requests and
   * get the intersection of the source with each data request, for the list of data elements.
   *
   * @param sourceDataModelId
   * @param dataElementIds
   * @returns Observable<DataAccessRequestsSourceTargetIntersections>
   */
  getRequestsIntersections(
    sourceDataModelId: Uuid,
    dataElementIds: Uuid[]
  ): Observable<DataAccessRequestsSourceTargetIntersections> {
    const user = this.security.getSignedInUser();

    if (user === null) {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }

    return this.list().pipe(
      map((dataRequests: DataRequest[]) =>
        dataRequests.filter((dr) => dr.status === 'unsent')
      ),
      switchMap((dataRequests: DataRequest[]) => {
        const sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections = {
          dataAccessRequests: dataRequests,
          sourceTargetIntersections: [],
        };

        const payload: SourceTargetIntersectionPayload = {
          targetDataModelIds: [],
          dataElementIds,
        };

        dataRequests.forEach((dataRequest: DataRequest) => {
          if (dataRequest.id) {
            payload.targetDataModelIds.push(dataRequest.id);
          }
        });

        return this.dataModels.getIntersectionMany(sourceDataModelId, payload).pipe(
          map((result) => {
            sourceTargetIntersections.sourceTargetIntersections = result.items;
            return sourceTargetIntersections;
          })
        );
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
