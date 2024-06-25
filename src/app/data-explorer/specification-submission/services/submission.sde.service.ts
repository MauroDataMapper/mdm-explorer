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
import { RequestEndpointsResearcher } from '@maurodatamapper/sde-resources';
import { DataSpecification, DataSpecificationStatus } from '../../data-explorer.types';
import { Observable, catchError, map, of } from 'rxjs';
import { DataModel } from '@maurodatamapper/mdm-resources';

@Injectable({
  providedIn: 'root',
})
export class SubmissionSDEService {
  constructor(private researcherRequestEndpoints: RequestEndpointsResearcher) {}

  mapToDataSpecificationWithSDEStatusCheck(dataModel: DataModel): Observable<DataSpecification> {
    if (!dataModel.id) {
      return of(this.mapToDataSpecification(dataModel));
    }

    return this.researcherRequestEndpoints.getRequestForDataSpecification(dataModel.id).pipe(
      map((requestResponse) => {
        if (requestResponse && requestResponse?.status !== 'DRAFT') {
          return {
            ...dataModel,
            status: 'submitted' as DataSpecificationStatus,
          } as DataSpecification;
        }
        return this.mapToDataSpecification(dataModel);
      }),
      catchError((error) => {
        console.error('Error fetching request for data specification', error);
        return of(this.mapToDataSpecification(dataModel));
      })
    );
  }

  mapToDataSpecification = (dataModel: DataModel): DataSpecification => {
    return {
      ...dataModel,
      status: this.getDataSpecificationStatus(dataModel),
    } as DataSpecification;
  };

  private getDataSpecificationStatus = (model: DataModel): DataSpecificationStatus => {
    if (model.modelVersion) {
      // Model was finalised, so is now locked
      return 'finalised';
    }

    return 'draft';
  };
}
