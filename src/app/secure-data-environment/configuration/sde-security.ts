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
import { Injectable } from '@angular/core';
import { ISdeSecurity, SignedInUserDetails } from '@maurodatamapper/sde-resources';
import { UserDetailsService } from 'src/app/security/user-details.service';

@Injectable({ providedIn: 'root' })
export class SdeSecurity implements ISdeSecurity {
  constructor(private userDetails: UserDetailsService) {}

  getSignedInUser() {
    const securityDetails = this.userDetails.get();
    if (securityDetails) {
      return {
        id: securityDetails.id,
        firstName: securityDetails.firstName,
        lastName: securityDetails.lastName,
        email: securityDetails.email,
        role: securityDetails.role,
        token: securityDetails.sdeAuthToken,
      } as SignedInUserDetails;
    }
    return null;
  }
}
