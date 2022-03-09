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
import { DataClassIndexResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type DataClassListFn = (dataModelId: Uuid) => Observable<DataClassIndexResponse>;
export type DataClassListMockedFn = jest.MockedFunction<DataClassListFn>;

export type DataClassListChildrenFn = (
  dataModelId: Uuid,
  dataClassId: Uuid
) => Observable<DataClassIndexResponse>;
export type DataClassListChildrenMockedFn = jest.MockedFunction<DataClassListChildrenFn>;

export interface MdmDataClassResourceStub {
  list: DataClassListMockedFn;
  listChildDataClasses: DataClassListChildrenMockedFn;
}

export const createDataClassStub = (): MdmDataClassResourceStub => {
  return {
    list: jest.fn() as DataClassListMockedFn,
    listChildDataClasses: jest.fn() as DataClassListChildrenMockedFn,
  };
};
