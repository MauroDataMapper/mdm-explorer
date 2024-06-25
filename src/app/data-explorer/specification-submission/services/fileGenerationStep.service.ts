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
import { ErrorService } from './error.service';
import {
  ExporterName,
  ISubmissionState,
  StepFunction,
  StepName,
  StepResult,
} from '../type-declarations/submission.resource';
import { Observable, map } from 'rxjs';
import { AttachmentsService } from './attachments.service';
import { AttachmentType } from '@maurodatamapper/sde-resources';
import { DataExporterService } from './dataExporter.service';

@Injectable({
  providedIn: 'root',
})
export class FileGenerationStepService {
  constructor(
    private attachmentsService: AttachmentsService,
    private dataExporterService: DataExporterService
  ) {}

  isRequired(
    input: Partial<ISubmissionState>,
    stepName: StepName,
    attachmentType: AttachmentType
  ): Observable<StepResult> {
    if (!input.specificationId) {
      return ErrorService.missingInputError(stepName, StepFunction.IsRequired, 'specificationId');
    }

    if (!input.dataRequestId) {
      return ErrorService.missingInputError(stepName, StepFunction.IsRequired, 'dataRequestId');
    }

    return this.attachmentsService.attachmentsAreRequired(input.dataRequestId, attachmentType);
  }

  run(
    input: Partial<ISubmissionState>,
    stepName: StepName,
    exporterName: ExporterName
  ): Observable<StepResult> {
    if (!input.specificationId) {
      return ErrorService.missingInputError(stepName, StepFunction.Run, 'specificationId');
    }

    return this.dataExporterService
      .exportDataSpecification(input.specificationId, exporterName)
      .pipe(
        map((fileProperties) => {
          return { result: { fileProperties } } as StepResult;
        })
      );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['specificationId', 'dataRequestId', 'cancel'];
  }
}
