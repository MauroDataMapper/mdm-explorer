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
import { createSdeOrganisationEndpointsStub } from 'src/app/testing/stubs/sde/sde-organisation-endpoints.stub';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { OrganisationEndpoints } from '../endpoints/organisation.endpoints';
import { SdeOrganisationService } from './sde-organisation.service';

describe('SdeOrganisationService', () => {
  let service: SdeOrganisationService;
  const organisationEndpointsStub = createSdeOrganisationEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(SdeOrganisationService, {
      providers: [
        {
          provide: OrganisationEndpoints,
          useValue: organisationEndpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
