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
import {
  DisplayValuePair,
  IdNamePair,
  PublicEndpointsResearcher,
  RequestAccountDetails,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { map } from 'rxjs';
import { UserRegistrationFormData } from './user-registration-form/user-registration-form.component';

@Component({
  selector: 'mdm-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRegistrationComponent implements OnInit {
  organisationOptions: DisplayValuePair[] = [];
  departmentOptions: DisplayValuePair[] = [];
  constructor(private publicEndpointsResearcher: PublicEndpointsResearcher) {}

  ngOnInit(): void {
    this.publicEndpointsResearcher
      .listOrganisationNames()
      .pipe(
        map((finalised: IdNamePair[]) => {
          const mapped = finalised.map((spec) => ({
            value: spec.id,
            displayValue: spec.name,
          })) as DisplayValuePair[];

          return mapped;
        })
      )
      .subscribe((options) => {
        this.organisationOptions = options;
      });
  }

  handleFormSubmission(formData: UserRegistrationFormData): void {
    console.log('Form submitted', formData);
    const requestAccountDetails = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      jobTitle: formData.jobTitle,
      orcidId: formData.orcidId,
      gmcNumber: formData.gmcNumber,
      nmcNumber: formData.nmcNumber,
      hcpcNumber: formData.hcpcNumber,
      arNumber: formData.arNumber,
      organisationId: formData.organisationId,
      organisationFriendlyName: formData.organisationFriendlyName,
      organisationLegalName: formData.organisationLegalName,
      organisationWebsite: formData.organisationWebsite,
      organisationCountryOfRegistration: formData.organisationCountryOfRegistration,
      organisationType: formData.organisationType,
      organisationIsSmb: formData.organisationIsSmb,
      departmentId: formData.departmentId,
      departmentName: formData.departmentName,
      departmentDescription: formData.departmentDescription,
      joinExistingOrganisation: formData.joinExistingOrganisation,
      joinExistingDepartment: formData.joinExistingDepartment,
    } as RequestAccountDetails;
    this.publicEndpointsResearcher.requestUserAccount(requestAccountDetails).subscribe();
  }

  handleOrganisationChanged(organisationId: Uuid) {
    this.publicEndpointsResearcher
      .listDepartmentNames(organisationId)
      .pipe(
        map((finalised: IdNamePair[]) => {
          const mapped = finalised.map((spec) => ({
            value: spec.id,
            displayValue: spec.name,
          })) as DisplayValuePair[];

          return mapped;
        })
      )
      .subscribe((options) => {
        this.departmentOptions = options;
      });
  }
}
