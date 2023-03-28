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
  CatalogueItemSearchResult,
  DataClass,
  DataClassDetail,
  DataElementDetail,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelSubsetPayload,
  ForkModelPayload,
  MdmIndexBody,
  ModelUpdatePayload,
  RequestSettings,
  SearchQueryParameters,
  SourceTargetIntersection,
  SourceTargetIntersectionPayload,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { DataClassIdentifier } from 'src/app/mauro/mauro.types';
import {
  DataElementDto,
  DataElementInstance,
  DataSpecification,
} from 'src/app/data-explorer/data-explorer.types';

export type DataModelGetDataModelFn = (path: string) => Observable<DataModelDetail>;
export type DataModelGetDataClassesFn = (
  parent: DataModel | DataClass
) => Observable<DataClass[]>;
export type DataModelGetDataClassFn = (
  id: DataClassIdentifier
) => Observable<DataClassDetail>;
export type DataModelGetDataElementsFn = (
  id: DataClassIdentifier
) => Observable<MdmIndexBody<DataElementDto>>;
export type DataModelGetDataElementFn = (
  id: DataClassIdentifier
) => Observable<DataElementDetail>;
export type DataModelSearchDataModelFn = (
  id: Uuid,
  params: SearchQueryParameters
) => Observable<MdmIndexBody<CatalogueItemSearchResult>>;
export type DataModelListInFolderFn = (folderId: Uuid) => Observable<DataModel[]>;
export type DataModelGetHierarchyFn = (
  dataSpecification: DataSpecification
) => Observable<DataElementDto[]>;
export type DataModelAddToFolderFn = (
  folderId: Uuid,
  payload: DataModelCreatePayload
) => Observable<DataModelDetail>;
export type DataModelCopySubsetFn = (
  sourceId: Uuid,
  targetId: Uuid,
  payload: DataModelSubsetPayload
) => Observable<DataModelDetail>;
export type DataModelElementsForClassFn = (
  dataClass: DataClass
) => Observable<DataElementDto[]>;
export type DataModelGetIntersectionManyFn = (
  sourceId: Uuid,
  data: SourceTargetIntersectionPayload
) => Observable<MdmIndexBody<SourceTargetIntersection>>;
export type DataModeNextVersionFn = (model: DataModel) => Observable<DataModel>;
export type DataModelForkFn = (
  model: DataModel,
  payload: ForkModelPayload
) => Observable<DataModel>;
export type DataModelElementsInAnotherModelFn = (
  model: DataModelDetail,
  elements: DataElementDto[]
) => Observable<DataElementDto[]>;
export type DataModelDataElementToBasicFn = (
  element: DataElementDto
) => DataElementInstance;
export type UpdateDataModelFn = (
  id: Uuid,
  data: ModelUpdatePayload,
  options?: RequestSettings
) => Observable<DataModelDetail>;

export interface DataModelServiceStub {
  getDataModelById: jest.MockedFunction<(id: Uuid) => Observable<DataModelDetail>>;
  getDataModel: jest.MockedFunction<DataModelGetDataModelFn>;
  getDataClasses: jest.MockedFunction<DataModelGetDataClassesFn>;
  getDataClass: jest.MockedFunction<DataModelGetDataClassFn>;
  getDataElements: jest.MockedFunction<DataModelGetDataElementsFn>;
  getDataElement: jest.MockedFunction<DataModelGetDataElementFn>;
  searchDataModel: jest.MockedFunction<DataModelSearchDataModelFn>;
  listInFolder: jest.MockedFunction<DataModelListInFolderFn>;
  getDataModelHierarchy: jest.MockedFunction<DataModelGetHierarchyFn>;
  addToFolder: jest.MockedFunction<DataModelAddToFolderFn>;
  copySubset: jest.MockedFunction<DataModelCopySubsetFn>;
  getDataElementsForDataClass: jest.MockedFunction<DataModelElementsForClassFn>;
  getIntersectionMany: jest.MockedFunction<DataModelGetIntersectionManyFn>;
  createNextVersion: jest.MockedFunction<DataModeNextVersionFn>;
  createFork: jest.MockedFunction<DataModelForkFn>;
  elementsInAnotherModel: jest.MockedFunction<DataModelElementsInAnotherModelFn>;
  dataElementToBasic: jest.MockedFunction<DataModelDataElementToBasicFn>;
  moveToFolder: jest.MockedFunction<
    (modelId: Uuid, targetFolderId: Uuid) => Observable<DataModelDetail>
  >;
  update: jest.MockedFunction<UpdateDataModelFn>;
}

export const createDataModelServiceStub = (): DataModelServiceStub => {
  return {
    getDataModelById: jest.fn() as jest.MockedFunction<
      (id: Uuid) => Observable<DataModelDetail>
    >,
    getDataModel: jest.fn() as jest.MockedFunction<DataModelGetDataModelFn>,
    getDataClasses: jest.fn() as jest.MockedFunction<DataModelGetDataClassesFn>,
    getDataClass: jest.fn() as jest.MockedFunction<DataModelGetDataClassFn>,
    getDataElements: jest.fn() as jest.MockedFunction<DataModelGetDataElementsFn>,
    getDataElement: jest.fn() as jest.MockedFunction<DataModelGetDataElementFn>,
    searchDataModel: jest.fn() as jest.MockedFunction<DataModelSearchDataModelFn>,
    listInFolder: jest.fn() as jest.MockedFunction<DataModelListInFolderFn>,
    getDataModelHierarchy: jest.fn() as jest.MockedFunction<DataModelGetHierarchyFn>,
    addToFolder: jest.fn() as jest.MockedFunction<DataModelAddToFolderFn>,
    copySubset: jest.fn() as jest.MockedFunction<DataModelCopySubsetFn>,
    getDataElementsForDataClass:
      jest.fn() as jest.MockedFunction<DataModelElementsForClassFn>,
    getIntersectionMany: jest.fn() as jest.MockedFunction<DataModelGetIntersectionManyFn>,
    createNextVersion: jest.fn() as jest.MockedFunction<DataModeNextVersionFn>,
    createFork: jest.fn() as jest.MockedFunction<DataModelForkFn>,
    elementsInAnotherModel:
      jest.fn() as jest.MockedFunction<DataModelElementsInAnotherModelFn>,
    dataElementToBasic: jest.fn() as jest.MockedFunction<DataModelDataElementToBasicFn>,
    moveToFolder: jest.fn(),
    update: jest.fn() as jest.MockedFunction<UpdateDataModelFn>,
  };
};
