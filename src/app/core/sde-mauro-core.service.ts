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
  IMauroCoreService,
  MauroDataSpecificationDTO,
  RequestResponse,
  RequestType,
  Uuid,
  RequestEndpointsResearcher,
  ProjectEndpointsResearcher,
} from '@maurodatamapper/sde-resources';
import { SecurityService } from '../security/security.service';
import { DataSpecificationService } from '../data-explorer/data-specification.service';
import { DataSpecification } from '../data-explorer/data-explorer.types';
import { catchError, EMPTY, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { SpecificationSubmissionService } from '../data-explorer/specification-submission/services/specification-submission.service';
import { SubmissionType } from '../data-explorer/specification-submission/type-declarations/submission.resource';
import { DataSpecificationResearchPluginService } from '../mauro/data-specification-research-plugin.service';
import { SubmissionSDEService } from '../data-explorer/specification-submission/services/submission.sde.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class SdeMauroCoreService implements IMauroCoreService {
  constructor(
    private security: SecurityService,
    private dataSpecification: DataSpecificationService,
    private specificationSubmissionService: SpecificationSubmissionService,
    private dataSpecificationService: DataSpecificationService,
    private researcherRequestEndpoints: RequestEndpointsResearcher,
    private projectRequestEndpoints: ProjectEndpointsResearcher,
    private toastr: ToastrService
  ) {}

  getFinalisedDataSpecifications(): Observable<MauroDataSpecificationDTO[]> {
    const user = this.security.getSignedInUser();
    if (user) {
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
      return of([]);
    }
  }

  attachMauroDataSpecificationToRequest(
    specificationId: Uuid,
    request: RequestResponse
  ): Observable<boolean> {
    const submissionType =
      request.type === RequestType.Data
        ? SubmissionType.AttachSqlAndPdfToRequest
        : SubmissionType.AttachPdfToRequest;
    return this.specificationSubmissionService.submit(specificationId, submissionType, request.id);
  }

  copyMauroDataSpecification(
    specificationId: Uuid
  ): Observable<MauroDataSpecificationDTO | undefined> {
    // Returning EMPTY exists the Observable stack so we want to return of(undefined) instead
    // in most cases.

    // Need to check if we need to copy first
    return forkJoin([
      this.projectRequestEndpoints.getProjectForDataSpecification(specificationId),
      this.researcherRequestEndpoints.getRequestForDataSpecification(specificationId),
    ]).pipe(
      switchMap(([project, request]) => {
        console.log('NIGE - copyMauroDataSpecification - 1', project, request);
        if (!project && !request) {
          return forkJoin([of(undefined), of(undefined)]);
        }

        return forkJoin([
          this.dataSpecificationService.get(specificationId),
          this.dataSpecificationService.getDataSpecificationFolder(),
        ]);
      }),
      switchMap(([dataSpecification, dataSpecificationFolder]) => {
        console.log('NIGE - copyMauroDataSpecification - 2');
        if (!dataSpecification || !dataSpecificationFolder) {
          return of(undefined);
        }

        // We have to be careful with the date format otherwise DITA errors occur when generating the PDF.
        // This format is a workaround.
        const date = new Date();
        const formattedDate = date
          .toISOString()
          .replace(/[.:]/g, '-')
          .replace(/[T]/g, ' ')
          .replace(/[Z]/g, '');

        return this.dataSpecificationService.fork(
          dataSpecification,
          `${dataSpecification.label} [COPY - ${formattedDate}]`,
          {
            targetFolder: dataSpecificationFolder,
          },
          false,
          false
        );
      }),
      switchMap((newDataSpecification) => {
        console.log('NIGE - copyMauroDataSpecification - 3');
        if (!newDataSpecification) {
          return of(undefined);
        }
        return this.dataSpecificationService.finalise(newDataSpecification);
      }),
      switchMap((newDataSpecification) => {
        console.log('NIGE - copyMauroDataSpecification - 4');
        if (!newDataSpecification) {
          return of(undefined);
        }

        return of({
          mauroId: newDataSpecification.id as Uuid,
          name: `${newDataSpecification.label} (${newDataSpecification.modelVersion})`,
        } as MauroDataSpecificationDTO);
      }),
      catchError((error) => {
        this.toastr.error(
          `There was a problem copying the data specification. ${error}`,
          'Data specification copying error'
        );
        return EMPTY;
      })
    );
  }
}
