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
  CatalogueItemDomainType,
  DataClass,
  DataElement,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelDetailResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { FolderDetail } from '@maurodatamapper/mdm-resources';
import { defaultIfEmpty, forkJoin, map, mergeMap, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UserDetails } from '../security/user-details.service';
import { HttpResponse } from '@angular/common/http';
import { DataModelService } from '../mauro/data-model.service';
import { FolderService } from '../mauro/folder.service';
import { CatalogueUserService } from '../mauro/catalogue-user.service';
import { ExceptionService } from '../core/exception.service';
import { DataElementSearchService } from './data-element-search.service';
import { DataElementSearchResult } from './data-explorer.types';
import { DataClassService } from '../mauro/data-class.service';
import { DataRequest, getDataRequestStatus } from '../data-explorer/data-explorer.types';

@Injectable({
  providedIn: 'root',
})
export class DataRequestsService {
  constructor(
    private dataModels: DataModelService,
    private folder: FolderService,
    private catalogueUser: CatalogueUserService,
    private exception: ExceptionService,
    private search: DataElementSearchService,
    private dataClasses: DataClassService
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
      map((dataModels) =>
        dataModels.map((dm) => {
          return {
            ...dm,
            status: getDataRequestStatus(dm),
          };
        })
      )
    );
  }

  /**
   * Gets all Data Elements within a given Data Model, flattened into a single list.
   *
   * @param request The {@link DataRequest} (Data Model) that contains the elements.
   * @returns An observable containing the list of Data Elements.
   */
  getRequestDataElements(request: DataRequest): Observable<DataElement[]> {
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
   * Creates a new user request given a request name, description, a user and a data class
   *
   * @param requestName - Name for the new user request
   * @param requestDescription - Description for the new user request
   * @param user: user's requests folder for the new request to be added to
   * @param data class to be added to new request
   * @returns Observable<DataModelDetailResponse>
   */
  createFromDataClass(
    requestName: string,
    requestDescription: string,
    user: UserDetails,
    dataClass: DataClass
  ): Observable<[DataModel, string[]]> {
    const errors: string[] = [];
    // Create the new data model under the user's folder
    return forkJoin([
      this.addUserRequest(user, errors, requestName, requestDescription),
      this.dataClasses.getAllChildDataClasses(dataClass, errors).pipe(
        this.exception.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
        this.dataClasses.getElementsFromDataClasses(errors)
      ),
    ]).pipe(
      this.exception.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
      // Add all the data elements (which are in a single array) to the new
      // user request (data model)
      this.dataModels.addDataElements(dataClass.model!, errors), // eslint-disable-line @typescript-eslint/no-non-null-assertion
      this.exception.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
      map((newDataModel: HttpResponse<DataModel>) => {
        return [newDataModel.body, errors] as [DataModel, string[]];
      }),
      defaultIfEmpty([{ label: requestName } as DataModel, errors])
    );
  }

  createFromSearchResults(
    requestName: string,
    requestDescription: string,
    user: UserDetails,
    items: DataElementSearchResult[]
  ): Observable<[DataModel, string[]]> {
    // Have to use a deferred observable or a promise here as we don't know the data model
    // before we have to create the pipe operator that needs the data model.
    const errors: string[] = [];
    let existingDataModel: Uuid;
    try {
      existingDataModel = this.search.getDataModelFromSearchResults(items);
    } catch (err) {
      errors[0] = err as string;
      return of([{ label: '', domainType: CatalogueItemDomainType.DataModel }, errors]);
    }
    // Create the new data model under the user's folder
    return this.addUserRequest(user, errors, requestName, requestDescription).pipe(
      mergeMap(
        (response: DataModelDetail): Observable<[Uuid, DataElementSearchResult[]]> => {
          return of([
            response.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            items,
          ]);
        }
      ),
      map(([newDataModelId, pipedItems]) => {
        const ids = pipedItems.map((item) => item.id);
        return [newDataModelId, ids] as [Uuid, Uuid[]];
      }),
      // Add the data elements (array) to the new
      // user request (data model)
      this.dataModels.addDataElementsById(existingDataModel, errors),
      this.exception.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
      map((newDataModel: HttpResponse<DataModel>) => {
        return [newDataModel.body as DataModel, errors] as [DataModel, string[]];
      }),
      defaultIfEmpty([{ label: requestName } as DataModel, errors])
    );
  }

  /**
   * Creates an observable that adds a new data model to the user's requests folder.
   *
   * @param requestName: string, usually input by the user, the label of the new data model
   * @param user: UserDetails object describing the current signed in user.
   * @param errors: string[] to which exception messages can be added.
   * @returns Observable<DataModelDetail> of the new data model
   */
  private addUserRequest(
    user: UserDetails,
    errors: any[],
    requestName: string,
    requestDescription?: string
  ): Observable<DataModelDetail> {
    return forkJoin([
      this.getRequestsFolder(user.email),
      this.catalogueUser.get(user.id!), // eslint-disable-line @typescript-eslint/no-non-null-assertion
    ]).pipe(
      this.exception.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
      switchMap(([folder, catalogueUser]) => {
        const dataModelCreatePayload: DataModelCreatePayload = {
          label: requestName,
          description: requestDescription,
          type: 'Data Asset',
          folder: folder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          author: `${user.firstName}${user.firstName ? '' : ' '}${user.lastName}`,
          organisation: catalogueUser.organisation ?? '',
        };
        return this.dataModels.addToFolder(
          folder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion,  @typescript-eslint/no-unsafe-argument
          dataModelCreatePayload
        );
      }),
      this.exception.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
      mergeMap((response: any): Observable<DataModelDetail> => {
        return of((response as DataModelDetailResponse).body);
      }),
      this.exception.catchAndReportPipeError(errors) // eslint-disable-line @typescript-eslint/no-unsafe-argument
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
