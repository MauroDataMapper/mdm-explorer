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
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { defaultEmailPattern } from '../security.types';

export type ForgotPasswordFormState =
  | 'none'
  | 'sending-email'
  | 'email-sent'
  | 'error-sending-email';

export interface ResetPasswordClickEvent {
  email: string;
}

@Component({
  selector: 'mdm-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss'],
})
export class ForgotPasswordFormComponent implements OnInit, OnChanges {
  @Input() state: ForgotPasswordFormState = 'none';

  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';

  @Input() emailPattern?: RegExp;

  @Input() cancelLabel = 'Cancel';

  @Input() cancelRouteName?: string;

  @Input() retryRouteName?: string;

  @Output() resetPasswordClicked = new EventEmitter<ResetPasswordClickEvent>();

  resetForm!: FormGroup;

  get email() {
    return this.resetForm.get('email');
  }

  ngOnInit(): void {
    this.resetForm = new FormGroup({
      email: new FormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        Validators.pattern(this.emailPattern ?? defaultEmailPattern),
      ]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.isSending !== undefined && this.resetForm) {
      if (this.state === 'sending-email') {
        this.resetForm.disable();
      } else {
        this.resetForm.enable();
      }
    }
  }

  resetPassword() {
    if (this.resetForm.invalid) {
      return;
    }

    this.resetPasswordClicked.emit({ email: this.email?.value });
  }
}