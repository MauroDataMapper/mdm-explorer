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
  ISubmissionState,
  StepFunction,
  StepName,
  StepResult,
} from '../type-declarations/submission.resource';
import { Observable } from 'rxjs';
import { AttachmentsService } from './attachments.service';
import { AttachmentType } from '@maurodatamapper/sde-resources';

@Injectable({
  providedIn: 'root',
})
export class FileAttachmentStepService {
  constructor(private attachmentsService: AttachmentsService) {}

  isRequired(
    input: Partial<ISubmissionState>,
    stepName: StepName,
    attachmentType: AttachmentType
  ): Observable<StepResult> {
    const validationError = this.validateInput(input, stepName, StepFunction.IsRequired);
    if (validationError) {
      return validationError;
    }

    // We need this second check to keep typescript happy
    if (!this.inputIsDefined(input)) {
      return ErrorService.observableError(`${stepName} (run) unexpected validation failure.`);
    }

    return this.attachmentsService.attachmentsAreRequired(input.dataRequestId, attachmentType);
  }

  run(
    input: Partial<ISubmissionState>,
    stepName: StepName,
    attachmentType: AttachmentType
  ): Observable<StepResult> {
    const validationError = this.validateInput(input, stepName, StepFunction.Run);
    if (validationError) {
      return validationError;
    }

    // We need this second check to keep typescript happy
    if (!this.inputIsDefined(input)) {
      return ErrorService.observableError(`${stepName} (run) unexpected validation failure.`);
    }

    return this.attachmentsService.attachFile(
      input.dataRequestId,
      input.fileProperties,
      attachmentType,
      input.specificationId
    );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['dataRequestId', 'fileProperties', 'cancel', 'specificationId'];
  }

  private inputIsDefined(input: Partial<ISubmissionState>): input is ISubmissionState {
    return !!input.dataRequestId && !!input.fileProperties;
  }

  private validateInput(
    input: Partial<ISubmissionState>,
    stepName: StepName,
    functionName: StepFunction
  ): Observable<StepResult> | null {
    if (!input.dataRequestId) {
      return ErrorService.missingInputError(stepName, functionName, 'dataRequestId');
    }

    if (!input.fileProperties) {
      return ErrorService.missingInputError(stepName, functionName, 'fileProperties');
    }

    return null;
  }
}
