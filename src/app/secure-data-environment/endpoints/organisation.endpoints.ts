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
import { Organisation, OrganisationMember } from '../resources/organisation.resources';
import { Observable } from 'rxjs';
import { ISdeRestHandler } from '../sde-rest-handler.interface';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { SdeApiEndPoints } from './endpoints.dictionary';

export class OrganisationEndpoints {
  constructor(private sdeRestHandler: ISdeRestHandler) {}

  listOrganisations(): Observable<Organisation[]> {
    return this.sdeRestHandler.get<Organisation[]>(SdeApiEndPoints.OrganisationList);
  }

  getOrganisation(organisationId: Uuid): Observable<Organisation> {
    return this.sdeRestHandler.get<Organisation>(
      `${SdeApiEndPoints.OrganisationGet}${organisationId}`,
    );
  }

  listOrganisationMembers(organisationId: Uuid): Observable<OrganisationMember[]> {
    return this.sdeRestHandler.get<OrganisationMember[]>(
      `${SdeApiEndPoints.OrganisationMemberList}${organisationId}`,
    );
  }
}
