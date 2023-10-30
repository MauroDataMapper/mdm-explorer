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
import { Observable, map } from 'rxjs';
import {
  SdeOpenIdConnectProvider,
  SdeResearchUser,
  sdeOpenIdConnectProviders,
} from '../resources/authentication.resources';
import { ISdeRestHandler } from '../sde-rest-handler.interface';
import { SdeApiEndPoints } from './endpoints.dictionary';
import { environment } from 'src/environments/environment';

export class AuthenticationEndpoints {
  constructor(private sdeRestHandler: ISdeRestHandler) {}

  listOpenIdConnectProviders(): Observable<SdeOpenIdConnectProvider[]> {
    return this.sdeRestHandler
      .get<string[]>(SdeApiEndPoints.AuthenticationListOpenIdConnectProviders)
      .pipe(
        map((providers) => providers ?? []),
        map((providers) =>
          sdeOpenIdConnectProviders.filter((oidcProvider) =>
            providers.includes(oidcProvider.name)
          )
        )
      );
  }

  getOpenIdConnectAuthorizationUrl(provider: SdeOpenIdConnectProvider): URL {
    // Micronaut backend provides a standard URL route to redirect to
    return new URL(environment.sdeResearcherEndpoint + `/oauth/login/${provider.name}`);
  }

  getSignOutUrl(): string {
    return `${environment.sdeResearcherEndpoint}/logout`;
  }

  getUserDetails(): Observable<SdeResearchUser> {
    return this.sdeRestHandler.get<SdeResearchUser>(
      SdeApiEndPoints.AuthenticationUserDetailsGet
    );
  }
}
