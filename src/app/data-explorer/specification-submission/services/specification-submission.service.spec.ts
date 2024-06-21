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
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { MatDialog } from '@angular/material/dialog';
import { createStateServiceStub } from '../../../testing/stubs/data-specification-submission/submission-state.stub';
import { SubmissionStateService } from './submission-state.service';
import { createStepStub } from '../../../testing/stubs/data-specification-submission/step.stub';
import { CreateDataRequestStep } from '../submission-steps/create-data-request.step';
import { of } from 'rxjs';
import { ISubmissionState, StepName, StepResult } from '../type-declarations/submission.resource';
import { GenerateSqlStep } from '../submission-steps/generate-sql.step';
import { AttachSqlStep } from '../submission-steps/attach-sql.step';
import { GeneratePdfStep } from '../submission-steps/generate-pdf.step';
import { AttachPdfStep } from '../submission-steps/attach-pdf.step';
import { SubmitRequestStep } from '../submission-steps/submit-request.step';

describe('SpecificationSubmissionService', () => {
  let service: SpecificationSubmissionService;
  const matDialogStub = createMatDialogStub();
  const stateServiceStub = createStateServiceStub();
  const createDataRequestStepStub = createStepStub(StepName.CreateDataRequest);
  const generateSqlStepStub = createStepStub(StepName.GenerateSqlFile);
  const attachSqlStepStub = createStepStub(StepName.AttachSqlFile);
  const generatePdfStepStub = createStepStub(StepName.GeneratePdfFile);
  const attachPdfStepStub = createStepStub(StepName.AttachPdfFile);
  const submitDataRequestStepStub = createStepStub(StepName.SubmitDataRequest);

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
          provide: CreateDataRequestStep,
          useValue: createDataRequestStepStub,
        },
        {
          provide: GenerateSqlStep,
          useValue: generateSqlStepStub,
        },
        {
          provide: AttachSqlStep,
          useValue: attachSqlStepStub,
        },
        {
          provide: GeneratePdfStep,
          useValue: generatePdfStepStub,
        },
        {
          provide: AttachPdfStep,
          useValue: attachPdfStepStub,
        },
        {
          provide: SubmitRequestStep,
          useValue: submitDataRequestStepStub,
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the initial state with the given specificationId', () => {
    const setSpy = jest.spyOn(stateServiceStub, 'set');
    const specificationId = 'test-id';
    jest
      .spyOn(createDataRequestStepStub, 'isRequired')
      .mockReturnValue(of({ result: {}, isRequired: false }));

    service.submit(specificationId).subscribe();
    expect(setSpy).toHaveBeenCalledWith({ specificationId });
  });

  it('should run the createDataRequest step and return a boolean', (done) => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const expectedRunInput = { specificationId: 'test-id' };
    const dataRequestId = 'dataRequestId';
    const expectedRunResult = true;

    createDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    stateServiceStub.getStepInputFromShape.mockReturnValueOnce({ specificationId: 'test-id' });

    // Set the spys
    const isRequiredSpy = jest.spyOn(createDataRequestStepStub, 'isRequired');
    const runSpy = jest.spyOn(createDataRequestStepStub, 'run');

    isRequiredSpy.mockReturnValue(of({ result: {}, isRequired: true } as StepResult));
    runSpy.mockReturnValue(
      of({ result: { dataRequestId, succeeded: true }, isRequired: false } as StepResult)
    );

    service.submit('test-id').subscribe((result: boolean) => {
      expect(result).toEqual(expectedRunResult);
      done();
    });

    expect(isRequiredSpy).toHaveBeenCalled();
    expect(runSpy).toHaveBeenCalledWith(expectedRunInput);
  });

  it('should save the step result to the state', () => {
    const setSpy = jest.spyOn(stateServiceStub, 'set');
    const stepResult = {
      isRequired: false,
      cancel: false,
      result: { specificationId: 'test-id' },
    } as StepResult;

    jest.spyOn(createDataRequestStepStub, 'isRequired').mockReturnValue(of(stepResult));

    service.submit('test-id').subscribe();

    // Check the first call
    expect(setSpy).toHaveBeenCalledWith({
      specificationId: 'test-id',
    });
  });

  it('run all submission steps', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const expectedRunInput = { specificationId: 'test-id' };
    const dataRequestId = 'dataRequestId';
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: true } as StepResult);
    const run$ = of({
      result: { dataRequestId, succeeded: true },
      isRequired: false,
    } as StepResult);

    stateServiceStub.getStepInputFromShape.mockReturnValue({ specificationId: 'test-id' });

    // Create Data Request
    createDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyCreateDataRequest = jest.spyOn(createDataRequestStepStub, 'isRequired');
    const runSpyCreateDataRequest = jest.spyOn(createDataRequestStepStub, 'run');
    isRequiredSpyCreateDataRequest.mockReturnValue(isRequired$);
    runSpyCreateDataRequest.mockReturnValue(run$);

    // Generate SQL
    generateSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyGenerateSQL = jest.spyOn(generateSqlStepStub, 'isRequired');
    const runSpyGenerateSQL = jest.spyOn(generateSqlStepStub, 'run');
    isRequiredSpyGenerateSQL.mockReturnValue(isRequired$);
    runSpyGenerateSQL.mockReturnValue(run$);

    // Attach SQL
    attachSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyAttachSQL = jest.spyOn(attachSqlStepStub, 'isRequired');
    const runSpyAttachSQL = jest.spyOn(attachSqlStepStub, 'run');
    isRequiredSpyAttachSQL.mockReturnValue(isRequired$);
    runSpyAttachSQL.mockReturnValue(run$);

    // Generate PDF
    generatePdfStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyGeneratePDF = jest.spyOn(generatePdfStepStub, 'isRequired');
    const runSpyGeneratePDF = jest.spyOn(generatePdfStepStub, 'run');
    isRequiredSpyGeneratePDF.mockReturnValue(isRequired$);
    runSpyGeneratePDF.mockReturnValue(run$);

    // Attach PDF
    attachPdfStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyAttachPDF = jest.spyOn(attachPdfStepStub, 'isRequired');
    const runSpyAttachPDF = jest.spyOn(attachPdfStepStub, 'run');
    isRequiredSpyAttachPDF.mockReturnValue(isRequired$);
    runSpyAttachPDF.mockReturnValue(run$);

    // Submit Data Request
    submitDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpySubmitDataRequest = jest.spyOn(submitDataRequestStepStub, 'isRequired');
    const runSpySubmitDataRequest = jest.spyOn(submitDataRequestStepStub, 'run');
    isRequiredSpySubmitDataRequest.mockReturnValue(isRequired$);
    runSpySubmitDataRequest.mockReturnValue(run$);

    // Submit the Data Specification
    service.submit('test-id').subscribe((result: boolean) => {
      expect(result).toEqual(expectedRunResult);
    });

    // Check the results
    expect(isRequiredSpyCreateDataRequest).toHaveBeenCalled();
    expect(runSpyCreateDataRequest).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyGenerateSQL).toHaveBeenCalled();
    expect(runSpyGenerateSQL).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyAttachSQL).toHaveBeenCalled();
    expect(runSpyAttachSQL).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyGeneratePDF).toHaveBeenCalled();
    expect(runSpyGeneratePDF).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyAttachPDF).toHaveBeenCalled();
    expect(runSpyAttachPDF).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpySubmitDataRequest).toHaveBeenCalled();
    expect(runSpySubmitDataRequest).toHaveBeenCalledWith(expectedRunInput);
  });

  it('step run is not called when isRequired is false', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const dataRequestId = 'dataRequestId';
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: false } as StepResult);
    const run$ = of({
      result: { dataRequestId, succeeded: true },
      isRequired: false,
    } as StepResult);

    stateServiceStub.getStepInputFromShape.mockReturnValue({ specificationId: 'test-id' });

    // Create Data Request
    createDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyCreateDataRequest = jest.spyOn(createDataRequestStepStub, 'isRequired');
    const runSpyCreateDataRequest = jest.spyOn(createDataRequestStepStub, 'run');
    isRequiredSpyCreateDataRequest.mockReturnValue(isRequired$);
    runSpyCreateDataRequest.mockReturnValue(run$);

    // Generate SQL
    generateSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyGenerateSQL = jest.spyOn(generateSqlStepStub, 'isRequired');
    const runSpyGenerateSQL = jest.spyOn(generateSqlStepStub, 'run');
    isRequiredSpyGenerateSQL.mockReturnValue(isRequired$);
    runSpyGenerateSQL.mockReturnValue(run$);

    // Attach SQL
    attachSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyAttachSQL = jest.spyOn(attachSqlStepStub, 'isRequired');
    const runSpyAttachSQL = jest.spyOn(attachSqlStepStub, 'run');
    isRequiredSpyAttachSQL.mockReturnValue(isRequired$);
    runSpyAttachSQL.mockReturnValue(run$);

    // Generate PDF
    generatePdfStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyGeneratePDF = jest.spyOn(generatePdfStepStub, 'isRequired');
    const runSpyGeneratePDF = jest.spyOn(generatePdfStepStub, 'run');
    isRequiredSpyGeneratePDF.mockReturnValue(isRequired$);
    runSpyGeneratePDF.mockReturnValue(run$);

    // Attach PDF
    attachPdfStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyAttachPDF = jest.spyOn(attachPdfStepStub, 'isRequired');
    const runSpyAttachPDF = jest.spyOn(attachPdfStepStub, 'run');
    isRequiredSpyAttachPDF.mockReturnValue(isRequired$);
    runSpyAttachPDF.mockReturnValue(run$);

    // Submit Data Request
    submitDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpySubmitDataRequest = jest.spyOn(submitDataRequestStepStub, 'isRequired');
    const runSpySubmitDataRequest = jest.spyOn(submitDataRequestStepStub, 'run');
    isRequiredSpySubmitDataRequest.mockReturnValue(isRequired$);
    runSpySubmitDataRequest.mockReturnValue(run$);

    // Submit the Data Specification
    service.submit('test-id').subscribe((result: boolean) => {
      expect(result).toEqual(expectedRunResult);
    });

    // Check the results
    expect(isRequiredSpyCreateDataRequest).toHaveBeenCalled();
    expect(runSpyCreateDataRequest).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyGenerateSQL).toHaveBeenCalled();
    expect(runSpyGenerateSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachSQL).toHaveBeenCalled();
    expect(runSpyAttachSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyGeneratePDF).toHaveBeenCalled();
    expect(runSpyGeneratePDF).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachPDF).toHaveBeenCalled();
    expect(runSpyAttachPDF).toHaveBeenCalledTimes(0);

    expect(isRequiredSpySubmitDataRequest).toHaveBeenCalled();
    expect(runSpySubmitDataRequest).toHaveBeenCalledTimes(0);
  });

  it('subsequent steps are not called when a step is cancelled', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const expectedRunInput = { specificationId: 'test-id' };
    const dataRequestId = 'dataRequestId';
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: true } as StepResult);
    const run$ = of({
      result: { dataRequestId, cancel: true },
      isRequired: false,
    } as StepResult);

    stateServiceStub.getStepInputFromShape.mockReturnValueOnce({ specificationId: 'test-id' });
    stateServiceStub.getStepInputFromShape.mockReturnValue({
      specificationId: 'test-id',
      cancel: true,
    });

    // Create Data Request
    createDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyCreateDataRequest = jest.spyOn(createDataRequestStepStub, 'isRequired');
    const runSpyCreateDataRequest = jest.spyOn(createDataRequestStepStub, 'run');
    isRequiredSpyCreateDataRequest.mockReturnValue(isRequired$);
    runSpyCreateDataRequest.mockReturnValue(run$);

    // Generate SQL
    generateSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyGenerateSQL = jest.spyOn(generateSqlStepStub, 'isRequired');
    const runSpyGenerateSQL = jest.spyOn(generateSqlStepStub, 'run');
    isRequiredSpyGenerateSQL.mockReturnValue(isRequired$);
    runSpyGenerateSQL.mockReturnValue(run$);

    // Attach SQL
    attachSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyAttachSQL = jest.spyOn(attachSqlStepStub, 'isRequired');
    const runSpyAttachSQL = jest.spyOn(attachSqlStepStub, 'run');
    isRequiredSpyAttachSQL.mockReturnValue(isRequired$);
    runSpyAttachSQL.mockReturnValue(run$);

    // Generate PDF
    generatePdfStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyGeneratePDF = jest.spyOn(generatePdfStepStub, 'isRequired');
    const runSpyGeneratePDF = jest.spyOn(generatePdfStepStub, 'run');
    isRequiredSpyGeneratePDF.mockReturnValue(isRequired$);
    runSpyGeneratePDF.mockReturnValue(run$);

    // Attach PDF
    attachPdfStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyAttachPDF = jest.spyOn(attachPdfStepStub, 'isRequired');
    const runSpyAttachPDF = jest.spyOn(attachPdfStepStub, 'run');
    isRequiredSpyAttachPDF.mockReturnValue(isRequired$);
    runSpyAttachPDF.mockReturnValue(run$);

    // Submit Data Request
    submitDataRequestStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpySubmitDataRequest = jest.spyOn(submitDataRequestStepStub, 'isRequired');
    const runSpySubmitDataRequest = jest.spyOn(submitDataRequestStepStub, 'run');
    isRequiredSpySubmitDataRequest.mockReturnValue(isRequired$);
    runSpySubmitDataRequest.mockReturnValue(run$);

    // Submit the Data Specification
    service.submit('test-id').subscribe((result: boolean) => {
      expect(result).toEqual(expectedRunResult);
    });

    // Check the results
    expect(isRequiredSpyCreateDataRequest).toHaveBeenCalled();
    expect(runSpyCreateDataRequest).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyGenerateSQL).toHaveBeenCalledTimes(0);
    expect(runSpyGenerateSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachSQL).toHaveBeenCalledTimes(0);
    expect(runSpyAttachSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyGeneratePDF).toHaveBeenCalledTimes(0);
    expect(runSpyGeneratePDF).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachPDF).toHaveBeenCalledTimes(0);
    expect(runSpyAttachPDF).toHaveBeenCalledTimes(0);

    expect(isRequiredSpySubmitDataRequest).toHaveBeenCalledTimes(0);
    expect(runSpySubmitDataRequest).toHaveBeenCalledTimes(0);
  });
});
