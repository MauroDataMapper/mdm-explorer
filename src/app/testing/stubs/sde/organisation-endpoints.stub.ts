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
  ApiBodyAddOrganisationDTO,
  DepartmentDetailsDTO,
  Organisation,
  OrganisationMemberDTO,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type GetOrganisationFn = () => Observable<Organisation>;
export type GetOrganisationMockedFn = jest.MockedFunction<GetOrganisationFn>;

export type CreateOrganisationFn = (
  organisation: ApiBodyAddOrganisationDTO
) => Observable<Organisation>;
export type CreateOrganisationMockedFn = jest.MockedFunction<CreateOrganisationFn>;

export type UpdateOrganisationFn = (organisation: Organisation) => Observable<Organisation>;
export type UpdateOrganisationMockedFn = jest.MockedFunction<UpdateOrganisationFn>;

export type ListOrganisationsFn = () => Observable<Organisation[]>;
export type ListOrganisationsMockedFn = jest.MockedFunction<ListOrganisationsFn>;

export type ListOrganisationDepartmentsFn = (
  organisationId: Uuid
) => Observable<DepartmentDetailsDTO[]>;
export type ListOrganisationDepartmentsMockedFn =
  jest.MockedFunction<ListOrganisationDepartmentsFn>;

export type ListOrganisationMembersFn = (departmentId: Uuid) => Observable<OrganisationMemberDTO[]>;
export type ListOrganisationMembersMockedFn = jest.MockedFunction<ListOrganisationMembersFn>;

export type GetOrganisationMembershipFn = (
  organisationId: Uuid,
  userId: Uuid
) => Observable<OrganisationMemberDTO>;
export type GetOrganisationMembershipMockedFn = jest.MockedFunction<GetOrganisationMembershipFn>;

export type CreateOrganisationMembershipFn = (
  member: OrganisationMemberDTO
) => Observable<OrganisationMemberDTO>;
export type CreateOrganisationMembershipMockedFn =
  jest.MockedFunction<CreateOrganisationMembershipFn>;

export type UpdateOrganisationMembershipFn = (
  member: OrganisationMemberDTO
) => Observable<OrganisationMemberDTO>;
export type UpdateOrganisationMembershipMockedFn =
  jest.MockedFunction<UpdateOrganisationMembershipFn>;

export interface SdeOrganisationEndpointsStub {
  getOrganisation: GetOrganisationMockedFn;
  createOrganisation: CreateOrganisationMockedFn;
  updateOrganisation: UpdateOrganisationMockedFn;
  listOrganisations: ListOrganisationsMockedFn;
  listOrganisationDepartments: ListOrganisationDepartmentsMockedFn;
  listOrganisationMembers: ListOrganisationMembersMockedFn;
  getOrganisationMembership: GetOrganisationMembershipMockedFn;
  createOrganisationMembership: CreateOrganisationMembershipMockedFn;
  updateOrganisationMembership: UpdateOrganisationMembershipMockedFn;
}

export const createSdeOrganisationEndpointsStub = (): SdeOrganisationEndpointsStub => {
  return {
    getOrganisation: jest.fn() as GetOrganisationMockedFn,
    createOrganisation: jest.fn() as CreateOrganisationMockedFn,
    updateOrganisation: jest.fn() as UpdateOrganisationMockedFn,
    listOrganisations: jest.fn() as ListOrganisationsMockedFn,
    listOrganisationDepartments: jest.fn() as ListOrganisationDepartmentsMockedFn,
    listOrganisationMembers: jest.fn() as ListOrganisationMembersMockedFn,
    getOrganisationMembership: jest.fn() as GetOrganisationMembershipMockedFn,
    createOrganisationMembership: jest.fn() as CreateOrganisationMembershipMockedFn,
    updateOrganisationMembership: jest.fn() as UpdateOrganisationMembershipMockedFn,
  };
};
