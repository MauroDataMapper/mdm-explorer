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
import {
  DepartmentMemberDTO,
  DepartmentRole,
  ListColumn,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type ListDepartmentMembersFn = (departmentId: Uuid) => Observable<DepartmentMemberDTO[]>;
export type ListDepartmentMembersMockedFn = jest.MockedFunction<ListDepartmentMembersFn>;

export type GetDisplayColumnsForAdminFn = () => ListColumn[];
export type GetDisplayColumnsForAdminMockedFn = jest.MockedFunction<GetDisplayColumnsForAdminFn>;

export type GetDisplayColumnsForResearcherFn = (userDepartmentRole: DepartmentRole) => ListColumn[];
export type GetDisplayColumnsForResearcherMockedFn =
  jest.MockedFunction<GetDisplayColumnsForResearcherFn>;

export interface DepartmentMemberServiceStub {
  listDepartmentMembers: ListDepartmentMembersMockedFn;
  getDisplayColumnsForAdmin: GetDisplayColumnsForAdminMockedFn;
  getDisplayColumnsForResearcher: GetDisplayColumnsForResearcherMockedFn;
}

export const createDepartmentMemberServiceStub = (): DepartmentMemberServiceStub => {
  return {
    listDepartmentMembers: jest.fn() as ListDepartmentMembersMockedFn,
    getDisplayColumnsForAdmin: jest.fn() as GetDisplayColumnsForAdminMockedFn,
    getDisplayColumnsForResearcher: jest.fn() as GetDisplayColumnsForResearcherMockedFn,
  };
};
