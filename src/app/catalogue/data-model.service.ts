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
import {
  CatalogueItemSearchResponse,
  CatalogueItemSearchResult,
  DataClass,
  DataClassDetail,
  DataClassDetailResponse,
  DataClassIndexResponse,
  DataElement,
  DataElementIndexParameters,
  DataElementIndexResponse,
  DataModel,
  DataModelDetail,
  DataModelDetailResponse,
  MdmIndexBody,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { map, Observable, of } from 'rxjs';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { DataClassIdentifier, isDataClass } from './catalogue.types';

/**
 * Service to handle data interactions with Data Models and related items, such as Data Classes.
 */
@Injectable({
  providedIn: 'root',
})
export class DataModelService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Gets a Data Model based on the full path to the model in the catalogue.
   *
   * @param path The full path to the data model.
   * @returns An observable which returns a {@link DataModelDetail}.
   */
  getDataModel(path: string): Observable<DataModelDetail> {
    return this.endpoints.catalogueItem
      .getPath('folders', path)
      .pipe(map((response: DataModelDetailResponse) => response.body));
  }

  /**
   * Gets a collection of Data Classes from a parent catalogue item.
   * The parent could be either a Data Model or parent Data Class.
   *
   * @param parent The parent containing the requested data classes.
   * @returns An observable which returns a list of {@link DataClass} objects.
   */
  getDataClasses(parent: DataModel | DataClass): Observable<DataClass[]> {
    if (!parent || !parent.id) {
      return of([]);
    }

    if (isDataClass(parent) && !parent.model) {
      return of([]);
    }

    const request$: Observable<DataClassIndexResponse> = isDataClass(parent)
      ? this.endpoints.dataClass.listChildDataClasses(parent.model!, parent.id) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      : this.endpoints.dataClass.list(parent.id);

    return request$.pipe(map((response) => response.body.items));
  }

  /**
   * Gets a specific Data Class using the identifiers provided.
   *
   * @param id The identifiers required to locate the Data Class. These comprise the tuple of: Data Model ID, Data Class ID,
   * and (optionally) parent Data Class ID.
   * @returns An observable containing the full {@link DataClassDetail}.
   */
  getDataClass(id: DataClassIdentifier): Observable<DataClassDetail> {
    const request$: Observable<DataClassDetailResponse> = id.parentDataClassId
      ? this.endpoints.dataClass.getChildDataClass(
          id.dataModelId,
          id.parentDataClassId,
          id.dataClassId
        )
      : this.endpoints.dataClass.get(id.dataModelId, id.dataClassId);

    return request$.pipe(map((response) => response.body));
  }

  /**
   * Gets the Data Elements from a Data Class.
   *
   * @param id The identifiers required to locate the Data Class.
   * @param params Optional parameters to control the resulting list
   * @returns An observable of {@link DataElement} objects, including the total number found.
   */
  getDataElements(
    id: DataClassIdentifier,
    params?: DataElementIndexParameters
  ): Observable<MdmIndexBody<DataElement>> {
    return this.endpoints.dataElement
      .list(id.dataModelId, id.dataClassId, params)
      .pipe(map((response: DataElementIndexResponse) => response.body));
  }

  /**
   * Search a Data Model for child catalogue items (Data Classes, Data Elements and Data Types etc)
   * and return the results.
   *
   * @param id The ID of the root Data Model to search.
   * @param params The parameters to control the search.
   * @returns An observable of {@link CatalogueItemSearchResult} objects, including the total number found.
   */
  searchDataModel(
    id: Uuid,
    params: SearchQueryParameters
  ): Observable<MdmIndexBody<CatalogueItemSearchResult>> {
    return this.endpoints.dataModel
      .search(id, params)
      .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  }
}
