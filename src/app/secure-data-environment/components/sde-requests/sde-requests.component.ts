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
import { RequestsListMode, MembershipEndpointsResearcher } from '@maurodatamapper/sde-resources';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'mdm-sde-requests',
  templateUrl: './sde-requests.component.html',
  styleUrls: ['./sde-requests.component.scss'],
})
export class SdeRequestsComponent implements OnInit {
  canAuthorise = false;

  requestsListConfig: RequestsListMode = RequestsListMode.CreatedByMe;
  requestsNeedingApprovalListConfig: RequestsListMode = RequestsListMode.CanAuthorise;

  constructor(private membershipEndpointsResearcher: MembershipEndpointsResearcher) {}

  ngOnInit(): void {
    this.userCanAuthoriseRequests();
  }

  private userCanAuthoriseRequests() {
    forkJoin({
      departments: this.membershipEndpointsResearcher.listDepartments(),
      projects: this.membershipEndpointsResearcher.listProjects(),
    }).subscribe(({ departments, projects }) => {
      this.canAuthorise =
        !!departments.find((department) => department.role === 'APPROVER') ||
        !!projects.find((project) => project.role === 'MANAGER');
    });
  }
}
