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
import { Observable } from 'rxjs';
import {
  ExporterName,
  ISubmissionState,
  ISubmissionStep,
  StepName,
  StepResult,
} from '../type-declarations/submission.resource';
import { AttachmentType } from '@maurodatamapper/sde-resources';
import { FileGenerationStepService } from '../services/fileGenerationStep.service';
import { SubmissionBroadcastService } from '../services/submission.broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class GeneratePdfStep implements ISubmissionStep {
  name: StepName = StepName.GeneratePdfFile;

  constructor(
    private fileGenerationStepService: FileGenerationStepService,
    private submissionBroadcastService: SubmissionBroadcastService
  ) {}

  isRequired(input: Partial<ISubmissionState>): Observable<StepResult> {
    this.submissionBroadcastService.broadcast('Generating pdf file...');

    return this.fileGenerationStepService.isRequired(
      input,
      this.name,
      AttachmentType.DataSpecificationPDF
    );
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    return this.fileGenerationStepService.run(
      input,
      this.name,
      ExporterName.DataModelPdfExporterService
    );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return this.fileGenerationStepService.getInputShape();
  }
}
