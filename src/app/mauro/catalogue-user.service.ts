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
import { MdmResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';

export interface CatalogueUser {
  id: Uuid;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  organisation?: string;
  jobTitle?: string;
}

export interface CatalogueUserPayload {
  firstName: string;
  lastName: string;
  organisation: string;
  jobTitle?: string;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
export interface CatalogueUserContactPayload {
  emailAddress: string;
}

/**
 * Service to manage catalogue user actions.
 */
@Injectable({
  providedIn: 'root',
})
export class CatalogueUserService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Get the full details of a catalogue user.
   *
   * @param id The user ID to fetch.
   * @returns An observable containing a {@link CatalogueUser}.
   */
  get(id: Uuid): Observable<CatalogueUser> {
    return this.endpoints.catalogueUser
      .get(id)
      .pipe(map((response: MdmResponse<CatalogueUser>) => response.body));
  }

  /**
   * Update an existing catalogue user with updated details.
   *
   * @param id The ID of the user to update.
   * @param payload The details to update.
   * @returns An observable containing a {@link CatalogueUser}.
   */
  update(
    id: Uuid,
    payload: CatalogueUserPayload | CatalogueUserContactPayload,
  ): Observable<CatalogueUser> {
    return this.endpoints.catalogueUser
      .update(id, payload)
      .pipe(map((response: MdmResponse<CatalogueUser>) => response.body));
  }

  /**
   * Change the password of an existing user.
   *
   * @param id The ID of the user to update.
   * @param payload The new password to change to.
   * @returns An observable containing a {@link CatalogueUser}.
   */
  changePassword(id: Uuid, payload: ChangePasswordPayload): Observable<CatalogueUser> {
    return this.endpoints.catalogueUser
      .changePassword(id, payload)

      .pipe(map((response: MdmResponse<CatalogueUser>) => response.body));
  }

  /**
   * Update an existing catalogue user with updated contact details.
   *
   * @param id The ID of the user to update.
   * @param payload The contact details to update.
   * @returns An observable containing a {@link CatalogueUser}.
   */
  updateContactInfo(
    id: Uuid,
    payload: CatalogueUserPayload | CatalogueUserContactPayload,
  ): Observable<CatalogueUser> {
    return this.endpoints.catalogueUser
      .update(id, payload)
      .pipe(map((response: MdmResponse<CatalogueUser>) => response.body));
  }
}
