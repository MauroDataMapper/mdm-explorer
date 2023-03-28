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
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { map, Observable, of } from 'rxjs';
import { DataSpecificationService } from 'src/app/data-explorer/data-specification.service';

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

/**
 * Async validator that prevents the user to attempt to use an existing
 * name for a data specification.
 *
 * @param dataSpecificationService A {@link DataSpecificationService} instance to list existing data specifications.
 * @returns An observable with a boolean that indicates if there is any other element with that label.
 */
export const dontAllowDuplicatedNames = (
  dataSpecificationService: DataSpecificationService,
  dataSpecificationInitialName?: string
): AsyncValidatorFn => {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    if (control) {
      const name: string = control.value;
      if (dataSpecificationInitialName === name) {
        // If the name has not changed,
        // allow without looking for duplicates.
        return of(null);
      }
      return dataSpecificationService.isDataSpecificationNameAvailable(name).pipe(
        map((isAvailableResponse) => {
          if (!isAvailableResponse) {
            return { duplicatedNames: true };
          }
          return null;
        })
      );
    }
    return of(null);
  };
};
