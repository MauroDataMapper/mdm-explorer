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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ChangePasswordPayload } from 'src/app/mauro/catalogue-user.service';
import { mustMatch } from 'src/app/shared/mdm-validators';

export type PasswordFieldType = 'password' | 'text';

export interface ChangePasswordFieldState {
  visible: boolean;
  type: 'password' | 'text';
  label: string;
  icon: 'visibility' | 'visibility_off';
}

const hiddenFieldState: ChangePasswordFieldState = {
  visible: false,
  type: 'password',
  label: 'Show password',
  icon: 'visibility_off',
};

const visibleFieldState: ChangePasswordFieldState = {
  visible: true,
  type: 'text',
  label: 'Hide password',
  icon: 'visibility',
};

export interface ChangePasswordFormState {
  [key: string]: ChangePasswordFieldState;
}

@Component({
  selector: 'mdm-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
})
export class ChangePasswordFormComponent {
  @Input() isBusy = false;

  @Output() cancelClicked = new EventEmitter<void>();

  @Output() updateClicked = new EventEmitter<ChangePasswordPayload>();

  formGroup: FormGroup;

  /**
   * Used to track certain state per form field
   */
  fieldState: ChangePasswordFormState = {
    currentPassword: hiddenFieldState,
    newPassword: hiddenFieldState,
    confirmPassword: hiddenFieldState,
  };

  constructor() {
    this.formGroup = new FormGroup(
      {
        currentPassword: new FormControl('', [
          Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        ]),
        newPassword: new FormControl('', [
          Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        ]),
        confirmPassword: new FormControl('', [
          Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        ]),
        // Non-visible control to trigger form validation, prevent a valid form if password strength
        // is not 100%
        passwordStrength: new FormControl(null, [Validators.min(100)]),
      },
      {
        validators: [mustMatch('newPassword', 'confirmPassword')],
      }
    );
  }

  get currentPassword() {
    return this.formGroup.get('currentPassword');
  }

  get newPassword() {
    return this.formGroup.get('newPassword');
  }

  get confirmPassword() {
    return this.formGroup.get('confirmPassword');
  }

  get passwordStrength() {
    return this.formGroup.get('passwordStrength');
  }

  toggleVisibility(control: string) {
    const current = this.fieldState[control];
    this.fieldState[control] = current.visible ? hiddenFieldState : visibleFieldState;
  }

  passwordStrengthChanged(strength: number) {
    this.passwordStrength?.setValue(strength);
  }

  cancel() {
    this.cancelClicked.emit();
  }

  update() {
    if (this.formGroup.invalid) {
      return;
    }

    this.updateClicked.emit({
      oldPassword: this.currentPassword?.value,
      newPassword: this.newPassword?.value,
    });
  }
}
