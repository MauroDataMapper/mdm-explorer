import { MockComponent } from 'ng-mocks';
import { StateRouterService } from 'src/app/core/state-router.service';
import { ForgotPasswordFormComponent } from 'src/app/security/forgot-password-form/forgot-password-form.component';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let harness: ComponentHarness<ForgotPasswordComponent>;

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
            provide: StateRouterService,
            useValue: stateRouterStub
          }
        ]
      });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should go back to the sign-in page when cancelled', () => {
    harness.component.cancel();
    expect(stateRouterStub.transitionTo).toHaveBeenCalledWith('app.container.signin');
  });
});
