/*
Copyright 2022 University of Oxford
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
import { InjectionToken } from '@angular/core';
import { MdmHttpError } from '../mdm-rest-client/mdm-rest-client.types';

export enum SignInErrorType {
  UnknownError,
  InvalidCredentials,
  AlreadySignedIn,
}

/**
 * Represents an error that occurred during login.
 */
export class LoginError extends MdmHttpError {
  /**
   * The type of sign-in error that occurered, represented by the `SignInErrorType` enum constants.
   */
  type: SignInErrorType;

  constructor(response: HttpErrorResponse) {
    super(response);
    switch (response.status) {
      case 401:
        this.type = SignInErrorType.InvalidCredentials;
        break;
      case 409:
        this.type = SignInErrorType.AlreadySignedIn;
        break;
      default:
        this.type = SignInErrorType.UnknownError;
        break;
    }
  }
}

/**
 * Represents an error that occurred during a check for an authenticated session.
 */
export class AuthenticatedSessionError extends MdmHttpError {
  readonly invalidated: boolean;

  constructor(response: HttpErrorResponse) {
    super(response);

    this.invalidated =
      response.status === 500 && response.message === 'Session has been invalidated';
  }
}

export interface OpenIdConnectConfiguration {
  redirectUrl: string;
}

export const OPENID_CONNECT_CONFIG = new InjectionToken<OpenIdConnectConfiguration>(
  'OpenID Connect Configuration'
);

export interface OpenIdConnectSession {
  providerId: string;
  state: string;
  sessionState: string;
  code: string;
}

// eslint-disable-next-line no-useless-escape
export const defaultEmailPattern =
  /^[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+(\.[_A-Za-z0-9-'!#%&=\/~\`\+\$\*\?\^\{\|\}]+)*@[_A-Za-z0-9-\+]+(\.[_A-Za-z0-9-\+]+)*(\.[A-Za-z]{2,})$/;

export const AUTHORIZATION_REDIRECT_URL = new InjectionToken<string>(
  'Authorization Redirect URL'
);
