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
  OrganisationMember,
} from '@maurodatamapper/sde-resources/lib/resources/organisation.resources';
import { Uuid } from '@maurodatamapper/sde-resources/lib/types';
import { Observable } from 'rxjs';

export type ListOrganisationsFn = () => Observable<Organisation[]>;
export type ListOrganisationsMockedFn = jest.MockedFunction<ListOrganisationsFn>;

export type GetOrganisationFn = (organisationId: Uuid) => Observable<Organisation>;
export type GetOrganisationMockedFn = jest.MockedFunction<GetOrganisationFn>;

export type ListOrganisationMembersFn = (
  organisationId: Uuid
) => Observable<OrganisationMember[]>;
export type ListOrganisationMembersMockedFn =
  jest.MockedFunction<ListOrganisationMembersFn>;

export interface SdeOrganisationEndpointsStub {
  listOrganisations: ListOrganisationsMockedFn;
  getOrganisation: GetOrganisationMockedFn;
  listOrganisationMembers: ListOrganisationMembersMockedFn;
}

export const createSdeOrganisationEndpointsStub = (): SdeOrganisationEndpointsStub => {
  return {
    listOrganisations: jest.fn() as ListOrganisationsMockedFn,
    getOrganisation: jest.fn() as GetOrganisationMockedFn,
    listOrganisationMembers: jest.fn() as ListOrganisationMembersMockedFn,
  };
};
