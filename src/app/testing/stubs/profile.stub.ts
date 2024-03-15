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
  CatalogueItemDomainType,
  MdmIndexBody,
  MultiFacetAwareDomainType,
  Profile,
  ProfileDefinition,
  ProfileSearchResult,
  ProfileValidationErrorList,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type ProfileGetFn = (
  catalogueItemDomainType: CatalogueItemDomainType,
  catalogueItemId: Uuid,
  profileNamespace: string,
  profileName: string
) => Observable<Profile>;

export type ProfileDefinitionFn = (
  profileNamespace: string,
  profileName: string
) => Observable<ProfileDefinition>;

export type ProfileSearchFn = (
  profileNamespace: string,
  profileName: string,
  query: SearchQueryParameters
) => Observable<MdmIndexBody<ProfileSearchResult>>;

export type ProfileSearchCatalogueItemFn = (
  domainType: MultiFacetAwareDomainType,
  id: Uuid,
  profileNamespace: string,
  profileName: string,
  query: SearchQueryParameters
) => Observable<MdmIndexBody<ProfileSearchResult>>;

export type ProfileValidateFn = (
  catalogueItemDomainType: CatalogueItemDomainType,
  catalogueItemId: Uuid,
  profileNamespace: string,
  profileName: string
) => Observable<ProfileValidationErrorList>;

export interface ProfileServiceStub {
  get: jest.MockedFunction<ProfileGetFn>;
  definition: jest.MockedFunction<ProfileDefinitionFn>;
  search: jest.MockedFunction<ProfileSearchFn>;
  searchCatalogueItem: jest.MockedFunction<ProfileSearchCatalogueItemFn>;
  validate: jest.MockedFunction<ProfileValidateFn>;
}

export const createProfileServiceStub = (): ProfileServiceStub => {
  return {
    get: jest.fn() as jest.MockedFunction<ProfileGetFn>,
    definition: jest.fn() as jest.MockedFunction<ProfileDefinitionFn>,
    search: jest.fn() as jest.MockedFunction<ProfileSearchFn>,
    searchCatalogueItem: jest.fn() as jest.MockedFunction<ProfileSearchCatalogueItemFn>,
    validate: jest.fn() as jest.MockedFunction<ProfileValidateFn>,
  };
};
