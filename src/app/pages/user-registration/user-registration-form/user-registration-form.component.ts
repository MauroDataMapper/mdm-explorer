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
/* eslint-disable @typescript-eslint/unbound-method */
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { DisplayValuePair } from '@maurodatamapper/sde-resources';
import { ToastrService } from 'ngx-toastr';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';

export interface UserRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  additionalInfo: string;
  confirmations: boolean;
  organisation: string;
  orgName: string;
  positionAtOrganisation: string;
  orgWebsite: string;
  orgCountryOfRegistration: string;
  orgType: string;
  smallMediumBusinessStatus: string;
  deptName: string;
}

@Component({
  selector: 'mdm-user-registration-form',
  templateUrl: './user-registration-form.component.html',
  styleUrls: ['./user-registration-form.component.scss'],
})
export class UserRegistrationFormComponent {
  @Input() organisationOptions: DisplayValuePair[] = [];
  @Output() formSubmitted = new EventEmitter<UserRegistrationFormData>();

  formFieldAppearance: MatFormFieldAppearance = 'outline';
  isCreatingNewOrganisation = false;

  registrationForm: FormGroup = this.formBuilder.group({
    personalDetails: this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: ['', Validators.pattern('^[- +()0-9]+$')],
      additionalInfo: null,
      confirmations: false,
    }),
    organisationDetails: this.formBuilder.group({
      organisation: ['', Validators.required],
      orgName: null,
      orgWebsite: null,
      orgCountryOfRegistration: null,
      orgType: null,
      smallMediumBusinessStatus: null,
    }),
    departmentDetails: this.formBuilder.group({
      department: ['', Validators.required],
      deptName: null,
    }),
  });

  mockedDepartments: DisplayValuePair[] = [
    { displayValue: 'HR', value: 'hr' },
    { displayValue: 'Engineering', value: 'engineering' },
    { displayValue: 'Marketing', value: 'marketing' },
  ];

  constructor(
    private formBuilder: FormBuilder,
    private toastr: ToastrService,
    private dialogService: DialogService,
    private stateRouter: StateRouterService
  ) {}

  get personalDetails() {
    return (this.registrationForm.controls.personalDetails as FormGroup).controls;
  }

  get organisationDetails() {
    return (this.registrationForm.controls.organisationDetails as FormGroup).controls;
  }

  get departmentDetails() {
    return (this.registrationForm.controls.departmentDetails as FormGroup).controls;
  }

  submit(): void {
    if (this.registrationForm.invalid) {
      this.toastr.info('Please fill in all required fields');
      this.logValidationErrors(this.registrationForm);
      return;
    }

    // Gather form data and emit.
    const formData = {
      ...this.registrationForm.get('personalDetails')?.value,
      ...this.registrationForm.get('organisationDetails')?.value,
      ...this.registrationForm.get('departmentDetails')?.value,
    } as UserRegistrationFormData;

    this.formSubmitted.emit(formData);

    // Show success dialog and navigate to home page.
    this.dialogService
      .openSuccess({
        heading: 'Form submission successful',
        message: 'User registration complete. Please check your email for further instructions.',
      })
      .afterClosed()
      .subscribe(() => {
        this.stateRouter.navigateTo(['/']);
      });
  }

  logValidationErrors(group: FormGroup): void {
    Object.keys(group.controls).forEach((key: string) => {
      const control = group.get(key);
      if (control instanceof FormGroup) {
        this.logValidationErrors(control);
      } else {
        if (control && control.invalid) {
          console.log(`Control: ${key}, Errors:`, control.errors);
        }
      }
    });
  }

  toggleOrganisationCreation(value: boolean) {
    this.isCreatingNewOrganisation = value;
    if (this.isCreatingNewOrganisation) {
      this.registrationForm.get('organisationDetails.organisation')?.clearValidators();
      this.registrationForm.get('departmentDetails.department')?.clearValidators();
      this.registrationForm.get('organisationDetails.orgName')?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.orgWebsite')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.orgCountryOfRegistration')
        ?.setValidators(Validators.required);
      this.registrationForm.get('organisationDetails.orgType')?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.smallMediumBusinessStatus')
        ?.setValidators(Validators.required);
      this.registrationForm.get('departmentDetails.deptName')?.setValidators(Validators.required);
    } else {
      this.registrationForm
        .get('organisationDetails.organisation')
        ?.setValidators(Validators.required);
      this.registrationForm.get('organisationDetails.orgName')?.clearValidators();
      this.registrationForm.get('organisationDetails.orgWebsite')?.clearValidators();
      this.registrationForm.get('organisationDetails.orgCountryOfRegistration')?.clearValidators();
      this.registrationForm.get('organisationDetails.orgType')?.clearValidators();
      this.registrationForm.get('organisationDetails.smallMediumBusinessStatus')?.clearValidators();
      this.registrationForm.get('departmentDetails.department')?.setValidators(Validators.required);
      this.registrationForm.get('departmentDetails.deptName')?.clearValidators();
    }

    this.registrationForm.get('organisationDetails.organisation')?.updateValueAndValidity();
    this.registrationForm.get('organisationDetails.orgName')?.updateValueAndValidity();
    this.registrationForm.get('organisationDetails.orgWebsite')?.updateValueAndValidity();
    this.registrationForm
      .get('organisationDetails.orgCountryOfRegistration')
      ?.updateValueAndValidity();
    this.registrationForm.get('organisationDetails.orgType')?.updateValueAndValidity();
    this.registrationForm
      .get('organisationDetails.smallMediumBusinessStatus')
      ?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.department')?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.deptName')?.updateValueAndValidity();
  }
}
