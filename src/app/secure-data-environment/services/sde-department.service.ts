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
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import {
  Uuid,
  Organisation,
  UserOrganisationDTO,
  OrganisationEndpoints,
} from '@maurodatamapper/sde-resources';

@Injectable({
  providedIn: 'root',
})
export class SdeDepartmentService {
  private _organisations = new BehaviorSubject<Organisation[]>([]);

  constructor(private organisationEndpoints: OrganisationEndpoints) {}

  get organisations$(): Observable<Organisation[]> {
    return this._organisations.asObservable();
  }

  get organisations(): Organisation[] {
    return this._organisations.value;
  }

  get(organisationId: Uuid): Observable<Organisation> {
    const cachedOrg = this.organisations.find((org) => org.id === organisationId);
    return cachedOrg ? of(cachedOrg) : this.fetch(organisationId);
  }

  getUsersOrganisations(): Observable<UserOrganisationDTO[]> {
    return this.organisationEndpoints.listResearchersOrganisationMemberships();
  }

  addOrganisationToCache(organisation: Organisation): void {
    this._organisations.next([...this.organisations, organisation]);
  }

  private fetch(organisationId: Uuid): Observable<Organisation> {
    return this.organisationEndpoints.getOrganisation(organisationId).pipe(
      tap((org: Organisation) => {
        this.addOrganisationToCache(org);
      })
    );
  }
}
