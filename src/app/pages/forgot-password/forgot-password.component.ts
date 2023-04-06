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
import { Component } from '@angular/core';
import {
  ForgotPasswordFormState,
  ResetPasswordClickEvent,
} from 'src/app/security/forgot-password-form/forgot-password-form.component';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  state: ForgotPasswordFormState = 'none';

  constructor(private security: SecurityService) {}

  resetPassword(event: ResetPasswordClickEvent) {
    this.state = 'sending-email';

    this.security
      .sendResetPasswordLink(event.email)
      .subscribe(
        (success) => (this.state = success ? 'email-sent' : 'error-sending-email')
      );
  }
}
