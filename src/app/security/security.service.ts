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
import { HttpErrorResponse } from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import {
  AuthenticatedResponse,
  FolderDetail,
  LoginPayload,
  LoginResponse,
  PublicOpenIdConnectProvider,
  PublicOpenIdConnectProvidersIndexResponse,
} from '@maurodatamapper/mdm-resources';
import {
  catchError,
  concatMap,
  EMPTY,
  finalize,
  map,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { MdmHttpError } from '../mauro/mauro.types';
import {
  AuthenticatedSessionError,
  AuthToken,
  EMPTY_AUTH_TOKEN,
  LoginError,
  OpenIdConnectConfiguration,
  OpenIdConnectSession,
  OPENID_CONNECT_CONFIG,
} from './security.types';
import { UserDetails, UserDetailsService } from './user-details.service';
import { ResearchPluginService } from '../mauro/research-plugin.service';
import { SdeUserService } from '../secure-data-environment/services/sde-user.service';
import { SdeResearchUser } from '../secure-data-environment/resources/authentication.resources';

/**
 * Manages security operations on Mauro user interfaces.
 *
 * You will need to provide and `InjectionToken` for the {@link OPENID_CONNECT_CONFIG} token, which is required
 * to provide configuration details on knowing where certain redirect URLs are in your application.
 */
@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  constructor(
    private endpoints: MdmEndpointsService,
    private sdeUserService: SdeUserService,
    private userDetails: UserDetailsService,
    @Optional()
    @Inject(OPENID_CONNECT_CONFIG)
    private openIdConnectConfig: OpenIdConnectConfiguration,
    private researchPlugin: ResearchPluginService
  ) {}

  /**
   * Log in a user to the Mauro system, and get or create a folder for their data specifications.
   *
   * @param credentials The login credentials to use.
   * @returns An observable to return a `UserDetails` object representing the logged in user.
   * @throws {@link LoginError} in the observable chain if login failed.
   */
  signIn(credentials: LoginPayload): Observable<UserDetails> {
    // This parameter is very important as we do not want to handle 401 if user credential is rejected on login modal form
    // as if the user credentials are rejected Back end server will return 401, we should not show the login modal form again
    return this.endpoints.security.login(credentials, { login: true }).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => new LoginError(error))),
      map((loginResponse: LoginResponse) => {
        const login = loginResponse.body;
        const user: UserDetails = {
          id: login.id,
          token: login.token,
          firstName: login.firstName,
          lastName: login.lastName,
          email: login.emailAddress,
          role: login.userRole?.toLowerCase() ?? '',
          needsToResetPassword: login.needsToResetPassword ?? false,
        };

        return user;
      }),
      concatMap((user: UserDetails) => {
        return this.researchPlugin.userFolder().pipe(
          map((folder: FolderDetail) => {
            user.dataSpecificationFolder = folder;
            this.userDetails.set(user);

            return user;
          })
        );
      })
    );
  }

  signInToSde(email: string): Observable<AuthToken> {
    return this.sdeUserService.getSdeAuthToken(email).pipe(
      catchError((error: HttpErrorResponse): Observable<AuthToken> => {
        console.log(`Status: ${error.status} | Message: ${error.message}`);

        // If error, then print the error and set the token to the empty string.
        return of(EMPTY_AUTH_TOKEN);
      })
    );
  }

  /**
   * Logs the current user out of the Mauro system.
   *
   * @returns An `Observable<never>` to subscribe to when logout is successful.
   * @throws `MdmHttpError` in the observable stream if logout failed.
   */
  signOut(): Observable<void> {
    return this.endpoints.security.logout({ responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new MdmHttpError(error));
      }),
      map(() => {}),
      finalize(() => {
        this.userDetails.clear();
        this.userDetails.clearSdeResearchUser();
      })
    );
  }

  /**
   * Send a password rest link to a user.
   *
   * @param email The email address of the user to send the reset link to.
   * @returns An observable of true or false depending on success.
   */
  sendResetPasswordLink(email: string): Observable<boolean> {
    return this.endpoints.catalogueUser.resetPasswordLink(email).pipe(
      switchMap(() => of(true)),
      catchError(() => of(false))
    );
  }

  /**
   * Check if the current user session is authenticated. Will return `true` if signed in and the session
   * is still active.
   *
   * @returns An observable returning a boolean stating if the current session is authenticated.
   * @throws `MdmResourcesError` in the observable stream if the request failed.
   */
  isAuthenticated(): Observable<boolean> {
    return this.endpoints.session.isAuthenticated().pipe(
      catchError((error: HttpErrorResponse) =>
        throwError(() => new AuthenticatedSessionError(error))
      ),
      map((response: AuthenticatedResponse) => response.body.authenticatedSession)
    );
  }

  /**
   * Determines if the current user is signed in.
   *
   * @returns True if the current user is signed in.
   */
  isSignedIn(): boolean {
    return !!this.userDetails.get();
  }

  isSignedInToSde(): boolean {
    return !!this.userDetails.getSdeResearchUser();
  }

  /**
   * Gets the details of the current signed in user, or will get null if no user is signed in.
   *
   * @returns A {@link UserDetails} object or null if there is none.
   */
  getSignedInUser(): UserDetails | null {
    return this.userDetails.get();
  }

  getSignedInSdeResearchUser(): SdeResearchUser | null {
    return this.userDetails.getSdeResearchUser();
  }

  /**
   * Check if the current session is expired. If not signed in this returns `false`.
   *
   * @returns An observable that returns `true` if the current session has expired.
   */
  isCurrentSessionExpired(): Observable<boolean> {
    if (!this.isSignedIn()) {
      return of(false);
    }

    return this.isAuthenticated().pipe(
      catchError((error: AuthenticatedSessionError) => {
        if (error.invalidated) {
          this.userDetails.clear();
          this.userDetails.clearSdeResearchUser();
          return of(true);
        }

        return of(false);
      }),
      tap((authenticated) => {
        if (!authenticated) {
          this.userDetails.clear();
          this.userDetails.clearSdeResearchUser();
        }
      })
    );
  }

  /**
   * Get all available OpenID Connect providers. If not available or not configured, this will return an empty
   * observable.
   */
  getOpenIdConnectProviders(): Observable<PublicOpenIdConnectProvider[]> {
    // If unable to get OpenID Connect providers, silently fail and ignore
    const requestOptions = {
      handleGetErrors: false,
    };

    return this.endpoints.pluginOpenIdConnect.listPublic({}, requestOptions).pipe(
      catchError(() => EMPTY),
      map((response: PublicOpenIdConnectProvidersIndexResponse) => response.body)
    );
  }

  /**
   * Get the authorization URL for an OpenID Connect provider.
   *
   * @param provider The OpenID Connect provider to redirect to.
   * @returns The authorization URL to redirect to.
   *
   * @see {@link SecurityService.authorizeOpenIdConnectSession}
   */
  getOpenIdConnectAuthorizationUrl(provider: PublicOpenIdConnectProvider): URL {
    if (!this.openIdConnectConfig) {
      throw new Error(
        'OPENID_CONNECT_CONFIG injection token is missing - requires redirectUrl to come back to'
      );
    }

    const authorizeUrl = new URL(provider.authorizationEndpoint);

    // Set the page URL to come back to once the provider has authenticated the user
    const redirectUri = this.openIdConnectConfig.redirectUrl;
    authorizeUrl.searchParams.append('redirect_uri', redirectUri);

    return authorizeUrl;
  }

  /**
   * Log in a user that was authenticated via an OpenID Connect provider.
   *
   * @param params The session state parameters provided by the OpenID Connect provider.
   * @returns An observable to return a `UserDetails` object representing the signed in user.
   * @throws `SignInError` in the observable chain if sign-in failed.
   *
   * @see {@link SecurityHandlerService.authenticateWithOpenIdConnect}
   */
  authorizeOpenIdConnectSession(params: OpenIdConnectSession): Observable<UserDetails> {
    return this.signIn({
      openidConnectProviderId: params.providerId,
      state: params.state,
      sessionState: params.sessionState,
      code: params.code,
      redirectUri: this.openIdConnectConfig.redirectUrl.toString(),
    });
  }
}
