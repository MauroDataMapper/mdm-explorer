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
import { ComponentHarness, setupTestModuleForComponent } from '@maurodatamapper/mdm-explorer/app/testing/testing.helpers';
import { createStateRouterStub } from '@maurodatamapper/mdm-explorer/app/testing/stubs/state-router.stub';
import { StateRouterService } from '@maurodatamapper/mdm-explorer/app/core/state-router.service';
import { UserDetailsService } from '@maurodatamapper/mdm-explorer/app/security/user-details.service';
import { ResearchUser, SdeUserService } from '@maurodatamapper/sde-resources';
import { of } from 'rxjs';
import { BroadcastService } from '@maurodatamapper/mdm-explorer/app/core/broadcast.service';

describe('SdeAuthenticationFinalizeComponent', () => {
  let harness: ComponentHarness<SdeAuthenticationFinalizeComponent>;

  const stateRouterStub = createStateRouterStub();
  const userDetailsStub = {
    setSdeResearchUser: jest.fn(),
    clearSdeResearchUser: jest.fn(),
    sdeSetUserOrganisationMembership: jest.fn(),
  };
  const sdeUserServiceStub = {
    isSdeUserAMemberOfAnOrganisation: jest.fn(),
  };
  const broadcastStub = {
    sdeUserOrganisationStatusUpdated: jest.fn(),
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
        {
          provide: SdeUserService,
          useValue: sdeUserServiceStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
      ],
    });
  });

  beforeEach(() => {
    stateRouterStub.navigateTo.mockClear();
    userDetailsStub.clearSdeResearchUser.mockClear();
    userDetailsStub.setSdeResearchUser.mockClear();
    userDetailsStub.sdeSetUserOrganisationMembership.mockClear();
    sdeUserServiceStub.isSdeUserAMemberOfAnOrganisation.mockClear();
    broadcastStub.sdeUserOrganisationStatusUpdated.mockClear();
  });

  describe('sign-in-success', () => {
    it('should get user details, set org membership, broadcast status, and redirect', fakeAsync(() => {
      const userDetailsSpy = jest.spyOn(userDetailsStub, 'setSdeResearchUser');
      const stateRouterSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');
      const sdeUserServiceSpy = jest.spyOn(sdeUserServiceStub, 'isSdeUserAMemberOfAnOrganisation');
      const broadcastSpy = jest.spyOn(broadcastStub, 'sdeUserOrganisationStatusUpdated');

      const expectedUser = {
        id: '1234',
        email: 'user@test.com',
        isDeleted: false,
      } as ResearchUser;

      sdeUserServiceSpy.mockReturnValue(of(true));

      harness.component.signInSuccess(expectedUser);

      tick();

      expect(userDetailsSpy).toHaveBeenCalledWith(expectedUser);
      expect(sdeUserServiceSpy).toHaveBeenCalledWith(expectedUser.id);
      expect(userDetailsStub.sdeSetUserOrganisationMembership).toHaveBeenCalledWith(true);
      expect(broadcastSpy).toHaveBeenCalledWith(true);
      expect(stateRouterSpy).toHaveBeenCalledWith('/dashboard');
    }));
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
