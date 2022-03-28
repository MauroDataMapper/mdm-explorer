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
  ContainerCreatePayload,
  DataClass,
  DataClassDetailResponse,
  DataClassIndexResponse,
  DataElement,
  DataElementDetail,
  DataElementIndexParameters,
  DataElementIndexResponse,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelDetailResponse,
  DataModelSubsetPayload,
  MdmDataClassResource,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { FolderDetail } from '@maurodatamapper/mdm-resources/lib/es2015/mdm-folder.model';
import {
  buffer,
  catchError,
  concatMap,
  defer,
  delay,
  endWith,
  from,
  ignoreElements,
  map,
  merge,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  switchMap,
  toArray,
} from 'rxjs';
import { environment } from 'src/environments/environment';
import { CatalogueUser, CatalogueUserService } from '../catalogue/catalogue-user.service';
import { UserDetails } from '../security/user-details.service';
import { FolderService } from './folder.service';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { ExceptionService } from './exception.service';
import { DataElementSearchResultSet } from '../search/search.types';
import { DataElementSearchService } from '../search/data-element-search.service';
import { DataModelService } from '../catalogue/data-model.service';

@Injectable({
  providedIn: 'root',
})
export class UserRequestsService {
  constructor(
    private folderService: FolderService,
    private catalogueUserService: CatalogueUserService,
    private endpointsService: MdmEndpointsService,
    private exceptionService: ExceptionService,
    private searchService: DataElementSearchService,
    private dataModel: DataModelService
  ) {}

  /**
   * Retrieve the users data requests folder. Creates a new folder if there isn't one.
   *
   * @param userEmail - get the data requests folder for the user with the given unique username
   * @returns an observable containing a FolderDetail object
   */
  getRequestsFolder(userEmail: string): Observable<FolderDetail> {
    return this.folderService.getOrCreate(`${environment.rootRequestFolder}`).pipe(
      switchMap((rootFolder: FolderDetail) => {
        return this.folderService.getOrCreateChildOf(
          rootFolder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          this.getDataRequestsFolderName(userEmail)
        );
      })
    );
  }

  /**
   * Lists all of the users requests as DataModel objects.
   *
   * @param userEmail the username of the user.
   * @returns an observable containing an array of dataModels (the users requests)
   */
  list(userEmail: string): Observable<DataModel[]> {
    return this.getRequestsFolder(userEmail).pipe(
      switchMap((requestsFolder: FolderDetail): Observable<DataModel[]> => {
        return this.dataModel.listInFolder(requestsFolder.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      })
    );
  }

  /**
   * Creates a new user request given a request name, a user and a data class
   *
   * @param requestName - get the data requests folder for the user with the given unique username
   * @returns Observable<DataModelDetailResponse>
   */
  createNewUserRequestFromDataClass(
    requestName: string,
    requestDescription: string,
    user: UserDetails,
    dataClass: DataClass
  ): Observable<string[]> {
    let newDataModel: DataModelDetail;
    let newDataModelIdSource = defer(() => of(newDataModel!.id!));
    let errors: string[] = new Array();
    return this.addUserRequest(requestName, requestDescription, user, errors).pipe(
      mergeMap((response: DataModelDetail) => {
        newDataModel = response;
        return of({});
      }),
      // Fetch any child data classes of the requested data class
      mergeMap(() => {
        return this.getAllChildDataClasses(dataClass, errors);
      }),
      this.exceptionService.catchAndReportPipeError(errors) as OperatorFunction<
        DataClass,
        DataClass
      >,
      // Fetches all the elements from each data class and
      // flattens/batches them into a single array.
      this.getElementsFromDataClasses(errors),
      //Break the stream of elements into chunks to sidestep the backend bug
      //which is causing the server to return a 500 for more than 8 or 9 items
      // mergeMap((elementsArray: any) => {
      //   let chunkSize = 5000;
      //   let chunks: string[][] = new Array();
      //   let numChunks = Math.floor(elementsArray.length / chunkSize);
      //   let leftoverElementsNum = elementsArray.length % chunkSize;

      //   for (let chunk = 0; chunk < numChunks; chunk++) {
      //     chunks[chunk] = new Array();
      //     for (let i = 0; i < chunkSize; i++) {
      //       chunks[chunk][i] = elementsArray[chunk * chunkSize + i].id!;
      //     }
      //   }
      //   if (leftoverElementsNum > 0) {
      //     chunks[numChunks] = new Array();
      //   }
      //   for (let i = 0; i < leftoverElementsNum; i++) {
      //     chunks[numChunks][i] = elementsArray[numChunks * chunkSize + i].id!;
      //   }
      //   return from(chunks);
      // }),
      this.exceptionService.catchAndReportPipeError(errors) as OperatorFunction<
        DataElement[],
        DataElement[]
      >,
      // Add all the data elements (which are in a single array) to the new
      // user request (data model)
      this.addDataElements(dataClass.model!, newDataModelIdSource, errors), // eslint-disable-line @typescript-eslint/no-non-null-assertion
      this.exceptionService.catchAndReportPipeError(errors),
      // We don't need the result
      ignoreElements(),
      // finish the pipe with any errors
      endWith(errors)
    ) as Observable<string[]>;
  }

  createNewUserRequestFromSearchResults(
    requestName: string,
    requestDescription: string,
    user: UserDetails,
    searchResults: DataElementSearchResultSet
  ): Observable<string[]> {
    let newDataModel: DataModelDetail;
    // Have to use a deferred observable or a promise here as we don't know the data model
    // before we have to create the pipe operator that needs the data model.
    const newDataModelIdSource = defer(() => of(newDataModel!.id!)); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    const errors: string[] = [];
    let existingDataModel: Uuid;
    try {
      existingDataModel = this.searchService.getDataModelFromSearchResults(searchResults);
    } catch (err) {
      errors[0] = err as string;
      return of(errors);
    }

    // Create the new data model under the user's folder
    return this.addUserRequest(requestName, requestDescription, user, errors).pipe(
      // save the new data model details for later
      mergeMap((response: DataModelDetail) => {
        newDataModel = response;
        return of(searchResults);
      }),
      map((pipedSearchResults: DataElementSearchResultSet) => {
        const ids: Uuid[] = [];
        for (let i = 0; i < pipedSearchResults.items.length; i++) {
          ids[i] = pipedSearchResults.items[i].id;
        }
        return ids;
      }),
      // Add the data elements (array) to the new
      // user request (data model)
      this.addDataElementsById(existingDataModel, newDataModelIdSource, errors),
      this.exceptionService.catchAndReportPipeError(errors),
      // We don't need the result
      ignoreElements(),
      // finish the pipe with any errors
      endWith(errors)
    ) as Observable<string[]>;
  }

  /**
   * returns pipe operator: source is DataElement[], result is DataModelDetail.
   * Adds the source DataElements, which exist in the oldDataModel, to the newDataModel
   *
   * @param oldDataModelId: Uuid of the source data model
   * @param newDataModelId: Observable of DataModel Uuids to which the elements need to be added
   * This was created to add to just 1 data model, but would work just as well with multiple data models
   * @param errors: string[] to which exception messages can be added.
   * @returns Observable<DataModelDetail> of the new data model
   */  addDataElements(
    oldDataModelId: Uuid,
    newDataModelId: Observable<Uuid>,
    errors: string[]
  ): OperatorFunction<DataElement[], any> {
    return (source) => {
      return source.pipe(
        mergeMap((elements: DataElement[]) => {
          const idArray: string[] = [];
          for (let i = 0; i < elements.length; i++) {
            idArray[i] = elements[i].id!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
          }
          return of(idArray);
        }),
        this.addDataElementsById(oldDataModelId, newDataModelId, errors)
      );
    };
  }

  addDataElementsById(
    oldDataModelId: Uuid,
    newDataModelId: Observable<Uuid>,
    errors: string[]
  ): OperatorFunction<string[], any> {
    return (source: Observable<string[]>) => {
      return source.pipe(
        mergeMap((elements: string[]) => {
          const datamodelSubsetPayload: DataModelSubsetPayload = {
            additions: [],
            deletions: [],
          };
          for (let i = 0; i < elements.length; i++) {
            datamodelSubsetPayload.additions.push(elements[i]);
          }
          return newDataModelId.pipe(
            mergeMap((sourceNewDataModelId: Uuid) => {
              return this.endpointsService.dataModel.copySubset(
                oldDataModelId,
                sourceNewDataModelId,
                datamodelSubsetPayload
              );
            }),
            this.exceptionService.catchAndReportPipeError(errors)
          );
        }),
        this.exceptionService.catchAndReportPipeError(errors)
      );
    };
  }

  getAllChildDataClasses(
    foundDataClass: DataClass,
    errors: string[]
  ): Observable<DataClass> {
    const childDataClasses = this.endpointsService.dataClass
      .listChildDataClasses(foundDataClass.model!, foundDataClass.id!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      .pipe(
        mergeMap((response: any) => {
          const childClasses = (response as DataClassIndexResponse).body
            .items as DataClass[];
          return from(childClasses);
        }),
        this.exceptionService.catchAndReportPipeError(errors),
        mergeMap((dataClass: DataClass) => {
          return this.getAllChildDataClasses(dataClass, errors);
        }),
        this.exceptionService.catchAndReportPipeError(errors) as OperatorFunction<
          DataClass,
          DataClass
        >
      );
    return merge(
      childDataClasses as Observable<DataClass>,
      of(foundDataClass)
    ) as Observable<DataClass>;
  }

  /**
   * returns pipe operator: source is DataClass, result is DataElement[].
   * Finds all the data elements that are children of the source data classes and flattens/batches
   * them into a single array. There is no check for duplicates in the output stream.
   *
   * @param errors: string[] to which exception messages can be added.
   * @returns Observable<DataModelDetail> of the new data model
   */
  public getElementsFromDataClasses(
    errors: any[]
  ): OperatorFunction<DataClass, DataElement[]> {
    const queryParams: DataElementIndexParameters = {
      all: true,
    };
    return (source: Observable<DataClass>): Observable<DataElement[]> => {
      return source.pipe(
        mergeMap((foundClass: DataClass) => {
          return this.endpointsService.dataElement.list(
            foundClass.model!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            foundClass.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            queryParams
          );
        }),
        this.exceptionService.catchAndReportPipeError(errors),
        mergeMap((elementsResponse: any) => {
          return from((elementsResponse as DataElementIndexResponse).body.items);
        }),
        toArray()
      );
    };
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
    requestName: string,
    requestDescription: string,
    user: UserDetails,
    errors: any[]
  ): Observable<DataModelDetail> {
    let folder: FolderDetail;
    return this.getRequestsFolder(user.email).pipe(
      switchMap((foundFolder: FolderDetail) => {
        folder = foundFolder;
        return this.catalogueUserService.get(user.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      this.exceptionService.catchAndReportPipeError(errors) as OperatorFunction<
        CatalogueUser,
        CatalogueUser
      >,
      switchMap((catalogueUser: CatalogueUser) => {
        const dataModelCreatePayload: DataModelCreatePayload = {
          label: requestName,
          description: requestDescription || 'Personal request',
          type: 'Data Asset',
          folder: folder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          author: `${user.firstName}${user.firstName ? '' : ' '}${user.lastName}`,
          organisation: catalogueUser.organisation ?? '',
        };
        return this.endpointsService.dataModel.addToFolder(
          folder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          dataModelCreatePayload
        );
      }),
      this.exceptionService.catchAndReportPipeError(errors),
      mergeMap((response: any): Observable<DataModelDetail> => {
        return of((response as DataModelDetailResponse).body);
      }),
      this.exceptionService.catchAndReportPipeError(errors) as OperatorFunction<
        DataModelDetail,
        DataModelDetail
      >
    );
  }

  public getElementsFromDataClasses(
    errors: any[]
  ): OperatorFunction<DataClass, DataElement[]> {
    let queryParams: DataElementIndexParameters = {
      all: true,
    };
    return (source: Observable<DataClass>): Observable<DataElement[]> => {
      return source.pipe(
        mergeMap((foundClass: DataClass) => {
          return this.endpointsService.dataElement.list(
            foundClass.model!,
            foundClass.id!,
            queryParams
          );
        }),
        this.exceptionService.catchAndReportPipeError(errors),
        mergeMap((elementsResponse: any) => {
          return from((elementsResponse as DataElementIndexResponse).body.items);
        }),
        toArray()
      );
    };
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
