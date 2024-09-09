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
  Department,
  DepartmentMember,
  DepartmentMemberDTO,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type ListDepartmentsFn = () => Observable<Department[]>;
export type ListDepartmentsMockedFn = jest.MockedFunction<ListDepartmentsFn>;

export type GetDepartmentFn = (departmentId: Uuid) => Observable<Department>;
export type GetDepartmentMockedFn = jest.MockedFunction<GetDepartmentFn>;

export type ListDepartmentMembersFn = (departmentId: Uuid) => Observable<DepartmentMember[]>;
export type ListDepartmentMembersMockedFn = jest.MockedFunction<ListDepartmentMembersFn>;

export type ListDepartmentApproversAndProjectPeersFn = (
  departmentId: Uuid
) => Observable<DepartmentMemberDTO[]>;
export type ListDepartmentApproversAndProjectPeersMockedFn =
  jest.MockedFunction<ListDepartmentApproversAndProjectPeersFn>;

export interface SdeDepartmentEndpointsStub {
  listDepartments: ListDepartmentsMockedFn;
  getDepartment: GetDepartmentMockedFn;
  listDepartmentMembers: ListDepartmentMembersMockedFn;
  listDepartmentApproversAndProjectPeers: ListDepartmentApproversAndProjectPeersMockedFn;
}

export const createSdeDepartmentEndpointsStub = (): SdeDepartmentEndpointsStub => {
  return {
    listDepartments: jest.fn() as ListDepartmentsMockedFn,
    getDepartment: jest.fn() as GetDepartmentMockedFn,
    listDepartmentMembers: jest.fn() as ListDepartmentMembersMockedFn,
    listDepartmentApproversAndProjectPeers:
      jest.fn() as ListDepartmentApproversAndProjectPeersMockedFn,
  };
};
