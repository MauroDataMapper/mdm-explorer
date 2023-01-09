/*
Copyright 2022-2023 University of Oxford
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
import {
  DataClass,
  DataModel,
  DataModelDetail,
  FolderDetail,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import {
  DataElementDto,
  DataElementInstance,
  DataElementMultipleOperationResult,
  DataRequest,
  DataRequestQuery,
  DataRequestQueryPayload,
  DataRequestQueryType,
} from 'src/app/data-explorer/data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from 'src/app/data-explorer/data-requests.service';
import { RequestCreatedAction } from 'src/app/data-explorer/request-created-dialog/request-created-dialog.component';
import { UserDetails } from 'src/app/security/user-details.service';

export type DataRequestsGetFn = (id: string) => Observable<DataModel>;
export type DataRequestsListFn = (username: string) => Observable<DataModel[]>;
export type DataRequestsListElementsFn = (
  request: DataRequest
) => Observable<DataElementDto[]>;
export type DataRequestsCreateFromDataClassFn = (
  requestName: string,
  requestDescription: string,
  user: UserDetails,
  dataClass: DataClass
) => Observable<[DataModel, string[]]>;
export type DataRequestsCreateFromDataElementsFn = (
  elements: DataElementInstance[],
  user: UserDetails,
  name: string,
  description: string
) => Observable<DataRequest>;
export type CreateFromDialogsFn = (
  callback: () => Observable<DataElementInstance[]>
) => Observable<RequestCreatedAction | undefined>;
export type DataAccessRequestsSourceTargetIntersectionsFn = (
  sourceDataModelId: Uuid
) => Observable<DataAccessRequestsSourceTargetIntersections>;
export type DeleteDataElementMultipleFn = (
  elements: [DataElementInstance],
  targetModel: DataModelDetail
) => Observable<DataElementMultipleOperationResult>;
export type DataRequestsUpdateRequestsFolderFn = (
  folderId: Uuid,
  label: string
) => Observable<[DataModel, string[]]>;
export type DataRequestGetRequestsFolderFn = () => Observable<FolderDetail>;
export type DataRequestGetFolderNameFn = (userEmail: string) => string;

export interface DataRequestsServiceStub {
  get: jest.MockedFunction<(id: Uuid) => Observable<DataRequest>>;
  list: jest.MockedFunction<DataRequestsListFn>;
  listDataElements: jest.MockedFunction<DataRequestsListElementsFn>;
  createFromDataElements: jest.MockedFunction<DataRequestsCreateFromDataElementsFn>;
  createWithDialogs: jest.MockedFunction<CreateFromDialogsFn>;
  getRequestsIntersections: jest.MockedFunction<DataAccessRequestsSourceTargetIntersectionsFn>;
  deleteDataElementMultiple: jest.MockedFunction<DeleteDataElementMultipleFn>;
  updateRequestsFolder: jest.MockedFunction<DataRequestsUpdateRequestsFolderFn>;
  getRequestsFolder: jest.MockedFunction<DataRequestGetRequestsFolderFn>;
  getDataRequestsFolderName: jest.MockedFunction<DataRequestGetFolderNameFn>;
  getQuery: jest.MockedFunction<
    (id: Uuid, type: DataRequestQueryType) => Observable<DataRequestQuery | undefined>
  >;
  createOrUpdateQuery: jest.MockedFunction<
    (requestId: string, payload: DataRequestQueryPayload) => Observable<DataRequestQuery>
  >;
}

export const createDataRequestsServiceStub = (): DataRequestsServiceStub => {
  return {
    get: jest.fn(),
    list: jest.fn() as jest.MockedFunction<DataRequestsListFn>,
    listDataElements: jest.fn() as jest.MockedFunction<DataRequestsListElementsFn>,
    createFromDataElements:
      jest.fn() as jest.MockedFunction<DataRequestsCreateFromDataElementsFn>,
    createWithDialogs: jest.fn() as jest.MockedFunction<CreateFromDialogsFn>,
    getRequestsIntersections:
      jest.fn() as jest.MockedFunction<DataAccessRequestsSourceTargetIntersectionsFn>,
    deleteDataElementMultiple:
      jest.fn() as jest.MockedFunction<DeleteDataElementMultipleFn>,
    updateRequestsFolder:
      jest.fn() as jest.MockedFunction<DataRequestsUpdateRequestsFolderFn>,
    getRequestsFolder: jest.fn() as jest.MockedFunction<DataRequestGetRequestsFolderFn>,
    getDataRequestsFolderName:
      jest.fn() as jest.MockedFunction<DataRequestGetFolderNameFn>,
    getQuery: jest.fn(),
    createOrUpdateQuery: jest.fn(),
  };
};
