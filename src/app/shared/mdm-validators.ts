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
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that a form control has a value that matches another form control.
 * Note that this validator is for a form group, not for an individual form control.
 *
 * @param controlName The name of the form control that contains the original value.
 * @param matchingControlName The name of the other form control to compare.
 * @returns A {@link ValidatorFn} to perform the validation.
 */
export const mustMatch = (
  controlName: string,
  matchingControlName: string
): ValidatorFn => {
  return (control: AbstractControl): ValidationErrors | null => {
    const firstControl = control.get(controlName);
    const matchingControl = control.get(matchingControlName);

    if (!firstControl || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return null;
    }

    // Set error on matchingControl if validation fails so that correct fields can be triggered
    // to display error messages
    if (firstControl.value !== matchingControl?.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }

    // Return null here because errors have already been set, which will trigger an invalid form state
    return null;
  };
};
