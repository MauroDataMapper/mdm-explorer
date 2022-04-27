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
import {
  CatalogueItemSearchResponse,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelDetailResponse,
  DataModelFullResponse,
  DataModelIndexResponse,
  DataModelSubsetPayload,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type DataModelGetFn = (id: Uuid) => Observable<DataModelDetailResponse>;
export type DataModelSearchFn = (
  id: Uuid,
  query?: SearchQueryParameters
) => Observable<CatalogueItemSearchResponse>;

export type DataModelListInFolderFn = (
  id: Uuid,
  query?: SearchQueryParameters
) => Observable<DataModelIndexResponse>;

export type DataModelHierarchyFn = (id: Uuid) => Observable<DataModelFullResponse>;

export type DataModelAddToFolderFn = (
  folderId: Uuid,
  payload: DataModelCreatePayload
) => Observable<DataModelDetailResponse>;

export type DataModelCopySubsetFn = (
  sourceId: Uuid,
  targetId: Uuid,
  payload: DataModelSubsetPayload
) => Observable<DataModelDetail>;

export interface MdmDataModelResourcesStub {
  get: jest.MockedFunction<DataModelGetFn>;
  search: jest.MockedFunction<DataModelSearchFn>;
  listInFolder: jest.MockedFunction<DataModelListInFolderFn>;
  hierarchy: jest.MockedFunction<DataModelHierarchyFn>;
  addToFolder: jest.MockedFunction<DataModelAddToFolderFn>;
  copySubset: jest.MockedFunction<DataModelCopySubsetFn>;
}

export const createDataModelStub = (): MdmDataModelResourcesStub => {
  return {
    get: jest.fn() as jest.MockedFunction<DataModelGetFn>,
    search: jest.fn() as jest.MockedFunction<DataModelSearchFn>,
    listInFolder: jest.fn() as jest.MockedFunction<DataModelListInFolderFn>,
    hierarchy: jest.fn() as jest.MockedFunction<DataModelHierarchyFn>,
    addToFolder: jest.fn() as jest.MockedFunction<DataModelAddToFolderFn>,
    copySubset: jest.fn() as jest.MockedFunction<DataModelCopySubsetFn>,
  };
};
