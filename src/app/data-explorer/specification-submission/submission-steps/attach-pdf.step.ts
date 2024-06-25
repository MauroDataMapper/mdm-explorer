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
  ISubmissionState,
  ISubmissionStep,
  StepName,
  StepResult,
} from '../type-declarations/submission.resource';
import { AttachmentType } from '@maurodatamapper/sde-resources';
import { FileAttachmentStepService } from '../services/fileAttachmentStep.service';
import { BroadcastService } from 'src/app/core/broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class AttachPdfStep implements ISubmissionStep {
  name: StepName = StepName.AttachPdfFile;

  constructor(
    private fileAttachmentStepService: FileAttachmentStepService,
    private broadcastService: BroadcastService
  ) {}

  isRequired(input: Partial<ISubmissionState>): Observable<StepResult> {
    this.broadcastService.submittingDataSpecification('Attaching pdf file...');

    return this.fileAttachmentStepService.isRequired(
      input,
      this.name,
      AttachmentType.DataSpecificationPDF
    );
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    return this.fileAttachmentStepService.run(
      input,
      this.name,
      AttachmentType.DataSpecificationPDF
    );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return this.fileAttachmentStepService.getInputShape();
  }
}
