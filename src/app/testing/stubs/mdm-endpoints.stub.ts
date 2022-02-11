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
export interface MdmApiPropertiesResourceStub {
  listPublic: jest.Mock;
}

export type CatalogueUserResetPasswordLinkFn = (email: string) => any;
export type CatalogueUserResetPasswordLinkMockedFn = jest.MockedFunction<CatalogueUserResetPasswordLinkFn>;

export interface MdmCatalogueUserResourceStub {
  resetPasswordLink: CatalogueUserResetPasswordLinkMockedFn;
}

export interface MdmSecurityResourceStub {
  login: jest.Mock;
  logout: jest.Mock;
}

export interface MdmSessionResourceStub {
  isApplicationAdministration: jest.Mock;
  isAuthenticated: jest.Mock;
}

export interface MdmEndpointsServiceStub {
  apiProperties: MdmApiPropertiesResourceStub;
  catalogueUser: MdmCatalogueUserResourceStub;
  security: MdmSecurityResourceStub;
  session: MdmSessionResourceStub;
}

export const createMdmEndpointsStub = (): MdmEndpointsServiceStub => {
  return {
    apiProperties: {
      listPublic: jest.fn()
    },
    catalogueUser: {
      resetPasswordLink: jest.fn() as CatalogueUserResetPasswordLinkMockedFn
    },
    security: {
      login: jest.fn(),
      logout: jest.fn()
    },
    session: {
      isApplicationAdministration: jest.fn(),
      isAuthenticated: jest.fn()
    }
  };
};
