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
import { IMauroCoreService, MauroDataSpecificationDTO } from '@maurodatamapper/sde-resources';
import { SecurityService } from '../security/security.service';
import { DataSpecificationService } from '../data-explorer/data-specification.service';
import { DataSpecification } from '../data-explorer/data-explorer.types';
import { map, Observable, of } from 'rxjs';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { SpecificationSubmissionService } from '../data-explorer/specification-submission/services/specification-submission.service';
import { SubmissionType } from '../data-explorer/specification-submission/type-declarations/submission.resource';

@Injectable({
  providedIn: 'root',
})
export class SdeMauroCoreService implements IMauroCoreService {
  constructor(
    private security: SecurityService,
    private dataSpecification: DataSpecificationService,
    private specificationSubmissionService: SpecificationSubmissionService
  ) {}

  getFinalisedDataSpecifications(): Observable<MauroDataSpecificationDTO[]> {
    // return [{ mauroId: '1', name: 'My Name' } as MauroDataSpecificationDTO];

    console.log('NIGE - getFinalisedDataSpecifications');
    const user = this.security.getSignedInUser();
    if (user) {
      console.log('NIGE - getFinalisedDataSpecifications - has user');
      return this.dataSpecification.list().pipe(
        map((dataSpecifications: DataSpecification[]) => {
          return dataSpecifications
            .filter(
              (dataSpecification) =>
                dataSpecification.status === 'finalised' && !!dataSpecification.id
            )
            .map((dataSpecification: DataSpecification) => ({
              mauroId: dataSpecification.id as Uuid,
              name: `${dataSpecification.label} (${dataSpecification.modelVersion})`,
            }));
        })
      );
    } else {
      console.log('NIGE - getFinalisedDataSpecifications - no user');
      return of([]);
    }
  }

  attachMauroDataSpecificationToRequest(
    specificationId: Uuid,
    requestId: Uuid
  ): Observable<boolean> {
    console.log('NIGE - attachDataSpecificationToRequest');
    return this.specificationSubmissionService.submit(
      specificationId,
      SubmissionType.AttachPdfToRequest,
      requestId
    );
  }
}
