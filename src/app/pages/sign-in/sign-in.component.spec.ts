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
import { FeaturesService } from 'src/app/core/features.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';
import {
  SignInClickEvent,
  SignInFormComponent,
} from 'src/app/security/sign-in-form/sign-in-form.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { SignInComponent } from './sign-in.component';
import { MockComponent } from 'ng-mocks';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { of, throwError } from 'rxjs';
import { PublicOpenIdConnectProvider } from '@maurodatamapper/mdm-resources';
import { UserDetails } from 'src/app/security/user-details.service';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { LoginError, SignInErrorType } from 'src/app/security/security.types';
import { HttpErrorResponse } from '@angular/common/http';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createSdeAuthenticationEndpointsStub } from 'src/app/testing/stubs/sde/sde-authentication-endpoints.stub';
import { AuthenticationEndpoints } from 'src/app/secure-data-environment/endpoints/authentication.endpoints';

interface BroadcastServiceStub {
  userSignedIn: jest.Mock;
}

describe('SignInComponent', () => {
  let harness: ComponentHarness<SignInComponent>;

  const featuresStub = {
    useOpenIdConnect: false,
  };

  const securityStub = createSecurityServiceStub();

  const broadcastStub: BroadcastServiceStub = {
    userSignedIn: jest.fn(),
  };

  const stateRouterStub = createStateRouterStub();

  const sdeAuthenticationStub = createSdeAuthenticationEndpointsStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SignInComponent, {
      declarations: [MockComponent(SignInFormComponent)],
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: FeaturesService,
          useValue: featuresStub,
        },
        {
          provide: AuthenticationEndpoints,
          useValue: sdeAuthenticationStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('Initialisation', () => {
    it('should have no OpenID Connect providers when not switched on', () => {
      featuresStub.useOpenIdConnect = false;
      harness.component.ngOnInit();
      expect(harness.component.openIdConnectProviders).not.toBeDefined();
    });

    it('should have no OpenID Connect providers when none available', () => {
      featuresStub.useOpenIdConnect = true;
      securityStub.getOpenIdConnectProviders.mockImplementationOnce(() => of([]));
      harness.component.ngOnInit();
      expect(harness.component.openIdConnectProviders).toEqual([]);
    });

    it('should have OpenID Connect providers when available', () => {
      const expectedProviders: PublicOpenIdConnectProvider[] = [
        {
          id: '1',
          label: 'test',
          authorizationEndpoint: '/provider/test',
          standardProvider: true,
        },
      ];

      featuresStub.useOpenIdConnect = true;
      securityStub.getOpenIdConnectProviders.mockImplementationOnce(() =>
        of(expectedProviders)
      );
      harness.component.ngOnInit();

      expect(harness.component.openIdConnectProviders).toEqual(expectedProviders);
    });
  });

  describe('Sign in', () => {
    beforeEach(() => {
      securityStub.signIn.mockClear();
      broadcastStub.userSignedIn.mockClear();
      stateRouterStub.navigateToKnownPath.mockClear();
    });

    it('should successfully sign in a user', () => {
      const credentials: SignInClickEvent = {
        userName: 'test',
        password: 'test',
      };

      const expectedUser: UserDetails = {
        id: '1',
        firstName: 'first',
        lastName: 'last',
        email: 'test@test.com',
      };

      const broadcastSpy = jest.spyOn(broadcastStub, 'userSignedIn');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

      securityStub.signIn.mockImplementationOnce(() => of(expectedUser));

      harness.component.signIn(credentials);

      expect(broadcastSpy).toHaveBeenCalledWith(expectedUser);
      expect(stateRouterSpy).toHaveBeenCalledWith('/home');
    });

    it('should fail to sign in an invalid user', () => {
      const broadcastSpy = jest.spyOn(broadcastStub, 'userSignedIn');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

      securityStub.signIn.mockImplementationOnce(() =>
        throwError(
          () =>
            new LoginError(
              new HttpErrorResponse({
                status: 401,
              })
            )
        )
      );

      harness.component.signIn({ userName: 'invalid', password: 'wrong' });

      expect(broadcastSpy).not.toHaveBeenCalled();
      expect(stateRouterSpy).not.toHaveBeenCalled();
      expect(harness.component.signInError).toBe(SignInErrorType.InvalidCredentials);
    });
  });
});
