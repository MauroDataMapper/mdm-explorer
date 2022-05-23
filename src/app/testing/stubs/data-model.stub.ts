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
  CatalogueItemSearchResult,
  DataClass,
  DataClassDetail,
  DataElement,
  DataElementDetail,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelSubsetPayload,
  MdmIndexBody,
  SearchQueryParameters,
  SourceTargetIntersection,
  SourceTargetIntersectionPayload,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { DataClassIdentifier } from 'src/app/mauro/mauro.types';
import { DataElementBasic, DataRequest } from 'src/app/data-explorer/data-explorer.types';

export type DataModelGetDataModelFn = (path: string) => Observable<DataModelDetail>;
export type DataModelGetDataClassesFn = (
  parent: DataModel | DataClass
) => Observable<DataClass[]>;
export type DataModelGetDataClassFn = (
  id: DataClassIdentifier
) => Observable<DataClassDetail>;
export type DataModelGetDataElementsFn = (
  id: DataClassIdentifier
) => Observable<MdmIndexBody<DataElement>>;
export type DataModelGetDataElementFn = (
  id: DataClassIdentifier
) => Observable<DataElementDetail>;
export type DataModelSearchDataModelFn = (
  id: Uuid,
  params: SearchQueryParameters
) => Observable<MdmIndexBody<CatalogueItemSearchResult>>;
export type DataModelListInFolderFn = (folderId: Uuid) => Observable<DataModel[]>;
export type DataModelGetHierarchyFn = (request: DataRequest) => Observable<DataElement[]>;
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
) => Observable<DataElement[]>;
export type DataModelGetIntersectionManyFn = (
  sourceId: Uuid,
  data: SourceTargetIntersectionPayload
) => Observable<MdmIndexBody<SourceTargetIntersection>>;
export type DataModeNextVersionFn = (model: DataModel) => Observable<DataModel>;
export type DataModelElementsInAnotherModelFn = (
  model: DataModelDetail,
  elements: DataElement[]
) => Observable<DataElement[]>;
export type DataModelDataElementToBasicFn = (element: DataElement) => DataElementBasic;
export type DataModelDataElementFromBasicFn = (element: DataElementBasic) => DataElement;

export interface DataModelServiceStub {
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
  elementsInAnotherModel: jest.MockedFunction<DataModelElementsInAnotherModelFn>;
  dataElementToBasic: jest.MockedFunction<DataModelDataElementToBasicFn>;
  dataElementFromBasic: jest.MockedFunction<DataModelDataElementFromBasicFn>;
}

export const createDataModelServiceStub = (): DataModelServiceStub => {
  return {
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
    elementsInAnotherModel:
      jest.fn() as jest.MockedFunction<DataModelElementsInAnotherModelFn>,
    dataElementToBasic: jest.fn() as jest.MockedFunction<DataModelDataElementToBasicFn>,
    dataElementFromBasic:
      jest.fn() as jest.MockedFunction<DataModelDataElementFromBasicFn>,
  };
};
