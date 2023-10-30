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
import { fakeAsync, tick } from '@angular/core/testing';
import { SdeAuthenticationFinalizeComponent } from './sde-authentication-finalize.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { Params, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserDetailsService } from 'src/app/security/user-details.service';
import { createSdeEndpointsStub } from 'src/app/testing/stubs/sde-endpoints.stub';
import { SdeEndpointsService } from 'src/app/secure-data-environment/sde-endpoints.service';
import { SdeResearchUser } from 'src/app/secure-data-environment/resources/authentication.resources';

describe('SdeAuthenticationFinalizeComponent', () => {
  let harness: ComponentHarness<SdeAuthenticationFinalizeComponent>;

  const sdeEndpointsStub = createSdeEndpointsStub();
  const stateRouterStub = createStateRouterStub();
  const userDetailsStub = {
    setSdeResearchUser: jest.fn(),
    clearSdeResearchUser: jest.fn(),
  };

  const setupComponentTest = async (params?: Params) => {
    const route: ActivatedRoute = {
      params: of(params),
    } as ActivatedRoute;

    harness = await setupTestModuleForComponent(SdeAuthenticationFinalizeComponent, {
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route,
        },
        {
          provide: SdeEndpointsService,
          useValue: sdeEndpointsStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: UserDetailsService,
          useValue: userDetailsStub,
        },
      ],
    });
  };

  beforeEach(() => {
    stateRouterStub.navigateTo.mockClear();
    userDetailsStub.clearSdeResearchUser.mockClear();
    userDetailsStub.setSdeResearchUser.mockClear();
  });

  describe('creation', () => {
    beforeEach(async () => {
      await setupComponentTest();
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.action).toBe('');
      expect(harness.component.finalizing).toBe(true);
      expect(harness.component.errorMessage).toBe('');
    });
  });

  describe('sign-in-success', () => {
    beforeEach(async () => {
      await setupComponentTest({ action: 'sign-in-success' });
    });

    it('should get user details then redirect', () => {
      const userDetailsSpy = jest.spyOn(userDetailsStub, 'setSdeResearchUser');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateTo');

      const expectedUser: SdeResearchUser = {
        id: '1234',
        email: 'user@test.com',
        isDeleted: false,
      };

      sdeEndpointsStub.authentication.getUserDetails.mockReturnValue(of(expectedUser));

      harness.component.ngOnInit();

      expect(userDetailsSpy).toHaveBeenCalledWith(expectedUser);
      expect(stateRouterSpy).toHaveBeenCalledWith(['/sde']);
    });
  });

  describe('sign-in-failed', () => {
    beforeEach(async () => {
      await setupComponentTest({ action: 'sign-in-failed' });
    });

    it('should display an error message', fakeAsync(() => {
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateTo');

      harness.component.ngOnInit();

      tick(2000);

      expect(stateRouterSpy).not.toHaveBeenCalled();
      expect(harness.component.errorMessage).not.toBe('');
    }));
  });

  describe('sign-out', () => {
    beforeEach(async () => {
      await setupComponentTest({ action: 'sign-out' });
    });

    it('should clear user details and redirect', fakeAsync(() => {
      const userDetailsSpy = jest.spyOn(userDetailsStub, 'clearSdeResearchUser');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateTo');

      harness.component.ngOnInit();

      tick(2000);

      expect(userDetailsSpy).toHaveBeenCalled();
      expect(stateRouterSpy).toHaveBeenCalledWith(['/sde']);
    }));
  });
});
