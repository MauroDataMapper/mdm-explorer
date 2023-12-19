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
import {
  CatalogueItemDomainType,
  FolderDetail,
  LoginPayload,
  PublicOpenIdConnectProvider,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { EMPTY } from 'rxjs';
import {
  createMdmEndpointsStub,
  MdmEndpointsServiceStub,
} from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import {
  AuthToken,
  EMPTY_AUTH_TOKEN,
  OpenIdConnectConfiguration,
  OpenIdConnectSession,
  OPENID_CONNECT_CONFIG,
} from './security.types';
import { SecurityService } from './security.service';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { UserDetails, UserDetailsService } from './user-details.service';
import { createSdeUserServiceStub } from '../testing/stubs/sde/sde-user.service.stub';
import { SdeUserService } from '@maurodatamapper/sde-resources';

interface UserDetailsServiceStub {
  set: jest.Mock;
  clear: jest.Mock;
}

describe('SecurityService', () => {
  let service: SecurityService;
  let endpointsStub: MdmEndpointsServiceStub;
  const sdeUserServiceStub = createSdeUserServiceStub();

  const userDetailsStub: UserDetailsServiceStub = {
    set: jest.fn(),
    clear: jest.fn(),
  };

  const openIdConnectConfig: OpenIdConnectConfiguration = {
    redirectUrl: 'http://localhost/oid/test',
  };

  beforeEach(() => {
    endpointsStub = createMdmEndpointsStub();

    service = setupTestModuleForService(SecurityService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: UserDetailsService,
          useValue: userDetailsStub,
        },
        {
          provide: SdeUserService,
          useValue: sdeUserServiceStub,
        },
        {
          provide: OPENID_CONNECT_CONFIG,
          useValue: openIdConnectConfig,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  const setupLoginMocks = (expectedUser: UserDetails) => {
    endpointsStub.security.login.mockImplementationOnce(() =>
      cold('--a|', {
        a: {
          body: {
            id: expectedUser.id,
            emailAddress: expectedUser.email,
            firstName: expectedUser.firstName,
            lastName: expectedUser.lastName,
          },
        },
      })
    );

    endpointsStub.pluginResearch.userFolder.mockImplementationOnce(() =>
      cold('--a|', {
        a: {
          body: {
            id: '9987',
            label: 'expected[at]email.com',
            domainType: 'Folder',
            availableActions: [],
          },
        },
      })
    );
  };

  describe('sign in', () => {
    it.each([
      ['123', 'user@test.com'],
      ['456', 'admin@test.com'],
    ])('should sign in user %p %p', (id, userEmail) => {
      const payload: LoginPayload = {
        username: userEmail,
        password: 'test',
      };

      const expectedDataSpecificationFolder: FolderDetail = {
        id: '9987',
        label: 'expected[at]email.com',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      const expectedUser: UserDetails = {
        id,
        firstName: 'first',
        lastName: 'last',
        email: 'email',
        needsToResetPassword: false,
        role: '',
        token: undefined,
        dataSpecificationFolder: expectedDataSpecificationFolder,
      };

      setupLoginMocks(expectedUser);

      const expected$ = cold('----a|', { a: expectedUser });
      const actual$ = service.signIn(payload);

      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(userDetailsStub.set).toHaveBeenCalledWith(expectedUser);
      });
    });

    it('should throw error if sign in fails', () => {
      endpointsStub.security.login.mockImplementationOnce(() =>
        cold('--#', null, new HttpErrorResponse({}))
      );

      const expected$ = cold('--#');
      const actual$ = service.signIn({ username: 'fail', password: 'fail' });
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('sign out', () => {
    it('should sign out user', () => {
      endpointsStub.security.logout.mockImplementationOnce(() =>
        cold('--a|', { a: EMPTY })
      );

      const expected$ = cold('--a|', { a: undefined });
      const actual$ = service.signOut();
      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(userDetailsStub.clear).toHaveBeenCalled();
      });
    });

    it('should throw error if sign out fails', () => {
      endpointsStub.security.logout.mockImplementationOnce(() =>
        cold('--#', null, new HttpErrorResponse({}))
      );

      const expected$ = cold('--#');
      const actual$ = service.signOut();
      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(userDetailsStub.clear).toHaveBeenCalled();
      });
    });
  });

  describe('sign in to sde', () => {
    it('should sign in to sde', () => {
      const emailAssociatedWithSDE = 'test@email.com';
      const expected = { token: 'valid-token' } as AuthToken;

      sdeUserServiceStub.getSdeAuthToken.mockReturnValueOnce(
        cold('--a|', { a: expected })
      );

      const actual$ = service.signInToSde(emailAssociatedWithSDE);

      expect(actual$).toBeObservable(cold('--a|', { a: expected }));
    });

    it('should return empty token if sde sign in fails', () => {
      const emailNOTAssociatedWithSDE = 'test@email.com';
      const expected = EMPTY_AUTH_TOKEN;

      sdeUserServiceStub.getSdeAuthToken.mockReturnValueOnce(
        cold('--#', new HttpErrorResponse({}))
      );

      const actual$ = service.signInToSde(emailNOTAssociatedWithSDE);

      expect(actual$).toBeObservable(cold('--(a|)', { a: expected }));
    });
  });

  describe('reset password', () => {
    beforeEach(() => {
      endpointsStub.catalogueUser.resetPasswordLink.mockClear();
    });

    it('should return ok when password reset link sent', () => {
      endpointsStub.catalogueUser.resetPasswordLink.mockImplementationOnce(() =>
        cold('--a|', { a: EMPTY })
      );

      const expected$ = cold('--a|', { a: true });
      const actual$ = service.sendResetPasswordLink('test@test.com');
      expect(actual$).toBeObservable(expected$);
    });

    it('should return fail when password rest link has error', () => {
      endpointsStub.catalogueUser.resetPasswordLink.mockImplementationOnce(() =>
        cold('--#', null, new HttpErrorResponse({}))
      );

      const expected$ = cold('--(a|)', { a: false });
      const actual$ = service.sendResetPasswordLink('test@test.com');
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('isAuthenticated', () => {
    it.each([true, false])(
      'should return %o for an authenticated session',
      (authenticated) => {
        endpointsStub.session.isAuthenticated.mockImplementationOnce(() =>
          cold('--a|', {
            a: {
              body: {
                authenticatedSession: authenticated,
              },
            },
          })
        );

        const expected$ = cold('--a|', { a: authenticated });
        const actual$ = service.isAuthenticated();
        expect(actual$).toBeObservable(expected$);
      }
    );

    it('should throw error if authentication fails', () => {
      endpointsStub.session.isAuthenticated.mockImplementationOnce(() =>
        cold('--#', null, new HttpErrorResponse({}))
      );

      const expected$ = cold('--#');
      const actual$ = service.isAuthenticated();
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('OpenID Connect', () => {
    it('should return the OpenID Connect authorization URL', () => {
      const provider: PublicOpenIdConnectProvider = {
        id: '123',
        label: 'Test',
        authorizationEndpoint: 'http://my.oid.provider/login',
        standardProvider: true,
      };

      const expectedUrl = new URL(provider.authorizationEndpoint);
      expectedUrl.searchParams.append(
        'redirect_uri',
        openIdConnectConfig.redirectUrl.toString()
      );

      const actualUrl = service.getOpenIdConnectAuthorizationUrl(provider);
      expect(actualUrl).toEqual(expectedUrl);
    });

    it('should login user via OpenID Connect session', () => {
      const session: OpenIdConnectSession = {
        providerId: '123',
        sessionState: 'session-state',
        state: 'state',
        code: 'code',
      };

      const expectedDataSpecificationFolder: FolderDetail = {
        id: '9987',
        label: 'expected[at]email.com',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      const expectedUser: UserDetails = {
        id: '456',
        firstName: 'first',
        lastName: 'last',
        email: 'test@test.com',
        needsToResetPassword: false,
        role: '',
        token: undefined,
        dataSpecificationFolder: expectedDataSpecificationFolder,
      };

      setupLoginMocks(expectedUser);

      const expected$ = cold('----a|', { a: expectedUser });
      const actual$ = service.authorizeOpenIdConnectSession(session);

      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(userDetailsStub.set).toHaveBeenCalledWith(expectedUser);
      });
    });
  });
});
