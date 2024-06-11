import { AttachmentType } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';
import {
  ExporterName,
  ISubmissionState,
  StepName,
  StepResult,
} from 'src/app/data-explorer/specification-submission/type-declarations/submission.resource';

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
export type IsRequiredFn = (
  input: Partial<ISubmissionState>,
  stepName: StepName,
  attachmentType: AttachmentType
) => Observable<StepResult>;

export type RunFn = (
  input: Partial<ISubmissionState>,
  stepName: StepName,
  exporterName: ExporterName
) => Observable<StepResult>;

export type getInputShapeFn = () => (keyof ISubmissionState)[];

export interface FileAttachmentStepServiceStub {
  isRequired: jest.MockedFunction<IsRequiredFn>;
  run: jest.MockedFunction<RunFn>;
  getInputShape: jest.MockedFunction<getInputShapeFn>;
}

export const createFileAttachmentStepServiceStub = (): FileAttachmentStepServiceStub => {
  return {
    isRequired: jest.fn() as jest.MockedFunction<IsRequiredFn>,
    run: jest.fn() as jest.MockedFunction<RunFn>,
    getInputShape: jest.fn() as jest.MockedFunction<getInputShapeFn>,
  };
};
