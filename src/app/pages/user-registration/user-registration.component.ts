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
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DisplayValuePair } from '@maurodatamapper/sde-resources';
import { Observable, of } from 'rxjs';
import { UserRegistrationFormData } from './user-registration-form/user-registration-form.component';

@Component({
  selector: 'mdm-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationComponent implements OnInit {
  organisationOptions: DisplayValuePair[] = [];

  ngOnInit(): void {
    this.mockGetOrganisationOptions().subscribe((options) => {
      this.organisationOptions = options;
    });
  }

  /**
   * Mockup of eventual API call to get organisation options. Replace with getOrganisations when
   * API is available.
   * @returns
   */
  mockGetOrganisationOptions(): Observable<DisplayValuePair[]> {
    // TODO: Replace with actual API call
    return of([
      { displayValue: 'Org 1', value: 'org1' },
      { displayValue: 'Org 2', value: 'org2' },
      { displayValue: 'Org 3', value: 'org3' },
    ]);
  }

  handleFormSubmission(formData: UserRegistrationFormData): void {
    console.log('Form submitted', formData);
  }
}
