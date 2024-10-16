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

import { Department, DepartmentMemberDTO, UserDepartmentDTO } from '@maurodatamapper/sde-resources';
import { Uuid } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type GetDepartmentFn = (departmentId: Uuid) => Observable<Department>;
export type GetDepartmentMockedFn = jest.MockedFunction<GetDepartmentFn>;

export type GetUsersDepartmentsFn = () => Observable<UserDepartmentDTO[]>;
export type GetUsersDepartmentsMockedFn = jest.MockedFunction<GetUsersDepartmentsFn>;

export type GetApproversForDepartmentFn = (departmentId: Uuid) => Observable<DepartmentMemberDTO[]>;
export type GetApproversForDepartmentMockedFn = jest.MockedFunction<GetApproversForDepartmentFn>;

export interface SdeDepartmentServiceStub {
  get: GetDepartmentMockedFn;
  getUsersDepartments: GetUsersDepartmentsMockedFn;
  getApproversForDepartment: GetApproversForDepartmentMockedFn;
}

export const createSdeDepartmentServiceStub = (): SdeDepartmentServiceStub => {
  return {
    get: jest.fn() as GetDepartmentMockedFn,
    getUsersDepartments: jest.fn() as GetUsersDepartmentsMockedFn,
    getApproversForDepartment: jest.fn() as GetApproversForDepartmentMockedFn,
  };
};
