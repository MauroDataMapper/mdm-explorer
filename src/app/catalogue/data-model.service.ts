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
  DataClass,
  DataClassIndexResponse,
  DataModel,
  DataModelDetail,
  DataModelDetailResponse,
} from '@maurodatamapper/mdm-resources';
import { map, Observable, of } from 'rxjs';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { isDataClass } from './catalogue.types';

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
}
