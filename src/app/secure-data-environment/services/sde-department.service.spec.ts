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
import { setupTestModuleForService } from '../../testing/testing.helpers';
import { SdeDepartmentService } from './sde-department.service';
import { createSdeOrganisationEndpointsStub } from '../../testing/stubs/sde/department-endpoints.stub';
import { Organisation, OrganisationEndpoints } from '@maurodatamapper/sde-resources';
import { of } from 'rxjs';

describe('SdeDepartmentService', () => {
  let service: SdeDepartmentService;
  const organisationEndpointsStub = createSdeOrganisationEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(SdeDepartmentService, {
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

  it('add an organisation to the cache', () => {
    const expectedOrg = { id: 'test-org-id' } as Organisation;

    service.addOrganisationToCache(expectedOrg);

    expect(service.organisations).toContain(expectedOrg);
  });

  it('should return cached organisation data when available', () => {
    const orgId = 'test-org-id';
    const expectedOrg = { id: orgId } as Organisation;

    service.addOrganisationToCache(expectedOrg);

    service.get(orgId).subscribe((org) => {
      expect(org).toEqual(expectedOrg);
      expect(organisationEndpointsStub.getOrganisation).not.toHaveBeenCalled();
    });
  });

  it('should fetch organisation data when not cached and add that org to the cache', () => {
    const orgId = 'test-org-id';
    const expectedOrg = { id: orgId } as Organisation;

    organisationEndpointsStub.getOrganisation.mockReturnValueOnce(of(expectedOrg));

    service.get(orgId).subscribe((org) => {
      expect(org).toEqual(expectedOrg);
      expect(service.organisations).toContain(expectedOrg);
    });
  });
});
