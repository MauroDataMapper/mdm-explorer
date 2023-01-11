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
import {
  MatPasswordStrengthComponent,
  MatPasswordStrengthInfoComponent,
} from '@angular-material-extensions/password-strength';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MockComponent } from 'ng-mocks';
import { ChangePasswordPayload } from 'src/app/mauro/catalogue-user.service';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import {
  ChangePasswordFieldState,
  ChangePasswordFormComponent,
} from './change-password-form.component';

describe('ChangePasswordFormComponent', () => {
  let harness: ComponentHarness<ChangePasswordFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ChangePasswordFormComponent, {
      declarations: [
        MockComponent(MatFormField),
        MockComponent(MatLabel),
        MockComponent(MatIcon),
        MockComponent(MatPasswordStrengthComponent),
        MockComponent(MatPasswordStrengthInfoComponent),
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.formGroup).toBeDefined();
    expect(harness.component.currentPassword?.value).toBe('');
    expect(harness.component.newPassword?.value).toBe('');
    expect(harness.component.confirmPassword?.value).toBe('');
    expect(harness.component.passwordStrength?.value).toBeNull();
  });

  const fieldProperties = ['currentPassword', 'newPassword', 'confirmPassword'];

  const expectFieldInHiddenState = (state: ChangePasswordFieldState) => {
    expect(state.visible).toBeFalsy();
    expect(state.type).toBe('password');
    expect(state.label).toBe('Show password');
    expect(state.icon).toBe('visibility_off');
  };

  const expectFieldInVisibleState = (state: ChangePasswordFieldState) => {
    expect(state.visible).toBeTruthy();
    expect(state.type).toBe('text');
    expect(state.label).toBe('Hide password');
    expect(state.icon).toBe('visibility');
  };

  it.each(fieldProperties)('should setup password field %p as "hidden" text', (prop) => {
    expectFieldInHiddenState(harness.component.fieldState[prop]);
  });

  it.each(fieldProperties)(
    'should toggle %p from "hidden" to "visible" state',
    (prop) => {
      expectFieldInHiddenState(harness.component.fieldState[prop]);
      harness.component.toggleVisibility(prop);
      expectFieldInVisibleState(harness.component.fieldState[prop]);
    }
  );

  it.each(fieldProperties)(
    'should toggle %p from "visible" to "hidden" state',
    (prop) => {
      harness.component.toggleVisibility(prop);
      expectFieldInVisibleState(harness.component.fieldState[prop]);
      harness.component.toggleVisibility(prop);
      expectFieldInHiddenState(harness.component.fieldState[prop]);
    }
  );

  it.each([0, 20, 40, 60, 80, 100])(
    'should set the password strength hidden form field to %p',
    (value) => {
      harness.component.passwordStrengthChanged(value);
      expect(harness.component.passwordStrength?.value).toBe(value);
    }
  );

  it('should emit a cancel event', () => {
    const spy = jest.spyOn(harness.component.cancelClicked, 'emit');
    harness.component.cancel();
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit an update event if form is invalid', () => {
    const spy = jest.spyOn(harness.component.updateClicked, 'emit');
    // Using default values of form means there are required fields missing
    harness.component.update();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit an update event if the confirmed password does not match', () => {
    const spy = jest.spyOn(harness.component.updateClicked, 'emit');
    harness.component.currentPassword?.setValue('old-password');
    harness.component.newPassword?.setValue('new-password');
    harness.component.confirmPassword?.setValue('wrong-password');
    harness.component.passwordStrength?.setValue(100);
    harness.component.update();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should not emit an update event if core fields are valid but password strength is not set', () => {
    const spy = jest.spyOn(harness.component.updateClicked, 'emit');
    harness.component.currentPassword?.setValue('old-password');
    harness.component.newPassword?.setValue('new-password');
    harness.component.confirmPassword?.setValue('new-password');
    harness.component.passwordStrength?.setValue(0);
    harness.component.update();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should emit an update event if the form is valid', () => {
    const spy = jest.spyOn(harness.component.updateClicked, 'emit');

    const payload: ChangePasswordPayload = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    };

    harness.component.currentPassword?.setValue(payload.oldPassword);
    harness.component.newPassword?.setValue(payload.newPassword);
    harness.component.confirmPassword?.setValue(payload.newPassword);
    harness.component.passwordStrength?.setValue(100); // Simulate all password strength rules passed

    harness.component.update();
    expect(spy).toHaveBeenCalledWith(payload);
  });
});
