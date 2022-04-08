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
import { Observable } from 'rxjs';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
} from 'src/app/data-explorer/data-explorer.types';

export type DataElementSearchFn = (
  params: DataElementSearchParameters
) => Observable<DataElementSearchResultSet>;

export interface DataElementSearchServiceStub {
  listing: jest.MockedFunction<DataElementSearchFn>;
  search: jest.MockedFunction<DataElementSearchFn>;
}

export const createDataElementSearchServiceStub = (): DataElementSearchServiceStub => {
  return {
    listing: jest.fn() as jest.MockedFunction<DataElementSearchFn>,
    search: jest.fn() as jest.MockedFunction<DataElementSearchFn>,
  };
};
