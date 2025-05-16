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
import { Contact, DepartmentRole, ListColumn, Uuid } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type ListDepartmentContactsFn = (departmentId: Uuid) => Observable<Contact[]>;
export type ListDepartmentContactsMockedFn = jest.MockedFunction<ListDepartmentContactsFn>;

export type GetDisplayColumnsForAdminFn = () => ListColumn[];
export type GetDisplayColumnsForAdminMockedFn = jest.MockedFunction<GetDisplayColumnsForAdminFn>;

export type GetDisplayColumnsForResearcherFn = (userDepartmentRole: DepartmentRole) => ListColumn[];
export type GetDisplayColumnsForResearcherMockedFn =
  jest.MockedFunction<GetDisplayColumnsForResearcherFn>;

export type GetContactByIdFn = (contactId: Uuid) => Observable<Contact>;
export type GetContactByIdMockedFn = jest.MockedFunction<GetContactByIdFn>;

export interface DepartmentContactServiceStub {
  list: ListDepartmentContactsMockedFn;
  getDisplayColumnsForAdmin: GetDisplayColumnsForAdminMockedFn;
  getDisplayColumnsForResearcher: GetDisplayColumnsForResearcherMockedFn;
  getContactById: GetContactByIdMockedFn;
}

export const createDepartmentContactServiceStub = (): DepartmentContactServiceStub => {
  return {
    list: jest.fn() as ListDepartmentContactsMockedFn,
    getDisplayColumnsForAdmin: jest.fn() as GetDisplayColumnsForAdminMockedFn,
    getDisplayColumnsForResearcher: jest.fn() as GetDisplayColumnsForResearcherMockedFn,
    getContactById: jest.fn() as GetContactByIdMockedFn,
  };
};
