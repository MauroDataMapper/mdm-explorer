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
  Organisation,
  OrganisationMemberDTO,
  UserOrganisationDto,
} from '@maurodatamapper/sde-resources/lib/resources/organisation.resources';
import { Uuid } from '@maurodatamapper/sde-resources/lib/types/shared.types';
import { Observable } from 'rxjs';

export type GetOrganisationFn = (organisationId: Uuid) => Observable<Organisation>;
export type GetOrganisationMockedFn = jest.MockedFunction<GetOrganisationFn>;

export type GetUsersOrganisationsFn = () => Observable<UserOrganisationDto[]>;
export type GetUsersOrganisationsMockedFn = jest.MockedFunction<GetUsersOrganisationsFn>;

export type GetApproversForOrganisationFn = (
  organisationId: Uuid
) => Observable<OrganisationMemberDTO[]>;
export type GetApproversForOrganisationMockedFn =
  jest.MockedFunction<GetApproversForOrganisationFn>;

export interface SdeOrganisationServiceStub {
  get: GetOrganisationMockedFn;
  getUsersOrganisations: GetUsersOrganisationsMockedFn;
  getApproversForOrganisation: GetApproversForOrganisationMockedFn;
}

export const createSdeOrganisationServiceStub = (): SdeOrganisationServiceStub => {
  return {
    get: jest.fn() as GetOrganisationMockedFn,
    getUsersOrganisations: jest.fn() as GetUsersOrganisationsMockedFn,
    getApproversForOrganisation: jest.fn() as GetApproversForOrganisationMockedFn,
  };
};
