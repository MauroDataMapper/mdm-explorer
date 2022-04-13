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
import { DataClass, DataElement, DataModel } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import {
  DataElementSearchResultSet,
  DataRequest,
} from 'src/app/data-explorer/data-explorer.types';
import { UserDetails } from 'src/app/security/user-details.service';

export type DataRequestsListFn = (username: string) => Observable<DataModel[]>;
export type DataRequestsGetElementsFn = (
  request: DataRequest
) => Observable<DataElement[]>;
export type DataRequestsCreateFromDataClassFn = (
  requestName: string,
  requestDescription: string,
  user: UserDetails,
  dataClass: DataClass
) => Observable<[DataModel, string[]]>;
export type DataRequestsCreateFromSearchResultsFn = (
  requestName: string,
  requestDescription: string,
  user: UserDetails,
  searchResults: DataElementSearchResultSet
) => Observable<[DataModel, string[]]>;

export interface DataRequestsServiceStub {
  list: jest.MockedFunction<DataRequestsListFn>;
  getRequestDataElements: jest.MockedFunction<DataRequestsGetElementsFn>;
  createFromDataClass: jest.MockedFunction<DataRequestsCreateFromDataClassFn>;
  createFromSearchResults: jest.MockedFunction<DataRequestsCreateFromSearchResultsFn>;
}

export const createDataRequestsServiceStub = (): DataRequestsServiceStub => {
  return {
    list: jest.fn() as jest.MockedFunction<DataRequestsListFn>,
    getRequestDataElements: jest.fn() as jest.MockedFunction<DataRequestsGetElementsFn>,
    createFromDataClass:
      jest.fn() as jest.MockedFunction<DataRequestsCreateFromDataClassFn>,
    createFromSearchResults:
      jest.fn() as jest.MockedFunction<DataRequestsCreateFromSearchResultsFn>,
  };
};
