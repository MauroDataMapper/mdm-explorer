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
  DataModel,
  DataModelDetail,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { DataClassIdentifier } from 'src/app/catalogue/catalogue.types';

export type DataModelGetDataModelFn = (path: string) => Observable<DataModelDetail>;
export type DataModelGetDataClassesFn = (
  parent: DataModel | DataClass
) => Observable<DataClass[]>;
export type DataModelGetDataClassFn = (
  id: DataClassIdentifier
) => Observable<DataClassDetail>;
export type DataModelGetDataElementsFn = (
  id: DataClassIdentifier
) => Observable<DataElement[]>;
export type DataModelSearchDataModelFn = (
  id: Uuid,
  params: SearchQueryParameters
) => Observable<CatalogueItemSearchResult[]>;

export interface DataModelServiceStub {
  getDataModel: jest.MockedFunction<DataModelGetDataModelFn>;
  getDataClasses: jest.MockedFunction<DataModelGetDataClassesFn>;
  getDataClass: jest.MockedFunction<DataModelGetDataClassFn>;
  getDataElements: jest.MockedFunction<DataModelGetDataElementsFn>;
  searchDataModel: jest.MockedFunction<DataModelSearchDataModelFn>;
}

export const createDataModelServiceStub = (): DataModelServiceStub => {
  return {
    getDataModel: jest.fn() as jest.MockedFunction<DataModelGetDataModelFn>,
    getDataClasses: jest.fn() as jest.MockedFunction<DataModelGetDataClassesFn>,
    getDataClass: jest.fn() as jest.MockedFunction<DataModelGetDataClassFn>,
    getDataElements: jest.fn() as jest.MockedFunction<DataModelGetDataElementsFn>,
    searchDataModel: jest.fn() as jest.MockedFunction<DataModelSearchDataModelFn>,
  };
};
