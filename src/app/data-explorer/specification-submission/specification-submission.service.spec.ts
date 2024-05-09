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
import { SpecificationSubmissionService } from './specification-submission.service';
import { ComponentHarness, setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { MatDialog } from '@angular/material/dialog';
import { createStateServiceStub } from './testing/submission-state.stub';
import { SubmissionStateService } from './submission-state.service';
import { createStepStub } from './testing/step.stub';
import { SelectProjectStep } from './submission-steps/select-project.step';
import { of } from 'rxjs';
import { ISubmissionState, StepResult } from './submission.resource';

describe('SpecificationSubmissionService', () => {
  let service: SpecificationSubmissionService;
  const matDialogStub = createMatDialogStub();
  const stateServiceStub = createStateServiceStub();
  const selectProjectStepStub = createStepStub('SelectProject');

  beforeEach(() => {
    service = setupTestModuleForService(SpecificationSubmissionService, {
      providers: [
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
        {
          provide: SubmissionStateService,
          useValue: stateServiceStub,
        },
        {
          provide: SelectProjectStep,
          useValue: selectProjectStepStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the initial state with the given specificationId', () => {
    const setSpy = jest.spyOn(stateServiceStub, 'set');
    const specificationId = 'test-id';
    jest
      .spyOn(selectProjectStepStub, 'isRequired')
      .mockReturnValue(of({ result: {}, isRequired: false }));

    service.submit(specificationId).subscribe();
    expect(setSpy).toHaveBeenCalledWith({ specificationId });
  });

  it('should run the selectProject step and return a stepResult', (done) => {
    // Set the steps
    service.submissionSteps = [selectProjectStepStub];

    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const expectedRunInput = { specificationId: 'test-id' };
    const expectedProjectId = 'project-id';
    const expectedRunResult: StepResult = {
      result: { projectId: expectedProjectId },
      isRequired: false,
    };

    selectProjectStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    stateServiceStub.getStepInputFromShape.mockReturnValueOnce({ specificationId: 'test-id' });

    // Set the spys
    const isRequiredSpy = jest.spyOn(selectProjectStepStub, 'isRequired');
    const runSpy = jest.spyOn(selectProjectStepStub, 'run');

    isRequiredSpy.mockReturnValue(of({ result: {}, isRequired: true } as StepResult));
    runSpy.mockReturnValue(
      of({ result: { projectId: expectedProjectId }, isRequired: false } as StepResult)
    );

    service.submit('test-id').subscribe((result: StepResult) => {
      expect(result).toEqual(expectedRunResult);
      done();
    });

    expect(isRequiredSpy).toHaveBeenCalled();
    expect(runSpy).toHaveBeenCalledWith(expectedRunInput);
  });

  it('should save the step result to the state', () => {
    const setSpy = jest.spyOn(stateServiceStub, 'set');
    const stepResult = { isRequired: false, result: { projectId: 'project-id' } };

    jest.spyOn(selectProjectStepStub, 'isRequired').mockReturnValue(of(stepResult));

    service.submit('test-id').subscribe();

    expect(setSpy).toHaveBeenCalledWith(stepResult.result);
  });
});
