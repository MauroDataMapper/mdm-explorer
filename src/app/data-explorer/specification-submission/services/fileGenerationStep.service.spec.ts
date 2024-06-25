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

import { ErrorResponse, setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { AttachmentType } from '@maurodatamapper/sde-resources';
import { cold } from 'jest-marbles';
import { SubmissionStateService } from '../services/submission-state.service';
import { DataExporterService } from '../services/dataExporter.service';
import { createDataExporterServiceStub } from 'src/app/testing/stubs/data-specification-submission/data-exporter.service.stub';
import { Observable, catchError, map, of } from 'rxjs';
import { FileGenerationStepService } from './fileGenerationStep.service';
import { AttachmentsService } from './attachments.service';
import {
  AttachmentsServiceStub,
  createAttachmentsServiceStub,
} from 'src/app/testing/stubs/data-specification-submission/attachments.service.stub';
import {
  ExporterName,
  FileProperties,
  StepName,
  StepResult,
} from '../type-declarations/submission.resource';

class FileGenerationStepServiceTestHelper {
  static getExpectedError(expectedHasError: boolean, expectedErrorMessage: string) {
    return cold('(a|)', {
      a: {
        hasError: expectedHasError,
        errorMessage: expectedErrorMessage,
      } as ErrorResponse,
    });
  }

  static getStepInput(
    fileGenerationStepService: FileGenerationStepService,
    dataRequestId: string | undefined,
    specificationId: string | undefined
  ) {
    // Although all of this could be mocked, it seems easier to use the actual service
    const stateService: SubmissionStateService = new SubmissionStateService();
    stateService.set({ dataRequestId, specificationId });
    return stateService.getStepInputFromShape(fileGenerationStepService.getInputShape());
  }

  static executeIsRequiredErrorTest(
    attachmentsServiceStub: AttachmentsServiceStub,
    fileGenerationStepService: FileGenerationStepService,
    dataRequestId: string | undefined,
    specificationId: string | undefined,
    attachmentType: AttachmentType,
    stepName: StepName
  ): Observable<ErrorResponse> {
    attachmentsServiceStub.attachmentsAreRequired.mockReturnValueOnce(
      of({ isRequired: true } as StepResult)
    );

    const stepInput = FileGenerationStepServiceTestHelper.getStepInput(
      fileGenerationStepService,
      dataRequestId,
      specificationId
    );

    return fileGenerationStepService.isRequired(stepInput, stepName, attachmentType).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );
  }

  static executeRunErrorTest(
    fileGenerationStepService: FileGenerationStepService,
    dataRequestId: string | undefined,
    specificationId: string | undefined,
    exporterName: ExporterName,
    stepName: StepName
  ) {
    const stepInput = FileGenerationStepServiceTestHelper.getStepInput(
      fileGenerationStepService,
      dataRequestId,
      specificationId
    );

    return fileGenerationStepService.run(stepInput, stepName, exporterName).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );
  }
}

describe('FileGenerationStepService', () => {
  let fileGenerationStepService: FileGenerationStepService;
  const attachmentsServiceStub = createAttachmentsServiceStub();
  const dataExporterServiceStub = createDataExporterServiceStub();

  const missingSpecificationIdIsRequiredError =
    'Generate pdf of data request (isRequired) expects specificationId, which was not provided.';
  const missingRequestIdIsRequiredError =
    'Generate pdf of data request (isRequired) expects dataRequestId, which was not provided.';
  const missingSpecificationIdRunError =
    'Generate pdf of data request (run) expects specificationId, which was not provided.';

  beforeEach(() => {
    // Default endpoint call
    fileGenerationStepService = setupTestModuleForService(FileGenerationStepService, {
      providers: [
        {
          provide: AttachmentsService,
          useValue: attachmentsServiceStub,
        },
        {
          provide: DataExporterService,
          useValue: dataExporterServiceStub,
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance', () => {
    expect(fileGenerationStepService).toBeTruthy();
  });

  it('getInputShape should return expected fields', () => {
    const expectedInputStep = ['specificationId', 'dataRequestId', 'cancel'];
    const inputStep = fileGenerationStepService.getInputShape();
    expect(inputStep).toEqual(expectedInputStep);
  });

  it('isRequired should error if specification id parameter is missing', () => {
    const dataRequestId = 'defined';
    const specificationId = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingSpecificationIdIsRequiredError;

    const expected$ = FileGenerationStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileGenerationStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileGenerationStepService,
      dataRequestId,
      specificationId,
      AttachmentType.DataSpecificationPDF,
      StepName.GeneratePdfFile
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should error if request id parameter is missing', () => {
    const dataRequestId = undefined;
    const specificationId = 'defined';
    const expectedHasError = true;
    const expectedErrorMessage = missingRequestIdIsRequiredError;

    const expected$ = FileGenerationStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileGenerationStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileGenerationStepService,
      dataRequestId,
      specificationId,
      AttachmentType.DataSpecificationPDF,
      StepName.GeneratePdfFile
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should error if both request id and specification id parameters are missing', () => {
    const dataRequestId = undefined;
    const specificationId = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingSpecificationIdIsRequiredError;

    const expected$ = FileGenerationStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileGenerationStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileGenerationStepService,
      dataRequestId,
      specificationId,
      AttachmentType.DataSpecificationPDF,
      StepName.GeneratePdfFile
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should NOT error if both request id and specification id parameters are provided', () => {
    const dataRequestId = 'defined';
    const specificationId = 'defined';
    const expectedHasError = false;
    const expectedErrorMessage = 'No error occurred';

    const expected$ = FileGenerationStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileGenerationStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileGenerationStepService,
      dataRequestId,
      specificationId,
      AttachmentType.DataSpecificationPDF,
      StepName.GeneratePdfFile
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should error if specification id parameter is missing', () => {
    const dataRequestId = 'defined';
    const specificationId = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingSpecificationIdRunError;

    const expected$ = FileGenerationStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileGenerationStepServiceTestHelper.executeRunErrorTest(
      fileGenerationStepService,
      dataRequestId,
      specificationId,
      ExporterName.DataModelPdfExporterService,
      StepName.GeneratePdfFile
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should return a path to a file', () => {
    attachmentsServiceStub.attachmentsAreRequired.mockReturnValue(
      of({ isRequired: true } as StepResult)
    );

    dataExporterServiceStub.exportDataSpecification.mockReturnValueOnce(
      of({ url: 'mockedObjectURL', filename: 'someFileName' } as FileProperties)
    );

    const stepInput = FileGenerationStepServiceTestHelper.getStepInput(
      fileGenerationStepService,
      '1',
      '1'
    );

    const expected$ = cold('(a|)', {
      a: { result: { fileProperties: { url: 'mockedObjectURL', filename: 'someFileName' } } },
    });

    const actual$ = fileGenerationStepService.run(
      stepInput,
      StepName.GeneratePdfFile,
      ExporterName.DataModelPdfExporterService
    );
    expect(actual$).toBeObservable(expected$);
  });
});
