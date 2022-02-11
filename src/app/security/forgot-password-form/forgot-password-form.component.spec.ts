import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';
import { ForgotPasswordFormComponent } from './forgot-password-form.component';

describe('ForgotPasswordFormComponent', () => {
  let harness: ComponentHarness<ForgotPasswordFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      ForgotPasswordFormComponent,
      {
        declarations: [
          MockComponent(MatFormField),
          MockComponent(MatLabel)
        ]
      });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
