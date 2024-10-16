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
import {
  CatalogueItemDomainType,
  Uuid,
  Profile,
  MultiFacetAwareDomainType,
  SearchQueryParameters,
  MdmIndexBody,
  ProfileSearchResult,
  ProfileSearchResponse,
  ProfileDefinition,
  ProfileDefinitionResponse,
  RequestSettings,
  ProfileValidationErrorList,
  Version,
  ProfileResponse,
} from '@maurodatamapper/mdm-resources';
import { catchError, map, Observable, of } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { HttpErrorResponse } from '@angular/common/http';

/**
 * Service to get profile information for catalogue items.
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
   * @param profileNamespace The namespace of the profile to get.
   * @param profileName The name of the profile to get.
   * @returns An observable which returns a {@link <Profile>}.
   */
  get(
    catalogueItemDomainType: CatalogueItemDomainType,
    catalogueItemId: Uuid,
    profileNamespace: string,
    profileName: string,
    options?: RequestSettings
  ): Observable<Profile> {
    return this.endpoints.profile
      .profile(
        catalogueItemDomainType,
        catalogueItemId,
        profileNamespace,
        profileName,
        undefined,
        undefined,
        options
      )
      .pipe(map((response: Profile) => response.body));
  }

  /**
   * Gets the definition of a profile, including sections and fields.
   *
   * @param profileNamespace The namespace of the profile to get.
   * @param profileName The name of the profile to get.
   * @returns An observable which returns a {@link ProfileDefinition}.
   */
  definition(
    profileNamespace: string,
    profileName: string
  ): Observable<ProfileDefinition> {
    return this.endpoints.profile
      .definition(profileNamespace, profileName)
      .pipe(map((response: ProfileDefinitionResponse) => response.body));
  }

  /**
   * Search within the catalogue for one or more search terms and return profile fields matching
   * the provided profile.
   *
   * @param profileNamespace The namespace of the profile to get.
   * @param profileName The name of the profile to get.
   * @param query The query parameters to control the search.
   * @returns An observable containing the search results.
   */
  search(
    profileNamespace: string,
    profileName: string,
    query: SearchQueryParameters
  ): Observable<MdmIndexBody<ProfileSearchResult>> {
    return this.endpoints.profile
      .search(profileNamespace, profileName, query)
      .pipe(map((response: ProfileSearchResponse) => response.body));
  }

  /**
   * Search within a single catalogue item for one or more search terms and return profile fields matching
   * the provided profile.
   *
   * @param domainType The domain type of the catalogue item to search in.
   * @param id The unique identifier of the catalogue item to search in.
   * @param profileNamespace The namespace of the profile to get.
   * @param profileName The name of the profile to get.
   * @param query The query parameters to control the search.
   * @returns An observable containing the search results.
   */
  searchCatalogueItem(
    domainType: MultiFacetAwareDomainType,
    id: Uuid,
    profileNamespace: string,
    profileName: string,
    query: SearchQueryParameters
  ): Observable<MdmIndexBody<ProfileSearchResult>> {
    return this.endpoints.profile
      .searchCatalogueItem(domainType, id, profileNamespace, profileName, query)
      .pipe(map((response: ProfileSearchResponse) => response.body));
  }

  /**
   * Validate a named profile
   *
   * @param catalogueItemdomainType For example 'DataElement'
   * @param catalogueItemId For example the data element ID
   * @param profileNamespace The namespace of the profile to validate.
   * @param profileName The name of the profile to validate.
   * @param profileData The profile to validate.
   * @returns An observable which returns a {@link <ProfileValidationErrorList>}.
   */
  validate(
    catalogueItemDomainType: CatalogueItemDomainType,
    catalogueItemId: Uuid,
    profileNamespace: string,
    profileName: string,
    profileData: Profile
  ): Observable<ProfileValidationErrorList> {
    return this.endpoints.profile
      .validateProfile(
        profileNamespace,
        profileName,
        catalogueItemDomainType,
        catalogueItemId,
        profileData
      )
      .pipe(
        map<unknown, ProfileValidationErrorList>(() => {
          return {
            total: 0,
            fieldTotal: 0,
            errors: [],
          };
        }),
        catchError((error: HttpErrorResponse) => {
          return of(error.error as ProfileValidationErrorList);
        })
      );
  }

  /**
   * Save a named profile
   *
   * @param domainType
   * @param catalogueItemId
   * @param profileNamespace
   * @param profileName
   * @param data
   * @param profileVersion
   * @param options
   * @returns
   */
  save(
    domainType: MultiFacetAwareDomainType | CatalogueItemDomainType,
    catalogueItemId: Uuid,
    profileNamespace: string,
    profileName: string,
    data: Profile,
    profileVersion?: Version,
    options?: RequestSettings
  ): Observable<Profile> {
    return this.endpoints.profile
      .saveProfile(
        domainType,
        catalogueItemId,
        profileNamespace,
        profileName,
        data,
        profileVersion,
        options
      )
      .pipe(map((response: ProfileResponse) => response.body));
  }
}
