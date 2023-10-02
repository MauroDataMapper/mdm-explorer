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
import { Observable } from 'rxjs';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { SdeApiEndPoints } from './endpoints.dictionary';
import { AdminUser, ResearchUser } from '../resources/users.resources';
import { Injectable } from '@angular/core';
import { SdeRestHandler } from '../sde-rest-handler';
import { AuthToken } from 'src/app/security/security.types';

@Injectable({
  providedIn: 'root',
})
export class UserEndpoints {
  constructor(private sdeRestHandler: SdeRestHandler) { }

  getAdminUser(userId: Uuid): Observable<AdminUser> {
    return this.sdeRestHandler.get<AdminUser>(`${SdeApiEndPoints.AdminUserGet}${userId}`);
  }

  getResearchUser(userId: Uuid): Observable<ResearchUser> {
    return this.sdeRestHandler.get<ResearchUser>(
      `${SdeApiEndPoints.ResearchUserGet}${userId}`
    );
  }

  impersonate(email: string): Observable<AuthToken> {
    const body = { email };
    return this.sdeRestHandler.post<AuthToken>(`${SdeApiEndPoints.Impersonate}`, body);
  }
}
