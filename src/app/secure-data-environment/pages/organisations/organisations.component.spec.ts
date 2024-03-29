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
import {
  APPROVER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST,
  ListColumn,
  MEMBER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST,
  Organisation,
  OrganisationMemberService,
  UserOrganisationDTO,
} from '@maurodatamapper/sde-resources';
import { createOrganisationMemberServiceStub } from 'src/app/testing/stubs/sde/organisation-member.service.stub';
import { of } from 'rxjs';

describe('OrganisationsComponent', () => {
  let harness: ComponentHarness<OrganisationsComponent>;
  const sdeOrganisationServiceStub = createSdeOrganisationServiceStub();
  const organisationMemberService = createOrganisationMemberServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(OrganisationsComponent, {
      providers: [
        {
          provide: SdeOrganisationService,
          useValue: sdeOrganisationServiceStub,
        },
        {
          provide: OrganisationMemberService,
          useValue: organisationMemberService,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
  });

  describe('ngOnInit: setting initial selectedOrg, myOrganisations, userHasOrganisations, and displayColumns', () => {
    it('should handle the case where the user has no organisations', () => {
      sdeOrganisationServiceStub.getUsersOrganisations.mockReturnValueOnce(of([]));

      harness.detectChanges();

      expect(harness.component.myOrganisations).toEqual([]);
      expect(harness.component.selectedOrganisation).toBeUndefined();
      expect(harness.component.userHasOrganisations).toBe(false);
      expect(harness.component.displayColumnsForOrganisationMemberList).toEqual([]);
    });

    it('should initialise for an APPROVER', () => {
      const userOrgs = [{ organisationId: '1', role: 'APPROVER' } as UserOrganisationDTO];
      const expectedOrg = { id: '1' } as Organisation;
      const expectedDisplayColumns = APPROVER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST;

      sdeOrganisationServiceStub.getUsersOrganisations.mockReturnValueOnce(of(userOrgs));
      sdeOrganisationServiceStub.get.mockReturnValueOnce(of(expectedOrg));
      organisationMemberService.getDisplayColumnsForResearcher.mockReturnValueOnce(
        APPROVER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST as ListColumn[]
      );

      harness.detectChanges();

      expect(harness.component.myOrganisations).toEqual(userOrgs);
      expect(harness.component.selectedOrganisation).toEqual(expectedOrg);
      expect(harness.component.userHasOrganisations).toBe(true);
      expect(harness.component.displayColumnsForOrganisationMemberList).toBe(
        expectedDisplayColumns
      );
    });

    it('should initialise for a MEMBER', () => {
      const userOrgs = [{ organisationId: '1', role: 'MEMBER' } as UserOrganisationDTO];
      const expectedOrg = { id: '1' } as Organisation;
      const expectedDisplayColumns = MEMBER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST;

      sdeOrganisationServiceStub.getUsersOrganisations.mockReturnValueOnce(of(userOrgs));
      sdeOrganisationServiceStub.get.mockReturnValueOnce(of(expectedOrg));
      organisationMemberService.getDisplayColumnsForResearcher.mockReturnValueOnce(
        MEMBER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST as ListColumn[]
      );

      harness.detectChanges();

      expect(harness.component.myOrganisations).toEqual(userOrgs);
      expect(harness.component.selectedOrganisation).toEqual(expectedOrg);
      expect(harness.component.userHasOrganisations).toBe(true);
      expect(harness.component.displayColumnsForOrganisationMemberList).toBe(
        expectedDisplayColumns
      );
    });
  });
});
