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
import { PublicOpenIdConnectProvider } from '@maurodatamapper/mdm-resources';
import { defaultEmailPattern, SignInErrorType } from '../security.types';

export interface SignInClickEvent {
  userName: string;
  password: string;
}

@Component({
  selector: 'mdm-sign-in-form',
  templateUrl: './sign-in-form.component.html',
  styleUrls: ['./sign-in-form.component.scss'],
})
export class SignInFormComponent implements OnInit, OnChanges {
  @Input() authenticating = false;

  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';

  @Input() emailPattern?: RegExp;

  @Input() signInError?: SignInErrorType;

  @Input() forgotPasswordRouterLink?: string;

  @Input() openIdConnectProviders?: PublicOpenIdConnectProvider[];

  @Output() signInClicked = new EventEmitter<SignInClickEvent>();

  @Output() openIdConnectClicked = new EventEmitter<PublicOpenIdConnectProvider>();

  signInForm!: FormGroup;

  get userName() {
    return this.signInForm.get('userName');
  }

  get password() {
    return this.signInForm.get('password');
  }

  get signInErrorMessage() {
    if (!this.signInError) {
      return null;
    }

    switch (this.signInError) {
      case SignInErrorType.InvalidCredentials:
        return 'Invalid username or password!';
      case SignInErrorType.AlreadySignedIn:
        return 'A user is already signed in, please sign out first.';
      default:
        return 'Unable to sign in. Please try again later.';
    }
  }

  ngOnInit(): void {
    this.signInForm = new FormGroup({
      userName: new FormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        Validators.pattern(this.emailPattern ?? defaultEmailPattern),
      ]),
      password: new FormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.authenticating !== undefined && this.signInForm) {
      if (this.authenticating) {
        this.signInForm.disable();
      } else {
        this.signInForm.enable();
      }
    }
  }

  signIn() {
    if (this.signInForm.invalid) {
      return;
    }

    this.signInClicked.emit({
      userName: this.userName?.value,
      password: this.password?.value,
    });
  }

  authenticateWithOpenIdConnect(provider: PublicOpenIdConnectProvider) {
    this.openIdConnectClicked.emit(provider);
  }
}
