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
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { defaultEmailPattern } from 'src/app/core/core.types';
import { PluginResearchContactPayload } from 'src/app/mauro/plugins/plugin-research.resource';

export type ContactFormState = 'idle' | 'sending' | 'sent' | 'error-sending';

@Component({
  selector: 'mdm-contact-form',
  templateUrl: './contact-form.component.html',
  styleUrls: ['./contact-form.component.scss'],
})
export class ContactFormComponent implements OnInit, OnChanges {
  @Input() formFieldAppearance: MatFormFieldAppearance = 'outline';

  @Input() emailPattern?: RegExp;

  @Input() data?: PluginResearchContactPayload;

  @Input() state: ContactFormState = 'idle';

  @Output() submitClicked = new EventEmitter<PluginResearchContactPayload>();

  contactForm!: UntypedFormGroup;

  get firstName() {
    return this.contactForm.get('firstName');
  }

  get lastName() {
    return this.contactForm.get('lastName');
  }

  get organisation() {
    return this.contactForm.get('organisation');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get subject() {
    return this.contactForm.get('subject');
  }

  get message() {
    return this.contactForm.get('message');
  }

  ngOnInit(): void {
    this.contactForm = new UntypedFormGroup({
      firstName: new UntypedFormControl(this.data?.firstName ?? '', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
      lastName: new UntypedFormControl(this.data?.lastName ?? '', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
      organisation: new UntypedFormControl(this.data?.organisation ?? '', []),
      email: new UntypedFormControl(this.data?.emailAddress ?? '', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        Validators.pattern(this.emailPattern ?? defaultEmailPattern),
      ]),
      subject: new UntypedFormControl(this.data?.subject ?? '', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
      message: new UntypedFormControl(this.data?.message ?? '', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        Validators.maxLength(1000),
      ]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.state !== undefined && this.contactForm) {
      if (this.state === 'sending') {
        this.contactForm.disable();
      } else {
        this.contactForm.enable();
      }
    }

    if (changes.data && this.contactForm) {
      this.firstName?.setValue(this.data?.firstName ?? '');
      this.lastName?.setValue(this.data?.lastName ?? '');
      this.organisation?.setValue(this.data?.organisation ?? '');
      this.email?.setValue(this.data?.emailAddress ?? '');
      this.subject?.setValue(this.data?.subject ?? '');
      this.message?.setValue(this.data?.message ?? '');
    }
  }

  submit() {
    if (this.contactForm.invalid) {
      return;
    }

    this.submitClicked.emit({
      firstName: this.firstName?.value,
      lastName: this.lastName?.value,
      organisation: this.organisation?.value,
      emailAddress: this.email?.value,
      subject: this.subject?.value,
      message: this.message?.value,
    });
  }
}
