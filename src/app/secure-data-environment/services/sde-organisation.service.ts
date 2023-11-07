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
import {
  Organisation,
  OrganisationEndpoints,
  OrganisationMemberDTO,
  UserOrganisationDto,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';

// Responsible for retrieving, caching, and updating organisation data.
@Injectable({
  providedIn: 'root',
})
export class SdeOrganisationService {
  private _organisationData = new BehaviorSubject<Organisation[]>([]);

  constructor(private organisationEndpoints: OrganisationEndpoints) {}

  get organisationData$(): Observable<Organisation[]> {
    return this._organisationData.asObservable();
  }

  get organisationData(): Organisation[] {
    return this._organisationData.value;
  }

  get(organisationId: Uuid): Observable<Organisation> {
    const cachedOrg = this.organisationData.find((org) => org.id === organisationId);
    return cachedOrg ? of(cachedOrg) : this.fetch(organisationId);
  }

  fetch(organisationId: Uuid): Observable<Organisation> {
    return this.organisationEndpoints.getOrganisation(organisationId).pipe(
      tap((org: Organisation) => {
        this._organisationData.next([...this.organisationData, org]);
      })
    );
  }

  getUsersOrganisations(): Observable<UserOrganisationDto[]> {
    return this.organisationEndpoints.listResearchersOrganisationMemberships();
  }

  getApproversForOrganisation(organisationId: Uuid): Observable<OrganisationMemberDTO[]> {
    return this.organisationEndpoints.listOrganisationApproversAndProjectPeers(
      organisationId
    );
  }
}
