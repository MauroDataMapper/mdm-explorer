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
import { CatalogueItemDomainType, DataClass } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import {
  DataClassWithElements,
  DataElementSearchResult,
  DataSpecification,
  DataSchema,
} from 'src/app/data-explorer/data-explorer.types';

export const buildDataClass = (label: string): DataClass => {
  return {
    label,
    domainType: CatalogueItemDomainType.DataClass,
  };
};

export const buildDataElement = (label: string): DataElementSearchResult => {
  return {
    id: label,
    label,
    isSelected: false,
    isBookmarked: false,
    model: '111',
    dataClass: '222',
  };
};

export interface DataSchemaServiceStub {
  reduceDataClassesFromSchemas: jest.MockedFunction<
    (dataSchemas: DataSchema[]) => DataClassWithElements[]
  >;
  reduceDataElementsFromSchemas: jest.MockedFunction<
    (dataSchemas: DataSchema[]) => DataElementSearchResult[]
  >;
  reduceDataElementsFromSchema: jest.MockedFunction<
    (dataSchema: DataSchema) => DataElementSearchResult[]
  >;
  loadDataSchemas: jest.MockedFunction<
    (dataSpecification: DataSpecification) => Observable<DataSchema[]>
  >;
  loadDataClasses: jest.MockedFunction<
    (dataSchema: DataClass) => Observable<DataClassWithElements[]>
  >;
  loadDataClassElements: jest.MockedFunction<
    (dataClass: DataClass) => Observable<DataClassWithElements>
  >;
}

export const createDataSchemaServiceStub = (): DataSchemaServiceStub => {
  return {
    reduceDataClassesFromSchemas: jest.fn(),
    reduceDataElementsFromSchemas: jest.fn(),
    reduceDataElementsFromSchema: jest.fn(),
    loadDataSchemas: jest.fn(),
    loadDataClasses: jest.fn(),
    loadDataClassElements: jest.fn(),
  };
};
