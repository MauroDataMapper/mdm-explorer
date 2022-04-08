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
import { Injectable } from '@angular/core';
import { CatalogueItemDomainType, Uuid, Profile } from '@maurodatamapper/mdm-resources';
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';

/**
 * Service to get profile for a data element
 */
@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Get a named profile for a data element
   *
   * @param catalogueItemdomainType For example 'DataElement'
   * @param catalogueItemId For example the data element ID
   * @param profileNamespace
   * @param profileName
   * @returns An observable which returns a {@link <Profile>}.
   */
  get(
    catalogueItemDomainType: CatalogueItemDomainType,
    catalogueItemId: Uuid,
    profileNamespace: string,
    profileName: string
  ): Observable<Profile> {
    return this.endpoints.profile
      .profile(catalogueItemDomainType, catalogueItemId, profileNamespace, profileName)
      .pipe(map((response: Profile) => response.body));
  }
}
