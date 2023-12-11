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
import { OrganisationsComponent } from './organisations.component';
import { SdeOrganisationService } from '../../services/sde-organisation.service';
import { createSdeOrganisationServiceStub } from 'src/app/testing/stubs/sde/sde-organisation-service.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { Organisation, UserOrganisationDTO } from '@maurodatamapper/sde-resources';
import { of } from 'rxjs';

describe('OrganisationsComponent', () => {
  let harness: ComponentHarness<OrganisationsComponent>;

  const sdeOrganisationServiceStub = createSdeOrganisationServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(OrganisationsComponent, {
      providers: [
        {
          provide: SdeOrganisationService,
          useValue: sdeOrganisationServiceStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
  });

  it('should handle no organisations for user', () => {
    sdeOrganisationServiceStub.getUsersOrganisations.mockReturnValueOnce(of([]));

    harness.detectChanges();

    expect(harness.component.myOrganisations).toEqual([]);
    expect(harness.component.selectedOrganisation).toBeUndefined();
    expect(harness.component.userHasOrganisations).toBe(false);
  });

  it('should get and set user organisations on init', () => {
    const expectedOrg = { id: '1', name: 'Org 1' } as Organisation;
    const userOrgDto = { organisationId: '1' } as UserOrganisationDTO;

    sdeOrganisationServiceStub.getUsersOrganisations.mockReturnValueOnce(
      of([userOrgDto])
    );
    sdeOrganisationServiceStub.get.mockReturnValueOnce(of(expectedOrg));

    harness.detectChanges();

    expect(harness.component.myOrganisations).toEqual([userOrgDto]);
    expect(harness.component.selectedOrganisation).toEqual(expectedOrg);
    expect(harness.component.userHasOrganisations).toBe(true);
  });

  it('should update selected organisation on organisation select event', () => {
    const expectedOrg = { id: '2', name: 'Org 2' } as Organisation;
    const userOrgDto = { organisationId: '2' } as UserOrganisationDto;

    sdeOrganisationServiceStub.get.mockReturnValueOnce(of(expectedOrg));

    harness.component.onOrganisationSelectEvent(userOrgDto);

    expect(harness.component.selectedOrganisation).toEqual(expectedOrg);
  });
});
