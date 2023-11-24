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
import { Uuid, MdmIndexResponse, MdmIndexBody } from '@maurodatamapper/mdm-resources';
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';

export interface SummaryMetadata {
  id: Uuid;
  createdBy: string;
  description: string;
  label: string;
  lastUpdated: string;
  summaryMetadataType: string;
}

export interface SummaryMetadataReport {
  id: Uuid;
  lastUpdated: string;
  reportDate: string;
  reportValue: any;
}

/**
 * Service to handle data interactions with Data Models and related items, such as Data Classes.
 */
@Injectable({
  providedIn: 'root',
})
export class SummaryMetadataService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * List summary metadata for the catalogue item
   *
   * @param catalogueItemdomainType For example 'DataElement'
   * @param catalogueItemId For example to data element ID
   * @returns An observable which returns a {@link MdmIndexBody<SummaryMetadata>}.
   */
  list(
    catalogueItemDomainType: string,
    catalogueItemId: Uuid,
  ): Observable<MdmIndexBody<SummaryMetadata>> {
    return this.endpoints.summaryMetadata
      .list(catalogueItemDomainType, catalogueItemId)
      .pipe(map((response: MdmIndexResponse<SummaryMetadata>) => response.body));
  }

  /**
   * List summary metadata reports for the summary metadata on the catalogue item
   *
   * @param catalogueItemdomainType For example 'DataElement'
   * @param catalogueItemId For example to data element ID
   * @returns An observable which returns a {@link MdmIndexBody<SummaryMetadataReport>}.
   */
  listReports(
    catalogueItemDomainType: string,
    catalogueItemId: Uuid,
    summaryMetadataId: Uuid,
  ): Observable<MdmIndexBody<SummaryMetadataReport>> {
    return this.endpoints.summaryMetadata
      .listReports(catalogueItemDomainType, catalogueItemId, summaryMetadataId)
      .pipe(map((response: MdmIndexResponse<SummaryMetadataReport>) => response.body));
  }
}
