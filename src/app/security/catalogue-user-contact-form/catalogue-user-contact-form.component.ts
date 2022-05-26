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
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  CatalogueUser,
  CatalogueUserContactPayload,
} from '../../mauro/catalogue-user.service';

@Component({
  selector: 'mdm-catalogue-user-contact-form',
  templateUrl: './catalogue-user-contact-form.component.html',
  styleUrls: ['./catalogue-user-contact-form.component.scss'],
})
export class CatalogueUserContactFormComponent implements OnChanges {
  @Input() user?: CatalogueUser;

  @Input() isBusy = false;

  @Output() cancelClicked = new EventEmitter<void>();

  @Output() updateClicked = new EventEmitter<CatalogueUserContactPayload>();

  formGroup: FormGroup;

  constructor() {
    this.formGroup = new FormGroup({
      emailAddress: new FormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
    });
  }

  get emailAddress() {
    return this.formGroup.get('emailAddress');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user) {
      this.setFormValues(this.user);
    }
  }

  cancel() {
    this.cancelClicked.emit();
  }

  update() {
    if (this.formGroup.invalid) {
      return;
    }

    this.updateClicked.emit({
      emailAddress: this.emailAddress?.value,
    });
  }

  private setFormValues(user?: CatalogueUser) {
    this.emailAddress?.setValue(user?.emailAddress ?? '');
  }
}
