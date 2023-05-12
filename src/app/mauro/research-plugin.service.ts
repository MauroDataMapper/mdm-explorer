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
  DataModel,
  DataModelDetail,
  DataModelDetailResponse,
  DataModelIndexResponse,
  FolderDetail,
  FolderDetailResponse,
  MdmIndexResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { map, Observable, of, switchMap } from 'rxjs';
import { KeyValueIdentifier } from './mauro.types';
import { MdmEndpointsService } from './mdm-endpoints.service';
import {
  PluginResearchContactPayload,
  PluginResearchContactResponse,
} from './plugins/plugin-research.resource';
import {
  DataSpecification,
  mapToDataSpecification,
} from '../data-explorer/data-explorer.types';

@Injectable({
  providedIn: 'root',
})
export class ResearchPluginService {
  constructor(private endpoints: MdmEndpointsService) {}

  contact(data: PluginResearchContactPayload): Observable<PluginResearchContactPayload> {
    return this.endpoints.pluginResearch
      .contact(data)
      .pipe(map((response: PluginResearchContactResponse) => response.body));
  }

  submitDataSpecification(id: Uuid): Observable<DataModelDetail> {
    return this.endpoints.pluginResearch.submitDataSpecification(id).pipe(
      switchMap(() => this.endpoints.dataModel.get(id)),
      map((response: DataModelDetailResponse) => response.body)
    );
  }

  userFolder(): Observable<FolderDetail> {
    return this.endpoints.pluginResearch
      .userFolder()
      .pipe(map((response: FolderDetailResponse) => response.body));
  }

  templateFolder(): Observable<FolderDetail> {
    return this.endpoints.pluginResearch
      .templateFolder()
      .pipe(map((response: FolderDetailResponse) => response.body));
  }

  rootDataModel(): Observable<DataModelDetail> {
    return this.endpoints.pluginResearch
      .rootDataModel()
      .pipe(map((response: FolderDetailResponse) => response.body));
  }

  theme(): Observable<KeyValueIdentifier[]> {
    return this.endpoints.pluginResearch
      .theme()
      .pipe(map((response: MdmIndexResponse<KeyValueIdentifier>) => response.body.items));
  }

  getLatestModelDataSpecifications(): Observable<DataSpecification[]> {
    return this.endpoints.pluginResearch.getLatestModelDataSpecifications().pipe(
      switchMap((response: DataModelIndexResponse): Observable<DataModel[]> => {
        return of(response.body.items); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      map((dataModels: DataModel[]) => dataModels.map(mapToDataSpecification))
    );
  }
}
