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
  TerminologyDetail,
  TerminologyDetailResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from './mdm-endpoints.service';

/**
 * Service to handle data interactions with Terminologies and related items, such as Terms and Code Sets.
 */
@Injectable({
  providedIn: 'root',
})
export class TerminologyService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Gets a Terminology or Code Set.
   *
   * @param id The ID of the model to get.
   * @param domainType Optional domain type of the model, either "Terminology" or "CodeSet". If not provided, "Terminology" is presumed.
   * @returns The matching model
   */
  getModel(
    id: Uuid,
    domainType?: CatalogueItemDomainType
  ): Observable<TerminologyDetail> {
    const request$ =
      domainType === CatalogueItemDomainType.CodeSet
        ? this.endpoints.codeSet.get(id)
        : this.endpoints.terminology.get(id);
    return request$.pipe(map((response: TerminologyDetailResponse) => response.body));
  }
}
