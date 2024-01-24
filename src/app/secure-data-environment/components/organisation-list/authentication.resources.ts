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
import { Uuid } from '@maurodatamapper/mdm-resources';

export interface SdeOpenIdConnectProvider {
  name: string;
  label: string;
  imageUrl?: string;
}

export const sdeOpenIdConnectProviders: SdeOpenIdConnectProvider[] = [
  {
    name: 'microsoft-azure',
    label: 'Microsoft Azure',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/256px-Microsoft_logo.svg.png',
  },
  {
    name: 'keycloak',
    label: 'Keycloak',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Keycloak_Logo.png',
  },
];

export interface SdeResearchUser {
  id: Uuid;
  createdAt?: Date;
  email: string;
  mauroCoreUser?: string;
  isDeleted: boolean;
  oidcIssuingAuthority?: string;
  oidcSubject?: string;
  preferredName?: string;
  // preferredContactDetails?: string;
  // shortBio?: string;
  // vettingProcessDetails?: string;
}