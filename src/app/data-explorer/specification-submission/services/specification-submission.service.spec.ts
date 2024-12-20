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
import { of, throwError } from 'rxjs';
import {
  ISubmissionState,
  StepName,
  StepResult,
  SubmissionType,
} from '../type-declarations/submission.resource';
import { GenerateSqlStep } from '../submission-steps/generate-sql.step';
import { AttachSqlStep } from '../submission-steps/attach-sql.step';
import { GeneratePdfStep } from '../submission-steps/generate-pdf.step';
import { AttachPdfStep } from '../submission-steps/attach-pdf.step';
import { SimpleDialogComponent } from '../../simple-dialog/simple-dialog.component';
import {
  MembershipEndpointsResearcher,
  RequestEndpointsResearcher,
  RequestResponse,
  RequestService,
  RequestType,
} from '@maurodatamapper/sde-resources';
import { createRequestEndpointsResearcherStub } from 'src/app/testing/stubs/sde/request-endpoints-researcher.stub';
import { createRequestServiceStub } from 'src/app/testing/stubs/sde/request-service.stub';
import { createMembershipEndpointsResearcherStub } from 'src/app/testing/stubs/sde/memberships-endpoints-researcher.stub';

describe('SpecificationSubmissionService', () => {
  let service: SpecificationSubmissionService;
  const matDialogStub = createMatDialogStub();
  const stateServiceStub = createStateServiceStub();
  const generateSqlStepStub = createStepStub(StepName.GenerateSqlFile);
  const attachSqlStepStub = createStepStub(StepName.AttachSqlFile);
  const generatePdfStepStub = createStepStub(StepName.GeneratePdfFile);
  const attachPdfStepStub = createStepStub(StepName.AttachPdfFile);
  const requestEndpointsResearcherStub = createRequestEndpointsResearcherStub();
  const membershipEndpointsResearcherStub = createMembershipEndpointsResearcherStub();
  const requestServiceStub = createRequestServiceStub();
  const request = { status: 'DRAFT', type: RequestType.Data } as RequestResponse;

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
          provide: RequestEndpointsResearcher,
          useValue: requestEndpointsResearcherStub,
        },
        {
          provide: MembershipEndpointsResearcher,
          useValue: membershipEndpointsResearcherStub,
        },
        {
          provide: RequestService,
          useValue: requestServiceStub,
        },
        /*
            private researcherRequestEndpoints: RequestEndpointsResearcher,
    private membershipEndpoints: MembershipEndpointsResearcher,
    private requestsService: RequestService
        */
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
      .spyOn(generateSqlStepStub, 'isRequired')
      .mockReturnValue(of({ result: {}, isRequired: false }));

    service
      .submit(specificationId, SubmissionType.AttachSqlAndPdfToRequest, request.id)
      .subscribe();
    expect(setSpy).toHaveBeenCalledWith({ specificationId });
  });

  it('should save the step result to the state', () => {
    const setSpy = jest.spyOn(stateServiceStub, 'set');
    const stepResult = {
      isRequired: false,
      cancel: false,
      result: { specificationId: 'test-id' },
    } as StepResult;

    jest.spyOn(generateSqlStepStub, 'isRequired').mockReturnValue(of(stepResult));

    service.submit('test-id', SubmissionType.AttachSqlAndPdfToRequest, request.id).subscribe();

    // Check the first call
    expect(setSpy).toHaveBeenCalledWith({
      specificationId: 'test-id',
    });
  });

  it('run all submission steps', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const expectedRunInput = { specificationId: 'test-id' };
    const requestId = 'requestId';
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: true } as StepResult);
    const run$ = of({
      result: { requestId, succeeded: true },
      isRequired: false,
    } as StepResult);

    stateServiceStub.getStepInputFromShape.mockReturnValue({ specificationId: 'test-id' });

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

    // Submit the Data Specification
    service
      .submit('test-id', SubmissionType.AttachSqlAndPdfToRequest, request.id)
      .subscribe((result: boolean) => {
        expect(result).toEqual(expectedRunResult);
      });

    // Check the results
    expect(isRequiredSpyGenerateSQL).toHaveBeenCalled();
    expect(runSpyGenerateSQL).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyAttachSQL).toHaveBeenCalled();
    expect(runSpyAttachSQL).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyGeneratePDF).toHaveBeenCalled();
    expect(runSpyGeneratePDF).toHaveBeenCalledWith(expectedRunInput);

    expect(isRequiredSpyAttachPDF).toHaveBeenCalled();
    expect(runSpyAttachPDF).toHaveBeenCalledWith(expectedRunInput);
  });

  it('step run is not called when isRequired is false', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const requestId = 'requestId';
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: false } as StepResult);
    const run$ = of({
      result: { requestId, succeeded: true },
      isRequired: false,
    } as StepResult);

    stateServiceStub.getStepInputFromShape.mockReturnValue({ specificationId: 'test-id' });

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

    // Submit the Data Specification
    service
      .submit('test-id', SubmissionType.AttachSqlAndPdfToRequest, request.id)
      .subscribe((result: boolean) => {
        expect(result).toEqual(expectedRunResult);
      });

    // Check the results
    expect(isRequiredSpyGenerateSQL).toHaveBeenCalled();
    expect(runSpyGenerateSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachSQL).toHaveBeenCalled();
    expect(runSpyAttachSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyGeneratePDF).toHaveBeenCalled();
    expect(runSpyGeneratePDF).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachPDF).toHaveBeenCalled();
    expect(runSpyAttachPDF).toHaveBeenCalledTimes(0);
  });

  it('subsequent steps are not called when a step is cancelled', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const requestId = 'requestId';
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: true } as StepResult);
    const run$ = of({
      result: { requestId, cancel: true },
      isRequired: false,
    } as StepResult);

    stateServiceStub.getStepInputFromShape.mockReturnValueOnce({ specificationId: 'test-id' });
    stateServiceStub.getStepInputFromShape.mockReturnValue({
      specificationId: 'test-id',
      cancel: true,
    });

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

    // Submit the Data Specification
    service
      .submit('test-id', SubmissionType.AttachSqlAndPdfToRequest, request.id)
      .subscribe((result: boolean) => {
        expect(result).toEqual(expectedRunResult);
      });

    // Check the results
    expect(isRequiredSpyGenerateSQL).toHaveBeenCalledTimes(1);
    expect(runSpyGenerateSQL).toHaveBeenCalledTimes(1);

    expect(isRequiredSpyAttachSQL).toHaveBeenCalledTimes(0);
    expect(runSpyAttachSQL).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyGeneratePDF).toHaveBeenCalledTimes(0);
    expect(runSpyGeneratePDF).toHaveBeenCalledTimes(0);

    expect(isRequiredSpyAttachPDF).toHaveBeenCalledTimes(0);
    expect(runSpyAttachPDF).toHaveBeenCalledTimes(0);
  });

  it('should display a simpleDialog when an error is thrown', () => {
    // Mock the returns
    const expectedInputShape: (keyof Partial<ISubmissionState>)[] = ['specificationId'];
    const expectedRunInput = { specificationId: 'test-id' };
    const expectedRunResult = true;
    const isRequired$ = of({ result: {}, isRequired: true } as StepResult);
    const run$ = throwError(() => new Error(StepName.CreateDataRequest));

    stateServiceStub.getStepInputFromShape.mockReturnValue({
      specificationId: 'test-id',
    });

    // Generate SQL
    generateSqlStepStub.getInputShape.mockReturnValueOnce(expectedInputShape);
    const isRequiredSpyCreateDataRequest = jest.spyOn(generateSqlStepStub, 'isRequired');
    const runSpyCreateDataRequest = jest.spyOn(generateSqlStepStub, 'run');
    const simpleDialogSpy = jest.spyOn(matDialogStub, 'open');
    isRequiredSpyCreateDataRequest.mockReturnValue(isRequired$);
    runSpyCreateDataRequest.mockReturnValue(run$);

    // Submit the Data Specification
    service
      .submit('test-id', SubmissionType.AttachSqlAndPdfToRequest, request.id)
      .subscribe((result: boolean) => {
        expect(result).toEqual(expectedRunResult);
      });

    expect(isRequiredSpyCreateDataRequest).toHaveBeenCalled();
    expect(runSpyCreateDataRequest).toHaveBeenCalledWith(expectedRunInput);

    // Check MatDialog is called with a submission error.
    expect(simpleDialogSpy).toHaveBeenCalledWith(
      SimpleDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          heading: 'Submission Error',
        }),
      })
    );
  });
});
