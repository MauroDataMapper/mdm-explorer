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
import { map, Observable } from 'rxjs';
import {
  ExporterName,
  ISubmissionState,
  ISubmissionStep,
  StepName,
  StepResult,
} from '../submission.resource';
import { AttachmentType, RequestEndpoints } from '@maurodatamapper/sde-resources';
import { DataExporterService } from '../services/dataExporter.service';

@Injectable({
  providedIn: 'root',
})
export class GenerateSqlStep implements ISubmissionStep {
  name: StepName = 'Generate sql file';

  constructor(
    private requestEndpoints: RequestEndpoints,
    private dataExporterService: DataExporterService
  ) {}

  isRequired(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.specificationId) {
      return this.observableError(
        'Generate Meql Step (isRequired) expects Specification Id, which was not provided.'
      );
    }

    if (!input.dataRequestId) {
      return this.observableError(
        'Generate Meql Step (isRequired) expects Data Request Id, which was not provided.'
      );
    }

    return this.requestEndpoints.listAttachments(input.dataRequestId).pipe(
      map((attachmentsList) => {
        const isRequired = !attachmentsList.some(
          (attachment) => attachment.attachmentType === AttachmentType.DataSpecificationSQL
        );
        const stepResult: StepResult = {
          result: {},
          isRequired,
        };
        return stepResult;
      })
    );
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.specificationId) {
      return this.observableError(
        'Generate Meql Step (run) expects Specification Id, which was not provided.'
      );
    }

    return this.dataExporterService
      .exportDataSpecification(input.specificationId, ExporterName.DataModelSqlExporterService)
      .pipe(
        map((url) => {
          return { result: { pathToExportFile: url } } as StepResult;
        })
      );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['specificationId', 'dataRequestId'];
  }

  private observableError(errorMessage: string): Observable<StepResult> {
    return new Observable((observer) => {
      observer.error(new Error(errorMessage));
    });
  }
}
