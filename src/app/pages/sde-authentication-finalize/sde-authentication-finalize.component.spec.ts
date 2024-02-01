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
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserDetailsService } from 'src/app/security/user-details.service';
import { ResearchUser } from '@maurodatamapper/sde-resources';

describe('SdeAuthenticationFinalizeComponent', () => {
  let harness: ComponentHarness<SdeAuthenticationFinalizeComponent>;

  const stateRouterStub = createStateRouterStub();
  const userDetailsStub = {
    setSdeResearchUser: jest.fn(),
    clearSdeResearchUser: jest.fn(),
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SdeAuthenticationFinalizeComponent, {
      providers: [
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
  });

  beforeEach(() => {
    stateRouterStub.navigateTo.mockClear();
    userDetailsStub.clearSdeResearchUser.mockClear();
    userDetailsStub.setSdeResearchUser.mockClear();
  });

  describe('sign-in-success', () => {
    it('should get user details then redirect', () => {
      const userDetailsSpy = jest.spyOn(userDetailsStub, 'setSdeResearchUser');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

      const expectedUser = {
        id: '1234',
        email: 'user@test.com',
        isDeleted: false,
      } as ResearchUser;

      harness.component.signInSuccess(expectedUser);

      expect(userDetailsSpy).toHaveBeenCalledWith(expectedUser);
      expect(stateRouterSpy).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('sign-out', () => {
    it('should clear user details and redirect', fakeAsync(() => {
      const userDetailsSpy = jest.spyOn(userDetailsStub, 'clearSdeResearchUser');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

      harness.component.signOut();

      tick(2000);

      expect(userDetailsSpy).toHaveBeenCalled();
      expect(stateRouterSpy).toHaveBeenCalledWith('/home');
    }));
  });
});
