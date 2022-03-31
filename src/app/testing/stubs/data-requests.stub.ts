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
<<<<<<< HEAD:src/app/testing/stubs/data-requests.stub.ts
import { DataModel } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type DataRequestsListFn = (username: string) => Observable<DataModel[]>;

export interface DataRequestsServiceStub {
  list: jest.MockedFunction<DataRequestsListFn>;
}

export const createDataRequestsServiceStub = (): DataRequestsServiceStub => {
  return {
    list: jest.fn() as jest.MockedFunction<DataRequestsListFn>,
  };
};
=======
@import "../../../styles/base/all";

$chip-unsent-color: $color-teal;
$chip-submitted-color: $color-light-blue;
$chip-text-color-light: $color-white;

.mdm-request-status-chip {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 23px;
  margin: 5px 0 5px 23px;

  &--unsent {
    color: $chip-text-color-light;
    background-color: $chip-unsent-color;
  }

  &--submitted {
    color: $chip-text-color-light;
    background-color: $chip-submitted-color;
  }
}
>>>>>>> c89d47f (MC-9794 Create My Requests page):src/app/data-explorer/request-status-chip/request-status-chip.component.scss
