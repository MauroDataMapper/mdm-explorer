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
  BranchModelPayload,
  CatalogueItemSearchResponse,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelDetailResponse,
  DataModelFullResponse,
  DataModelIndexResponse,
  DataModelSubsetPayload,
  ForkModelPayload,
  ModelUpdatePayload,
  Payload,
  RequestSettings,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type DataModelGetFn = (id: Uuid) => Observable<DataModelDetailResponse>;
export type DataModelSearchFn = (
  id: Uuid,
  query?: SearchQueryParameters,
) => Observable<CatalogueItemSearchResponse>;

export type DataModelListInFolderFn = (
  id: Uuid,
  query?: SearchQueryParameters,
) => Observable<DataModelIndexResponse>;

export type DataModelHierarchyFn = (id: Uuid) => Observable<DataModelFullResponse>;

export type DataModelAddToFolderFn = (
  folderId: Uuid,
  payload: DataModelCreatePayload,
) => Observable<DataModelDetailResponse>;

export type DataModelCopySubsetFn = (
  sourceId: Uuid,
  targetId: Uuid,
  payload: DataModelSubsetPayload,
) => Observable<DataModelDetail>;

export type DataModelBranchVersionFn = (
  id: string,
  data: Payload | BranchModelPayload,
) => Observable<DataModelDetailResponse>;

export type DataModelForkVersionFn = (
  id: Uuid,
  payload: ForkModelPayload,
) => Observable<DataModelDetailResponse>;

export type UpdateDataModelFn<Payload extends ModelUpdatePayload> = (
  id: Uuid,
  data: Payload,
  options?: RequestSettings,
) => Observable<DataModelDetailResponse>;

export interface MdmDataModelResourcesStub {
  get: jest.MockedFunction<DataModelGetFn>;
  search: jest.MockedFunction<DataModelSearchFn>;
  listInFolder: jest.MockedFunction<DataModelListInFolderFn>;
  hierarchy: jest.MockedFunction<DataModelHierarchyFn>;
  addToFolder: jest.MockedFunction<DataModelAddToFolderFn>;
  copySubset: jest.MockedFunction<DataModelCopySubsetFn>;
  newBranchModelVersion: jest.MockedFunction<DataModelBranchVersionFn>;
  newForkModel: jest.MockedFunction<DataModelForkVersionFn>;
  moveDataModelToFolder: jest.MockedFunction<
    (modelId: Uuid, folderId: Uuid) => Observable<DataModelDetail>
  >;
  update: jest.MockedFunction<UpdateDataModelFn<ModelUpdatePayload>>;
}

export const createDataModelStub = (): MdmDataModelResourcesStub => {
  return {
    get: jest.fn() as jest.MockedFunction<DataModelGetFn>,
    search: jest.fn() as jest.MockedFunction<DataModelSearchFn>,
    listInFolder: jest.fn() as jest.MockedFunction<DataModelListInFolderFn>,
    hierarchy: jest.fn() as jest.MockedFunction<DataModelHierarchyFn>,
    addToFolder: jest.fn() as jest.MockedFunction<DataModelAddToFolderFn>,
    copySubset: jest.fn() as jest.MockedFunction<DataModelCopySubsetFn>,
    newBranchModelVersion: jest.fn() as jest.MockedFunction<DataModelBranchVersionFn>,
    newForkModel: jest.fn() as jest.MockedFunction<DataModelForkVersionFn>,
    moveDataModelToFolder: jest.fn(),
    update: jest.fn() as jest.MockedFunction<UpdateDataModelFn<ModelUpdatePayload>>,
  };
};
