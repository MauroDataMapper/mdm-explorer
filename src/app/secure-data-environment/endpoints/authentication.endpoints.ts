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
import { environment } from 'src/environments/environment';
import { SdeRestHandler } from '@maurodatamapper/sde-resources';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationEndpoints {
  constructor(private sdeRestHandler: SdeRestHandler) {}

  listOpenIdConnectProviders(): Observable<SdeOpenIdConnectProvider[]> {
    return this.sdeRestHandler.get<string[]>('/authentication/oauth/providers').pipe(
      map((providers: string[]) => providers ?? []),
      map((providers: string[]) =>
        sdeOpenIdConnectProviders.filter((oidcProvider) =>
          providers.includes(oidcProvider.name)
        )
      )
    );
  }

  getOpenIdConnectAuthorizationUrl(providerName: string): URL {
    // Micronaut backend provides a standard URL route to redirect to
    return new URL(environment.sdeResearcherEndpoint + `/oauth/login/${providerName}`);
  }

  getSignOutUrl(): string {
    return `${environment.sdeResearcherEndpoint}/logout`;
  }

  getUserDetails(): Observable<SdeResearchUser> {
    return this.sdeRestHandler.get<SdeResearchUser>('/authentication/user/details');
  }
}
