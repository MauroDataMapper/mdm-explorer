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
import { MdmResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { UserPreferences } from 'src/app/data-explorer/bookmark.service';
import {
  CatalogueUser,
  CatalogueUserPayload,
  ChangePasswordPayload,
} from 'src/app/mauro/catalogue-user.service';

export type CatalogueUserGetFn = (id: Uuid) => Observable<MdmResponse<CatalogueUser>>;
export type CatalogueUserGetMockedFn = jest.MockedFunction<CatalogueUserGetFn>;

export type CatalogueUserUpdateFn = (
  id: Uuid,
  data: CatalogueUserPayload
) => Observable<MdmResponse<CatalogueUser>>;
export type CatalogueUserUpdateMockedFn = jest.MockedFunction<CatalogueUserUpdateFn>;

export type CatalogueUserResetPasswordLinkFn = (email: string) => any;
export type CatalogueUserResetPasswordLinkMockedFn =
  jest.MockedFunction<CatalogueUserResetPasswordLinkFn>;

export type CatalogueUserPreferencesFn = (id: string) => any;
export type CatalogueUserPreferencesMockedFn =
  jest.MockedFunction<CatalogueUserPreferencesFn>;

export type CatalogueUserUpdatePreferencesFn = (id: string, data: UserPreferences) => any;
export type CatalogueUserUpdatePreferencesMockedFn =
  jest.MockedFunction<CatalogueUserUpdatePreferencesFn>;

export type CatalogueUserChangePasswordFn = (
  id: Uuid,
  payload: ChangePasswordPayload
) => Observable<MdmResponse<CatalogueUser>>;

export interface MdmCatalogueUserResourceStub {
  get: CatalogueUserGetMockedFn;
  update: CatalogueUserUpdateMockedFn;
  resetPasswordLink: CatalogueUserResetPasswordLinkMockedFn;
  userPreferences: CatalogueUserPreferencesMockedFn;
  updateUserPreferences: CatalogueUserUpdatePreferencesMockedFn;
  changePassword: jest.MockedFunction<CatalogueUserChangePasswordFn>;
}

export const createCatalogueUserStub = (): MdmCatalogueUserResourceStub => {
  return {
    get: jest.fn() as CatalogueUserGetMockedFn,
    update: jest.fn() as CatalogueUserUpdateMockedFn,
    resetPasswordLink: jest.fn() as CatalogueUserResetPasswordLinkMockedFn,
    userPreferences: jest.fn() as CatalogueUserPreferencesMockedFn,
    updateUserPreferences: jest.fn() as CatalogueUserUpdatePreferencesMockedFn,
    changePassword: jest.fn() as jest.MockedFunction<CatalogueUserChangePasswordFn>,
  };
};
