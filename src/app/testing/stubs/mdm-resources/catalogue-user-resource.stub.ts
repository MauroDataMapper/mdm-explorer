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
import {
  CatalogueUser,
  CatalogueUserPayload,
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

export interface MdmCatalogueUserResourceStub {
  get: CatalogueUserGetMockedFn;
  update: CatalogueUserUpdateMockedFn;
  resetPasswordLink: CatalogueUserResetPasswordLinkMockedFn;
}

export const createCatalogueUserStub = (): MdmCatalogueUserResourceStub => {
  return {
    get: jest.fn() as CatalogueUserGetMockedFn,
    update: jest.fn() as CatalogueUserUpdateMockedFn,
    resetPasswordLink: jest.fn() as CatalogueUserResetPasswordLinkMockedFn,
  };
};
