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
  MdmResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { MdmEndpointsService } from './mdm-endpoints.service';
import { DataSpecification } from '../data-explorer/data-explorer.types';
import { SubmissionSDEService } from '../data-explorer/specification-submission/services/submission.sde.service';

@Injectable({
  providedIn: 'root',
})
export class DataSpecificationResearchPluginService {
  constructor(
    private endpoints: MdmEndpointsService,
    private submissionSDEService: SubmissionSDEService
  ) {}

  finaliseDataSpecification(id: Uuid): Observable<DataModelDetail> {
    return this.endpoints.pluginResearch.submitDataSpecification(id).pipe(
      switchMap(() => this.endpoints.dataModel.get(id)),
      map((response: DataModelDetailResponse) => response.body)
    );
  }

  listSharedDataSpecifications(): Observable<DataSpecification[]> {
    return this.endpoints.pluginResearch
      .listSharedDataSpecifications()
      .pipe(
        map((response: DataModelIndexResponse) =>
          response.body.items.map(this.submissionSDEService.mapToDataSpecification)
        )
      );
  }

  getLatestModelDataSpecifications(): Observable<DataSpecification[]> {
    return this.endpoints.pluginResearch.getLatestModelDataSpecifications().pipe(
      switchMap((response: DataModelIndexResponse): Observable<DataModel[]> => {
        return of(response.body.items); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }),
      switchMap((dataModels: DataModel[]) => {
        if (dataModels.length === 0) {
          return of([]);
        }
        const dataSpecification$ = dataModels.map((dataModel) => {
          return this.submissionSDEService.mapToDataSpecificationWithSDEStatusCheck(dataModel);
        });
        return forkJoin(dataSpecification$);
      })
    );
  }

  getRequiredCoreTableDataElementIds(dataElementsIds: Uuid[]): Observable<Uuid[]> {
    return this.endpoints.pluginResearch
      .getRequiredCoreTableDataElementIds(dataElementsIds)
      .pipe(map((response: MdmResponse<Uuid[]>) => response.body));
  }
}
