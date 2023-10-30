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
import { catchError, EMPTY, finalize } from 'rxjs';
import { SecurityService } from '../security.service';
import { LoginError, SignInErrorType } from '../security.types';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SdeEndpointsService } from 'src/app/secure-data-environment/sde-endpoints.service';

/**
 * Component to authorize a user session authenticated via an OpenID Connect provider.
 *
 * This acts as the landing page when an OpenID Connect provider redirects back to Mauro after authenticating a user.
 * This page will complete the authorization of a Mauro user session to complete login.
 *
 * The component has 3 states that occur (in order):
 *
 * 1. A user is not signed into Mauro yet - capture the parameters from the OpenID Connect redirect URL containing the
 * authentication session state. Pass those parameters to Mauro's login endpoint.
 *
 * 2. When successfully logged into Mauro, the component will redirect back to itself. The reason why is to remove
 * the extraneous query parameters from the current location URL (a full redirect seems to be the only way to
 * do this, router does not update browser state).
 *
 * 3. If logged into Mauro - update internal state with logged in broadcast messages and navigate to the start page.
 */
@Component({
  selector: 'mdm-open-id-connect-authorize',
  templateUrl: './open-id-connect-authorize.component.html',
  styleUrls: ['./open-id-connect-authorize.component.scss'],
})
export class OpenIdConnectAuthorizeComponent implements OnInit {
  authorizing = true;
  errorMessage = '';

  constructor(
    private security: SecurityService,
    private broadcast: BroadcastService,
    private stateRouter: StateRouterService,
    private sdeEndpoints: SdeEndpointsService
  ) {}

  ngOnInit(): void {
    if (this.security.isSignedIn()) {
      return;
    }

    let query = window.location.search;
    if (!query || query.length === 0) {
      query = window.location.hash.slice(window.location.hash.indexOf('?'));
    }

    const params = new URLSearchParams(query);
    const state = params.get('state');
    const sessionState = params.get('session_state');
    const code = params.get('code');

    if (!state || !sessionState || !code) {
      this.authorizing = false;
      this.errorMessage = 'OpenID Connect session state has not been provided.';
      return;
    }

    const providerId = localStorage.getItem('openIdConnectProviderId');
    if (!providerId) {
      throw new Error('Cannot retrieve OpenID Connect provider identifier.');
    }

    // Was an SDE OpenID Provider tracked as well? If so, this will be auto signed-in
    // straight after this
    const sdeProviderName = localStorage.getItem('sdeOpenIdConnectProviderName');

    this.security
      .authorizeOpenIdConnectSession({
        providerId,
        state,
        sessionState,
        code,
      })
      .pipe(
        catchError((error: LoginError) => {
          switch (error.type) {
            case SignInErrorType.InvalidCredentials:
              this.errorMessage = 'Invalid username or password!';
              break;
            case SignInErrorType.AlreadySignedIn:
              this.errorMessage = 'A user is already signed in, please sign out first.';
              break;
            default:
              this.errorMessage = 'Unable to sign in. Please try again later.';
              break;
          }

          return EMPTY;
        }),
        finalize(() => (this.authorizing = false))
      )
      .subscribe((user) => {
        if (!sdeProviderName) {
          this.broadcast.userSignedIn(user);
          this.stateRouter.navigateToKnownPath('/dashboard');
          return;
        }

        // Auto single sign-on to SDE. There is a big assumption that the OpenID Connect
        // provider that just succeeded for Mauro is configured exactly the same as for this
        // SDE provider, so that the sign-in is seamless
        const redirectUrl =
          this.sdeEndpoints.authentication.getOpenIdConnectAuthorizationUrl(
            sdeProviderName
          );

        window.open(redirectUrl.toString(), '_self');
      });
  }
}
