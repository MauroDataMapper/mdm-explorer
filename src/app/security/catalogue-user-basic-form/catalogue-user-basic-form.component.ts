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
  Output,
  SimpleChanges,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { CatalogueUser, CatalogueUserPayload } from '../../mauro/catalogue-user.service';

@Component({
  selector: 'mdm-catalogue-user-basic-form',
  templateUrl: './catalogue-user-basic-form.component.html',
  styleUrls: ['./catalogue-user-basic-form.component.scss'],
})
export class CatalogueUserBasicFormComponent implements OnChanges {
  @Input() user?: CatalogueUser;

  @Input() isBusy = false;

  @Output() cancelClicked = new EventEmitter<void>();

  @Output() updateClicked = new EventEmitter<CatalogueUserPayload>();

  formGroup: UntypedFormGroup;

  constructor() {
    this.formGroup = new UntypedFormGroup({
      firstName: new UntypedFormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
      lastName: new UntypedFormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
      organisation: new UntypedFormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
      role: new UntypedFormControl(''),
    });
  }

  get firstName() {
    return this.formGroup.get('firstName');
  }

  get lastName() {
    return this.formGroup.get('lastName');
  }

  get organisation() {
    return this.formGroup.get('organisation');
  }

  get role() {
    return this.formGroup.get('role');
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
      firstName: this.firstName?.value,
      lastName: this.lastName?.value,
      organisation: this.organisation?.value,
      jobTitle: this.role?.value,
    });
  }

  private setFormValues(user?: CatalogueUser) {
    this.firstName?.setValue(user?.firstName ?? '');
    this.lastName?.setValue(user?.lastName ?? '');
    this.organisation?.setValue(user?.organisation ?? '');
    this.role?.setValue(user?.jobTitle ?? '');
  }
}
