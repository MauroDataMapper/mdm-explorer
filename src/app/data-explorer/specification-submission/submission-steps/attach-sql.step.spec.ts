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

import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { cold } from 'jest-marbles';
import { of } from 'rxjs';
import { ISubmissionState, StepResult } from '../type-declarations/submission.resource';
import { AttachSqlStep } from './attach-sql.step';
import { FileAttachmentStepService } from '../services/fileAttachmentStep.service';
import { createFileAttachmentStepServiceStub } from 'src/app/testing/stubs/data-specification-submission/file-attachment-step.service.stub';

describe('AttachSqlStep', () => {
  let step: AttachSqlStep;
  const fileAttachmentStepServiceStub = createFileAttachmentStepServiceStub();

  beforeEach(() => {
    // Default endpoint call
    step = setupTestModuleForService(AttachSqlStep, {
      providers: [
        {
          provide: FileAttachmentStepService,
          useValue: fileAttachmentStepServiceStub,
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance', () => {
    expect(step).toBeTruthy();
  });

  it('getInputShape should return expected fields', () => {
    const expectedInputStep = [
      'specificationId' as keyof ISubmissionState,
      'dataRequestId' as keyof ISubmissionState,
    ];
    fileAttachmentStepServiceStub.getInputShape.mockReturnValueOnce(expectedInputStep);

    const inputStep = step.getInputShape();
    expect(inputStep).toEqual(expectedInputStep);
  });

  it('isRequired should return expected fields', () => {
    const stepResult = { isRequired: true } as StepResult;
    const expected$ = cold('(a|)', { a: stepResult });

    fileAttachmentStepServiceStub.isRequired.mockReturnValueOnce(of(stepResult));
    const input = {} as Partial<ISubmissionState>;
    const actual$ = step.isRequired(input);

    expect(actual$).toBeObservable(expected$);
  });

  it('run should return expected fields', () => {
    const stepResult = { isRequired: true } as StepResult;
    const expected$ = cold('(a|)', { a: stepResult });

    fileAttachmentStepServiceStub.run.mockReturnValueOnce(of(stepResult));
    const input = {} as Partial<ISubmissionState>;
    const actual$ = step.run(input);

    expect(actual$).toBeObservable(expected$);
  });
});
