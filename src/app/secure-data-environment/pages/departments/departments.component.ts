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
import { Component, OnInit } from '@angular/core';
import {
  ListColumn,
  Organisation,
  OrganisationMemberService,
  RequestsListMode,
  UserOrganisationDTO,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { SdeDepartmentService } from '../../services/sde-department.service';
import { switchMap, EMPTY, of, forkJoin } from 'rxjs';

@Component({
  selector: 'mdm-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {
  selectedOrganisation: Organisation | undefined = undefined;
  selectedOrganisationId = this.selectedOrganisation?.id;
  displayColumnsForOrganisationMemberList: ListColumn[] = [];
  myOrganisations: UserOrganisationDTO[] = [];
  userHasOrganisations = true;
  userIsApproverForSelectedOrganisation = false;

  requestsNeedingApprovalListConfig: RequestsListMode = RequestsListMode.CanAuthorise;
  myRequestsListConfig: RequestsListMode = RequestsListMode.MyOrganisationRequests;

  constructor(
    private sdeOrganisationService: SdeDepartmentService,
    private organisationMemberService: OrganisationMemberService
  ) { }

  ngOnInit(): void {
    this.sdeOrganisationService
      .getUsersOrganisations()
      .pipe(
        switchMap((userOrgs: UserOrganisationDTO[]) => {
          // Theoretically, a user should always have an organisation. If they don't, trigger
          // a flag to show a message to the user.
          if (userOrgs.length === 0) {
            this.userHasOrganisations = false;
            return EMPTY;
          }

          this.myOrganisations = userOrgs;
          const initialOrgValue = this.myOrganisations[0] as UserOrganisationDTO;

          return forkJoin([
            this.sdeOrganisationService.get(initialOrgValue.organisationId),
            of(userOrgs),
          ]);
        })
      )
      .subscribe(([initialOrg, userOrgs]: [Organisation, UserOrganisationDTO[]]) => {
        this.setSelectedOrganisationAndDisplayColumns(initialOrg, userOrgs);
      });
  }

  onOrganisationSelectEvent(value: UserOrganisationDTO) {
    const selectedOrgId = value.organisationId as Uuid;
    this.sdeOrganisationService
      .get(selectedOrgId)
      .subscribe((org: Organisation | undefined) => {
        this.setSelectedOrganisationAndDisplayColumns(org, this.myOrganisations);
      });
  }

  /**
   * Each time the user selects a new organisation, we need to modify what information they are
   * allowed to see. Therefore the organisation and userRole info need to be updated and passed into
   * the organisation member list component.
   */
  private setSelectedOrganisationAndDisplayColumns(
    selectedOrg: Organisation | undefined,
    userOrgs: UserOrganisationDTO[]
  ) {
    // Find the user's role at the selected organisation.
    const userRoleAtSelectedOrg = userOrgs.find(
      (org) => org.organisationId === selectedOrg?.id
    )?.role;

    // If no organisation or role, keep the selectedOrganisation value as it's default: undefined.
    // An error message will be displayed to the user.
    if (!selectedOrg || !userRoleAtSelectedOrg) {
      return;
    }

    this.selectedOrganisation = selectedOrg;
    this.userIsApproverForSelectedOrganisation = userRoleAtSelectedOrg === 'APPROVER';

    this.displayColumnsForOrganisationMemberList =
      this.organisationMemberService.getDisplayColumnsForResearcher(
        userRoleAtSelectedOrg
      );
  }
}
