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
import { Uuid } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { DataSpecification } from 'src/app/data-explorer/data-explorer.types';

export type ResearchPluginSubmitDataSpecificationFn = (id: Uuid) => Observable<DataSpecification>;

export type GetLatestModelDataSpecificationsFn = () => Observable<DataSpecification[]>;
export type GetLatestModelDataSpecificationsMockedFn =
  jest.MockedFunction<GetLatestModelDataSpecificationsFn>;

export type ListSharedDataSpecificationsFn = () => Observable<DataSpecification[]>;

export interface DataSpecificationResearchPluginServiceStub {
  finaliseDataSpecification: jest.MockedFunction<ResearchPluginSubmitDataSpecificationFn>;
  getLatestModelDataSpecifications: GetLatestModelDataSpecificationsMockedFn;
  listSharedDataSpecifications: jest.MockedFunction<ListSharedDataSpecificationsFn>;
}

export const createDataSpecificationResearchPluginServiceStub =
  (): DataSpecificationResearchPluginServiceStub => {
    return {
      finaliseDataSpecification:
        jest.fn() as jest.MockedFunction<ResearchPluginSubmitDataSpecificationFn>,
      getLatestModelDataSpecifications: jest.fn() as GetLatestModelDataSpecificationsMockedFn,
      listSharedDataSpecifications:
        jest.fn() as jest.MockedFunction<ListSharedDataSpecificationsFn>,
    };
  };
