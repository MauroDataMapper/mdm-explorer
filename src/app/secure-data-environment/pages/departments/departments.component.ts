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
  Department,
  DepartmentMemberService,
  ListColumn,
  MEMBER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST,
  MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST,
  UserOrganisationDTO,
  RequestFilterMode,
  UserDepartmentDTO,
  Uuid,
  Organisation,
  OrganisationType,
} from '@maurodatamapper/sde-resources';
import { SdeDepartmentService } from '../../services/sde-department.service';
import { SdeOrganisationService } from '../../services/sde-organisation.service';
import { switchMap, EMPTY, of, forkJoin } from 'rxjs';
@Component({
  selector: 'mdm-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
})
export class DepartmentsComponent implements OnInit {
  displayColumns: ListColumn[] = MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST;

  organisation: UserOrganisationDTO | undefined = undefined;
  organisationForList: Organisation = {
    id: 'uuid',
    organisationFriendlyName: 'uuid',
    organisationLegalName: 'uuid',
    organisationType: OrganisationType.UNIVERSITY,
    organisationWebsite: 'uuid',
    countryOfRegistration: 'uuid',
    smallMediumBusinessStatus: false,
  } as Organisation;
  selectedDepartment: Department | undefined = undefined;
  selectedDepartmentId = this.selectedDepartment?.id;
  displayColumnsForOrganisationMemberList: ListColumn[] =
    MEMBER_DISPLAY_COLUMNS_FOR_ORG_MEMBER_LIST;
  displayColumnsForDepartmentMemberList: ListColumn[] = [];
  myDepartments: UserDepartmentDTO[] = [];
  userHasOrganisation = true;
  userHasDepartments = true;
  userIsApproverForSelectedDepartment = false;

  requestsNeedingApprovalListConfig: RequestFilterMode = RequestFilterMode.CanAuthorise;
  myRequestsListConfig: RequestFilterMode = RequestFilterMode.MyDepartmentRequests;

  constructor(
    private sdeOrganisationService: SdeOrganisationService,
    private sdeDepartmentService: SdeDepartmentService,
    private departmentMemberService: DepartmentMemberService
  ) {}

  ngOnInit(): void {
    this.sdeOrganisationService
      .getUsersOrganisation()
      .pipe(
        switchMap((userOrg: UserOrganisationDTO) => {
          if (userOrg === undefined) {
            this.userHasOrganisation = false;
            return EMPTY;
          }
          this.organisation = userOrg;
          this.organisationForList = {
            id: userOrg.organisationId,
            organisationFriendlyName: userOrg.organisationFriendlyName,
            organisationLegalName: userOrg.organisationFriendlyName,
            organisationType: OrganisationType.UNIVERSITY,
            organisationWebsite: 'uuid',
            countryOfRegistration: 'uuid',
            smallMediumBusinessStatus: false,
          } as Organisation;

          return of();
        })
      )
      .subscribe(() => {});
    this.sdeDepartmentService
      .getUsersDepartments()
      .pipe(
        switchMap((userDepts: UserDepartmentDTO[]) => {
          // NOTE: It is no longer necessary that a user have a department membership. However,
          //       they will always have an organisation membership.
          //
          // Theoretically, a user should always have an department. If they don't, trigger
          // a flag to show a message to the user.
          if (userDepts.length === 0) {
            this.userHasDepartments = false;
            return EMPTY;
          }
          this.myDepartments = userDepts;
          const initialDeptValue = this.myDepartments[0] as UserDepartmentDTO;

          return forkJoin([
            this.sdeDepartmentService.get(initialDeptValue.departmentId),
            of(userDepts),
          ]);
        })
      )
      .subscribe(([initialDept, userDepts]: [Department, UserDepartmentDTO[]]) => {
        this.setSelectedDepartmentAndDisplayColumns(initialDept, userDepts);
      });
  }

  onDepartmentSelectEvent(value: UserDepartmentDTO) {
    const selectedDepId = value.departmentId as Uuid;
    this.sdeDepartmentService.get(selectedDepId).subscribe((dept: Department | undefined) => {
      this.setSelectedDepartmentAndDisplayColumns(dept, this.myDepartments);
    });
  }

  /**
   * Each time the user selects a new department, we need to modify what information they are
   * allowed to see. Therefore the department and userRole info need to be updated and passed into
   * the department member list component.
   */
  private setSelectedDepartmentAndDisplayColumns(
    selectedDept: Department | undefined,
    userDepts: UserDepartmentDTO[]
  ) {
    // Find the user's role at the selected department.
    const userRoleAtSelectedDept = userDepts.find(
      (dept) => dept.departmentId === selectedDept?.id
    )?.role;

    // If no department or role, keep the selectedDepartment value as it's default: undefined.
    // An error message will be displayed to the user.
    if (!selectedDept || !userRoleAtSelectedDept) {
      return;
    }

    this.selectedDepartment = selectedDept;
    this.userIsApproverForSelectedDepartment = userRoleAtSelectedDept === 'APPROVER';

    this.displayColumnsForDepartmentMemberList =
      this.departmentMemberService.getDisplayColumnsForResearcher(userRoleAtSelectedDept);
  }
}
