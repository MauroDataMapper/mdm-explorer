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
import { SimpleChanges, SimpleChange } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent, MockDirective } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  ForgotPasswordFormComponent,
  ForgotPasswordFormState,
  ResetPasswordClickEvent,
} from './forgot-password-form.component';

describe('ForgotPasswordFormComponent', () => {
  let harness: ComponentHarness<ForgotPasswordFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(ForgotPasswordFormComponent, {
      declarations: [MockComponent(MatFormField), MockDirective(MatLabel)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.state).toBe('none');
    expect(harness.component.formFieldAppearance).toBe('outline');
  });

  describe('on changes', () => {
    const triggerChange = (state: ForgotPasswordFormState, isSending: boolean) => {
      const changes: SimpleChanges = {
        isSending: new SimpleChange(isSending, isSending, false),
      };

      harness.component.state = state;
      harness.component.ngOnChanges(changes);
    };

    it('should disable the form when sending', () => {
      expect(harness.component.resetForm.enabled).toBe(true);

      triggerChange('sending-email', true);
      expect(harness.component.resetForm.enabled).toBe(false);
    });

    it('should enable the form when not sending', () => {
      triggerChange('sending-email', true);
      expect(harness.component.resetForm.enabled).toBe(false);

      triggerChange('email-sent', false);
      expect(harness.component.resetForm.enabled).toBe(true);
    });
  });

  it('should raise an event when resetting password', () => {
    const expected: ResetPasswordClickEvent = {
      email: 'test@test.com',
    };

    harness.component.email.setValue(expected.email);

    const eventSpy = jest.spyOn(harness.component.resetPasswordClicked, 'emit');

    harness.component.resetPassword();
    expect(eventSpy).toHaveBeenCalledWith(expected);
  });
});
