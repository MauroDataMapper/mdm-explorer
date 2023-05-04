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
import { Injectable } from '@angular/core';
import { ISdeRestHandler } from '../sde-rest-handler.interface';
import { Organisation, OrganisationMember } from '../resources/organisation.resources';
import { SdeApiEndPoints } from '../endpoints/endpoints.dictionary';
import { of } from 'rxjs';
import { AdminUser, ResearchUser } from '../resources/users.resources';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { FakeResources } from './fake-resources';

@Injectable({
  providedIn: 'root',
})
export class FakeSdeRestHandler implements ISdeRestHandler {
  constructor(private fakeResources: FakeResources) {}

  get(url: string): any {
    if (url === SdeApiEndPoints.OrganisationList) {
      return of(this.getOrganisationList());
    } else if (url.startsWith(SdeApiEndPoints.OrganisationGet)) {
      return of(this.getOrganisation(url));
    } else if (url.startsWith(SdeApiEndPoints.OrganisationMemberList)) {
      return of(this.getOrganisationMemberList(url));
    } else if (url.startsWith(SdeApiEndPoints.AdminUserGet)) {
      return of(this.getAdminUser(url));
    } else if (url.startsWith(SdeApiEndPoints.ResearchUserGet)) {
      return of(this.getResearchUser(url));
    }
  }

  private getIdFromUrl(url: string) {
    const splitUrl = url.split('?');
    if (splitUrl.length === 2) {
      return splitUrl[1];
    }
    throw new Error('Unable to find id in url string');
  }

  private getOrganisation(url: string): Organisation {
    const id: Uuid = this.getIdFromUrl(url);
    const organisation = this.fakeResources.organisations.find((org) => org.id === id);
    if (organisation == null) {
      throw new Error('Organisation not found');
    }
    return organisation;
  }

  private getOrganisationList(): Organisation[] {
    return this.fakeResources.organisations;
  }

  private getOrganisationMember(url: string): OrganisationMember {
    const id: Uuid = this.getIdFromUrl(url);
    const organisationMember = this.fakeResources.organisationMembers.find(
      (orgMember) => orgMember.id === id
    );
    if (organisationMember == null) {
      throw new Error('Organisation Member not found');
    }
    return organisationMember;
  }

  private getOrganisationMemberList(url: string): OrganisationMember[] {
    const id: Uuid = this.getIdFromUrl(url);
    const organisationMembers = this.fakeResources.organisationMembers.filter(
      (orgMember) => orgMember.organisationId === id
    );
    if (organisationMembers == null) {
      throw new Error('Organisation Members not found');
    }
    return organisationMembers;
  }

  private getAdminUser(url: string): AdminUser {
    const id: Uuid = this.getIdFromUrl(url);
    const adminUser = this.fakeResources.adminUsers.find((user) => user.id === id);
    if (adminUser == null) {
      throw new Error('Admin user not found');
    }
    return adminUser;
  }

  private getResearchUser(url: string): ResearchUser {
    const id: Uuid = this.getIdFromUrl(url);
    const researchUser = this.fakeResources.researchUsers.find((user) => user.id === id);
    if (researchUser == null) {
      throw new Error('Research user not found');
    }
    return researchUser;
  }
}
