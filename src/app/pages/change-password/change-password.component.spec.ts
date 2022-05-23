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
import { MockComponent } from 'ng-mocks';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  CatalogueUserService,
  ChangePasswordPayload,
} from 'src/app/mauro/catalogue-user.service';
import { ChangePasswordFormComponent } from 'src/app/security/change-password-form/change-password-form.component';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { createCatalogueUserServiceStub } from 'src/app/testing/stubs/catalogue-user.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { ChangePasswordComponent } from './change-password.component';

describe('ChangePasswordComponent', () => {
  let harness: ComponentHarness<ChangePasswordComponent>;
  const securityStub = createSecurityServiceStub();
  const catalogueUserStub = createCatalogueUserServiceStub();
  const stateRouterStub = createStateRouterStub();
  const toastrStub = createToastrServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ChangePasswordComponent, {
      declarations: [MockComponent(ChangePasswordFormComponent)],
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: CatalogueUserService,
          useValue: catalogueUserStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
      ],
    });
  });

  beforeEach(() => {
    stateRouterStub.navigateToKnownPath.mockClear();
    toastrStub.error.mockClear();
    toastrStub.success.mockClear();
  });

  const user: UserDetails = {
    id: '123',
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
  };

  const mockImplementGetSignedInUser = () => {
    securityStub.getSignedInUser.mockImplementationOnce(() => user);
  };

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should redirect you if the user is not signed in', () => {
    // Do not prepare signed in user on purpose
    harness.component.ngOnInit();
    expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith('/home');
  });

  it('should initialise when you are signed in', () => {
    mockImplementGetSignedInUser();
    harness.component.ngOnInit();
    expect(harness.component.userDetails).toBe(user);
    expect(stateRouterStub.navigateToKnownPath).not.toHaveBeenCalled();
  });

  it('should redirect to account page when cancelled', () => {
    harness.component.cancel();
    expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith('/account');
  });

  it('should change a user password', () => {
    mockImplementGetSignedInUser();
    harness.component.ngOnInit();

    const payload: ChangePasswordPayload = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    };

    catalogueUserStub.changePassword.mockImplementationOnce((id, pl) => {
      expect(id).toBe(user.id);
      expect(pl).toBe(payload);
      return of({
        id,
        emailAddress: user.email,
      });
    });

    harness.component.changePassword(payload);

    expect(toastrStub.success).toHaveBeenCalled();
    expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith('/account');
  });

  it('should raise an error if the password could not be changed', () => {
    mockImplementGetSignedInUser();
    harness.component.ngOnInit();

    const payload: ChangePasswordPayload = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    };

    catalogueUserStub.changePassword.mockImplementationOnce((id, pl) => {
      expect(id).toBe(user.id);
      expect(pl).toBe(payload);
      return throwError(() => new Error());
    });

    harness.component.changePassword(payload);

    expect(toastrStub.error).toHaveBeenCalled();
    expect(stateRouterStub.navigateToKnownPath).not.toHaveBeenCalledWith('/account');
  });
});
