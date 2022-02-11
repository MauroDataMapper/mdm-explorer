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
    expect(harness.component.isSending).toBeFalsy();
    expect(harness.component.emailSent).toBeFalsy();
    expect(harness.component.emailFailed).toBeFalsy();
  });

  it('should go back to the sign-in page when cancelled', () => {
    harness.component.cancel();
    expect(stateRouterStub.transitionTo).toHaveBeenCalledWith('app.container.signin');
  });

  it('should successfully send reset link', () => {
    securityStub.sendResetPasswordLink.mockImplementationOnce(() => of(true));

    harness.component.resetPassword({ email: 'test@test.com' });
    expect(harness.component.emailSent).toBeTruthy();
    expect(harness.component.emailFailed).toBeFalsy();
  });

  it('should handle failed reset link emails', () => {
    securityStub.sendResetPasswordLink.mockImplementationOnce(() => of(false));

    harness.component.resetPassword({ email: 'test@test.com' });
    expect(harness.component.emailSent).toBeFalsy();
    expect(harness.component.emailFailed).toBeTruthy();
  });
});
