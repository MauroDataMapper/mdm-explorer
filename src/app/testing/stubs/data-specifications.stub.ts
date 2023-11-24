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
  DataElementOperationResult,
  DataSpecification,
  DataSpecificationQuery,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  ForkDataSpecificationOptions,
} from 'src/app/data-explorer/data-explorer.types';
import { DataSpecificationSourceTargetIntersections } from 'src/app/data-explorer/data-specification.service';
import { DataSpecificationCreatedResponse } from '../../data-explorer/data-specification-created-dialog/data-specification-created-dialog.component';
import { UserDetails } from 'src/app/security/user-details.service';

export type DataSpecificationsGetFn = (id: string) => Observable<DataModel>;
export type DataSpecificationsListFn = (username: string) => Observable<DataModel[]>;
export type DataSpecificationsListElementsFn = (
  dataSpecification: DataSpecification,
) => Observable<DataElementDto[]>;
export type DataSpecificationsCreateFromDataClassFn = (
  dataSpecificationName: string,
  dataSpecificationDescription: string,
  user: UserDetails,
  dataClass: DataClass,
) => Observable<[DataModel, string[]]>;
export type DataSpecificationsCreateFromDataElementsFn = (
  elements: DataElementInstance[],
  user: UserDetails,
  name: string,
  description: string,
) => Observable<DataSpecification>;
export type CreateFromDialogsFn = (
  callback: () => Observable<DataElementInstance[]>,
) => Observable<DataSpecificationCreatedResponse>;
export type DataSpecificationsSourceTargetIntersectionsFn = (
  sourceDataModelId: Uuid,
) => Observable<DataSpecificationSourceTargetIntersections>;
export type DeleteDataElementMultipleFn = (
  elements: [DataElementInstance],
  targetModel: DataModelDetail,
) => Observable<DataElementMultipleOperationResult>;
export type DataSpecificationsUpdateDataSpecificationsFolderFn = (
  folderId: Uuid,
  label: string,
) => Observable<[DataModel, string[]]>;
export type DataSpecificationGetDataSpecificationFolderFn =
  () => Observable<FolderDetail>;
export type DataSpecificationGetFolderNameFn = (userEmail: string) => string;
export type DeleteDataElementsFromQueryFn = (
  dataSpecificationId: Uuid,
  type: DataSpecificationQueryType,
  dataElementLabels: string[],
) => Observable<DataSpecificationQueryPayload>;
export type IsDataSpecificationNameAvailableFn = (name: string) => Observable<boolean>;
export type DeleteDataSchemaFn = (
  dataSchema: DataClass,
) => Observable<DataElementOperationResult>;
export type DeleteDataClassFn = (
  dataClass: DataClass,
) => Observable<DataElementOperationResult>;

export interface DataSpecificationServiceStub {
  get: jest.MockedFunction<(id: Uuid) => Observable<DataSpecification>>;
  list: jest.MockedFunction<DataSpecificationsListFn>;
  listTemplates: jest.MockedFunction<() => Observable<DataSpecification[]>>;
  listDataElements: jest.MockedFunction<DataSpecificationsListElementsFn>;
  createFromDataElements: jest.MockedFunction<DataSpecificationsCreateFromDataElementsFn>;
  createWithDialogs: jest.MockedFunction<CreateFromDialogsFn>;
  forkWithDialogs: jest.MockedFunction<
    (
      dataSpecification: DataSpecification,
      options?: ForkDataSpecificationOptions,
    ) => Observable<DataSpecification>
  >;
  getDataSpecificationIntersections: jest.MockedFunction<DataSpecificationsSourceTargetIntersectionsFn>;
  deleteDataElementMultiple: jest.MockedFunction<DeleteDataElementMultipleFn>;
  updateDataSpecificationsFolder: jest.MockedFunction<DataSpecificationsUpdateDataSpecificationsFolderFn>;
  getDataSpecificationFolder: jest.MockedFunction<DataSpecificationGetDataSpecificationFolderFn>;
  getDataSpecificationFolderName: jest.MockedFunction<DataSpecificationGetFolderNameFn>;
  getQuery: jest.MockedFunction<
    (
      id: Uuid,
      type: DataSpecificationQueryType,
    ) => Observable<DataSpecificationQuery | undefined>
  >;
  createOrUpdateQuery: jest.MockedFunction<
    (
      dataSpecificationId: string,
      payload: DataSpecificationQueryPayload,
    ) => Observable<DataSpecificationQuery>
  >;
  deleteDataElementsFromQuery: jest.MockedFunction<DeleteDataElementsFromQueryFn>;
  isDataSpecificationNameAvailable: jest.MockedFunction<IsDataSpecificationNameAvailableFn>;
  deleteDataSchema: jest.MockedFunction<DeleteDataSchemaFn>;
  deleteDataClass: jest.MockedFunction<DeleteDataClassFn>;
}

export const createDataSpecificationServiceStub = (): DataSpecificationServiceStub => {
  return {
    get: jest.fn(),
    list: jest.fn() as jest.MockedFunction<DataSpecificationsListFn>,
    listTemplates: jest.fn(),
    listDataElements: jest.fn() as jest.MockedFunction<DataSpecificationsListElementsFn>,
    createFromDataElements:
      jest.fn() as jest.MockedFunction<DataSpecificationsCreateFromDataElementsFn>,
    createWithDialogs: jest.fn() as jest.MockedFunction<CreateFromDialogsFn>,
    forkWithDialogs: jest.fn(),
    getDataSpecificationIntersections:
      jest.fn() as jest.MockedFunction<DataSpecificationsSourceTargetIntersectionsFn>,
    deleteDataElementMultiple:
      jest.fn() as jest.MockedFunction<DeleteDataElementMultipleFn>,
    updateDataSpecificationsFolder:
      jest.fn() as jest.MockedFunction<DataSpecificationsUpdateDataSpecificationsFolderFn>,
    getDataSpecificationFolder:
      jest.fn() as jest.MockedFunction<DataSpecificationGetDataSpecificationFolderFn>,
    getDataSpecificationFolderName:
      jest.fn() as jest.MockedFunction<DataSpecificationGetFolderNameFn>,
    getQuery: jest.fn(),
    createOrUpdateQuery: jest.fn(),
    deleteDataElementsFromQuery:
      jest.fn() as jest.MockedFunction<DeleteDataElementsFromQueryFn>,
    isDataSpecificationNameAvailable:
      jest.fn() as jest.MockedFunction<IsDataSpecificationNameAvailableFn>,
    deleteDataSchema: jest.fn() as jest.MockedFunction<DeleteDataSchemaFn>,
    deleteDataClass: jest.fn() as jest.MockedFunction<DeleteDataClassFn>,
  };
};
