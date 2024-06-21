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
import { DataModel } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { DataSpecification } from 'src/app/data-explorer/data-explorer.types';

export type MapToDataSpecificationWithSDEStatusCheckMockedFn = (
  dataModel: DataModel
) => Observable<DataSpecification>;
export type MapToDataSpecificationMockedFn = (dataModel: DataModel) => DataSpecification;

export interface SubmissionSDEServiceStub {
  mapToDataSpecificationWithSDEStatusCheck: jest.MockedFunction<MapToDataSpecificationWithSDEStatusCheckMockedFn>;
  mapToDataSpecification: jest.MockedFunction<MapToDataSpecificationMockedFn>;
}

export const createSubmissionSDEServiceStub = (): SubmissionSDEServiceStub => {
  return {
    mapToDataSpecificationWithSDEStatusCheck:
      jest.fn() as jest.MockedFunction<MapToDataSpecificationWithSDEStatusCheckMockedFn>,
    mapToDataSpecification: jest.fn() as jest.MockedFunction<MapToDataSpecificationMockedFn>,
  };
};
