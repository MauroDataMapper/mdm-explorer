import { Uuid } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { UserDetails } from 'src/app/security/user-details.service';

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
export type SendResetPasswordLinkFn = (email: string) => Observable<boolean>;
export type SendResetPasswordLinkMockedFn = jest.MockedFunction<SendResetPasswordLinkFn>;

export type GetSdeAuthTokenFn = (email: string) => Observable<Uuid>;
export type GetSdeAuthTokenMockedFn = jest.MockedFunction<GetSdeAuthTokenFn>;

export type SecurityIsSignedInFn = () => boolean;
export type SecurityIsSignedInMockedFn = jest.MockedFunction<SecurityIsSignedInFn>;

export type SecurityGetSignedInUserFn = () => UserDetails | null;
export type SecurityGetSignedInUserMockedFn =
  jest.MockedFunction<SecurityGetSignedInUserFn>;

export interface SecurityServiceStub {
  signIn: jest.Mock;
  isSignedIn: SecurityIsSignedInMockedFn;
  getSignedInUser: SecurityGetSignedInUserMockedFn;
  sendResetPasswordLink: SendResetPasswordLinkMockedFn;
  getOpenIdConnectProviders: jest.Mock;
  getSdeAuthToken: GetSdeAuthTokenMockedFn;
}

export const createSecurityServiceStub = (): SecurityServiceStub => {
  return {
    signIn: jest.fn(),
    isSignedIn: jest.fn() as SecurityIsSignedInMockedFn,
    getSignedInUser: jest.fn() as SecurityGetSignedInUserMockedFn,
    sendResetPasswordLink: jest.fn() as SendResetPasswordLinkMockedFn,
    getOpenIdConnectProviders: jest.fn(),
    getSdeAuthToken: jest.fn() as GetSdeAuthTokenMockedFn,
  };
};
