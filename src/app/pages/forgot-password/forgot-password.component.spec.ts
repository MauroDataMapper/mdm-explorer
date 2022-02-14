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
import { of } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { ForgotPasswordFormComponent } from 'src/app/security/forgot-password-form/forgot-password-form.component';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let harness: ComponentHarness<ForgotPasswordComponent>;

  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      ForgotPasswordComponent,
      {
        declarations: [
          MockComponent(ForgotPasswordFormComponent)
        ],
        providers: [
          {
            provide: SecurityService,
            useValue: securityStub
          },
          {
            provide: StateRouterService,
            useValue: stateRouterStub
          }
        ]
      });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.state).toBe('none');
  });

  it('should go back to the sign-in page when cancelled', () => {
    harness.component.cancel();
    expect(stateRouterStub.transitionTo).toHaveBeenCalledWith('app.container.signin');
  });

  it('should successfully send reset link', () => {
    securityStub.sendResetPasswordLink.mockImplementationOnce(() => of(true));

    harness.component.resetPassword({ email: 'test@test.com' });
    expect(harness.component.state).toBe('email-sent');
  });

  it('should handle failed reset link emails', () => {
    securityStub.sendResetPasswordLink.mockImplementationOnce(() => of(false));

    harness.component.resetPassword({ email: 'test@test.com' });
    expect(harness.component.state).toBe('error-sending-email');
  });
});
