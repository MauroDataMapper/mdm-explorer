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
import { MatSelectChange } from '@angular/material/select';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { DisplayValuePair } from '@maurodatamapper/sde-resources';
import { ToastrService } from 'ngx-toastr';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';

export interface UserRegistrationFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
  orcidId: string;
  gmcNumber: string;
  nmcNumber: string;
  hcpcNumber: string;
  arNumber: string;
  organisationId: string;
  organisationFriendlyName: string;
  organisationLegalName: string;
  organisationWebsite: string;
  organisationCountryOfRegistration: string;
  organisationType: OrganisationType;
  organisationIsSmb: boolean;
  departmentId: string;
  departmentName: string;
  departmentDescription: string;
  joinExistingOrganisation: boolean;
  joinExistingDepartment: boolean;
}

export type OrganisationType = 'NOT_SELECTED' | 'UNIVERSITY' | 'HEALTHTECH';
export interface OrganisationTypeOption {
  value: OrganisationType;
  displayName: 'University' | 'Healthcare technology company';
}

export const ORGANISATION_TYPE_OPTIONS: OrganisationTypeOption[] = [
  { value: 'UNIVERSITY', displayName: 'University' },
  { value: 'HEALTHTECH', displayName: 'Healthcare technology company' },
];

@Component({
  selector: 'mdm-user-registration-form',
  templateUrl: './user-registration-form.component.html',
  styleUrls: ['./user-registration-form.component.scss'],
})
export class UserRegistrationFormComponent {
  @Input() organisationOptions: DisplayValuePair[] = [];
  @Input() departmentOptions: DisplayValuePair[] = [];
  @Output() formSubmitted = new EventEmitter<UserRegistrationFormData>();
  @Output() organisationChanged = new EventEmitter<Uuid>();

  formFieldAppearance: MatFormFieldAppearance = 'outline';
  isCreatingNewOrganisation = false;
  isCreatingNewDepartment = false;

  organisationTypeOptions = ORGANISATION_TYPE_OPTIONS;

  registrationForm: FormGroup = this.formBuilder.group({
    personalDetails: this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      phoneNumber: ['', Validators.pattern('^[- +()0-9]+$')],
      jobTitle: ['', Validators.required],
      orcidId: null,
      gmcNumber: null,
      nmcNumber: null,
      hcpcNumber: null,
      arNumber: null,

      // TODO: Unconfirmed field.
      // confirmations: false,
    }),
    organisationDetails: this.formBuilder.group({
      organisation: ['', Validators.required],
      organisationFriendlyName: null,
      organisationLegalName: null,
      organisationWebsite: null,
      organisationCountryOfRegistration: null,
      organisationType: null,
      organisationIsSmb: false,
    }),
    departmentDetails: this.formBuilder.group({
      department: ['', Validators.required],
      departmentName: null,
      departmentDescription: null,
    }),
  });

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
      organisationId: null,
      organisationFriendlyName: this.registrationForm.get(
        'organisationDetails.organisationFriendlyName'
      )?.value,
      departmentId: null,
      departmentName: this.registrationForm.get('departmentDetails.departmentName')?.value,
      departmentDescription: this.registrationForm.get('departmentDetails.departmentDescription')
        ?.value,
    } as UserRegistrationFormData;

    const organisation = this.isCreatingNewOrganisation
      ? null
      : (this.registrationForm.get('organisationDetails.organisation')?.value as DisplayValuePair);

    if (organisation) {
      formData.organisationId = organisation.value;
      formData.organisationFriendlyName = organisation.displayValue;
    }

    const department = this.isCreatingNewOrganisation
      ? null
      : (this.registrationForm.get('departmentDetails.department')?.value as DisplayValuePair);

    if (department) {
      formData.departmentId = department.value;
      formData.departmentName = department.displayValue;
      formData.departmentDescription = department.displayValue; // This will be ignored when updating
    }

    formData.joinExistingOrganisation = !this.isCreatingNewOrganisation;
    formData.joinExistingDepartment = !this.isCreatingNewDepartment;

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
      this.registrationForm
        .get('organisationDetails.organisationFriendlyName')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.organisationLegalName')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.organisationWebsite')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.organisationCountryOfRegistration')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.organisationType')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('organisationDetails.organisationIsSmb')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('departmentDetails.departmentName')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('departmentDetails.departmentDescription')
        ?.setValidators(Validators.required);
    } else {
      this.registrationForm
        .get('organisationDetails.organisation')
        ?.setValidators(Validators.required);
      this.registrationForm.get('organisationDetails.organisationFriendlyName')?.clearValidators();
      this.registrationForm.get('organisationDetails.organisationLegalName')?.clearValidators();
      this.registrationForm.get('organisationDetails.organisationWebsite')?.clearValidators();
      this.registrationForm
        .get('organisationDetails.organisationCountryOfRegistration')
        ?.clearValidators();
      this.registrationForm.get('organisationDetails.organisationType')?.clearValidators();
      this.registrationForm.get('organisationDetails.organisationIsSmb')?.clearValidators();
      this.registrationForm.get('departmentDetails.department')?.setValidators(Validators.required);
      this.registrationForm.get('departmentDetails.departmentName')?.clearValidators();
      this.registrationForm.get('departmentDetails.departmentDescription')?.clearValidators();
    }

    this.registrationForm.get('organisationDetails.organisation')?.updateValueAndValidity();
    this.registrationForm
      .get('organisationDetails.organisationFriendlyName')
      ?.updateValueAndValidity();
    this.registrationForm
      .get('organisationDetails.organisationLegalName')
      ?.updateValueAndValidity();
    this.registrationForm.get('organisationDetails.organisationWebsite')?.updateValueAndValidity();
    this.registrationForm
      .get('organisationDetails.organisationCountryOfRegistration')
      ?.updateValueAndValidity();
    this.registrationForm.get('organisationDetails.organisationType')?.updateValueAndValidity();
    this.registrationForm.get('organisationDetails.organisationIsSmb')?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.department')?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.departmentName')?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.departmentDescription')?.updateValueAndValidity();
  }

  toggleDepartmentCreation(value: boolean) {
    this.isCreatingNewDepartment = value;
    if (this.isCreatingNewDepartment) {
      this.registrationForm.get('departmentDetails.department')?.clearValidators();
      this.registrationForm
        .get('departmentDetails.departmentName')
        ?.setValidators(Validators.required);
      this.registrationForm
        .get('departmentDetails.departmentDescription')
        ?.setValidators(Validators.required);
    } else {
      this.registrationForm.get('departmentDetails.department')?.setValidators(Validators.required);
      this.registrationForm.get('departmentDetails.departmentName')?.clearValidators();
      this.registrationForm.get('departmentDetails.departmentDescription')?.clearValidators();
    }

    this.registrationForm.get('departmentDetails.department')?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.departmentName')?.updateValueAndValidity();
    this.registrationForm.get('departmentDetails.departmentDescription')?.updateValueAndValidity();
  }

  onOrganisationChange(change: MatSelectChange) {
    this.organisationChanged.emit(change.value.value as Uuid);
  }
}
