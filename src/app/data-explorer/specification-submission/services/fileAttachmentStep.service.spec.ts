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
import { AttachmentType, Uuid } from '@maurodatamapper/sde-resources';
import { cold } from 'jest-marbles';
import { SubmissionStateService } from './submission-state.service';
import { Observable, catchError, map, of } from 'rxjs';
import { AttachmentsService } from './attachments.service';
import {
  AttachmentsServiceStub,
  createAttachmentsServiceStub,
} from 'src/app/testing/stubs/data-specification-submission/attachments.service.stub';
import { FileProperties, StepName, StepResult } from '../type-declarations/submission.resource';
import { FileAttachmentStepService } from './fileAttachmentStep.service';

type ErrorResponse = {
  hasError: boolean;
  errorMessage: string;
};

class FileAttachmentsStepServiceTestHelper {
  static getExpectedError(expectedHasError: boolean, expectedErrorMessage: string) {
    return cold('(a|)', {
      a: {
        hasError: expectedHasError,
        errorMessage: expectedErrorMessage,
      } as ErrorResponse,
    });
  }

  static getStepInput(
    fileAttachmentStepService: FileAttachmentStepService,
    dataRequestId: Uuid | undefined,
    fileProperties: FileProperties | undefined
  ) {
    // Although all of this could be mocked, it seems easier to use the actual service
    const stateService: SubmissionStateService = new SubmissionStateService();
    stateService.set({ dataRequestId, fileProperties });
    return stateService.getStepInputFromShape(fileAttachmentStepService.getInputShape());
  }

  static executeIsRequiredErrorTest(
    attachmentsServiceStub: AttachmentsServiceStub,
    fileAttachmentStepService: FileAttachmentStepService,
    dataRequestId: Uuid | undefined,
    fileProperties: FileProperties | undefined,
    attachmentType: AttachmentType,
    stepName: StepName
  ): Observable<ErrorResponse> {
    attachmentsServiceStub.attachmentsAreRequired.mockReturnValueOnce(
      of({ isRequired: true } as StepResult)
    );

    const stepInput = FileAttachmentsStepServiceTestHelper.getStepInput(
      fileAttachmentStepService,
      dataRequestId,
      fileProperties
    );

    return fileAttachmentStepService.isRequired(stepInput, stepName, attachmentType).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );
  }

  static executeRunErrorTest(
    attachmentsServiceStub: AttachmentsServiceStub,
    fileAttachmentStepService: FileAttachmentStepService,
    dataRequestId: Uuid | undefined,
    fileProperties: FileProperties | undefined,
    attachmentType: AttachmentType,
    stepName: StepName
  ) {
    attachmentsServiceStub.attachFile.mockReturnValueOnce(
      of({
        result: {},
      } as StepResult)
    );

    const stepInput = FileAttachmentsStepServiceTestHelper.getStepInput(
      fileAttachmentStepService,
      dataRequestId,
      fileProperties
    );

    return fileAttachmentStepService.run(stepInput, stepName, attachmentType).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );
  }

  static StepNameForAttachmentType(attachmentType: AttachmentType): StepName {
    switch (attachmentType) {
      case AttachmentType.DataSpecificationPDF:
        return StepName.AttachPdfFile;
      default:
        throw new Error('Unknown attachment type');
    }
  }
}

describe('FileAttachmentsStepService', () => {
  let fileAttachmentStepService: FileAttachmentStepService;
  const attachmentsServiceStub = createAttachmentsServiceStub();

  const missingFilePropertiesIsRequiredError =
    'Attach pdf to data request (isRequired) expects fileProperties, which was not provided.';
  const missingRequestIdIsRequiredError =
    'Attach pdf to data request (isRequired) expects dataRequestId, which was not provided.';
  const missingFilePropertiesRunError =
    'Attach pdf to data request (run) expects fileProperties, which was not provided.';
  const missingRequestIdRunError =
    'Attach pdf to data request (run) expects dataRequestId, which was not provided.';

  beforeEach(() => {
    // Default endpoint call
    fileAttachmentStepService = setupTestModuleForService(FileAttachmentStepService, {
      providers: [
        {
          provide: AttachmentsService,
          useValue: attachmentsServiceStub,
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance', () => {
    expect(fileAttachmentStepService).toBeTruthy();
  });

  it('getInputShape should return expected fields', () => {
    const expectedInputStep = ['dataRequestId', 'fileProperties'];
    const inputStep = fileAttachmentStepService.getInputShape();
    expect(inputStep).toEqual(expectedInputStep);
  });

  it('isRequired should error if fileProperties parameter is missing', () => {
    const dataRequestId = 'defined';
    const fileProperties = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingFilePropertiesIsRequiredError;

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should error if requestId parameter is missing', () => {
    const dataRequestId = undefined;
    const fileProperties = { url: 'URl', filename: 'File' } as FileProperties;
    const expectedHasError = true;
    const expectedErrorMessage = missingRequestIdIsRequiredError;

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should error if both requestId and fileProperties parameters are missing', () => {
    const dataRequestId = undefined;
    const fileProperties = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingRequestIdIsRequiredError;

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should NOT error if both requestId and fileProperties parameters are provided', () => {
    const dataRequestId = 'defined';
    const fileProperties = { url: 'URl', filename: 'File' } as FileProperties;
    const expectedHasError = false;
    const expectedErrorMessage = 'No error occurred';

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeIsRequiredErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should error if fileProperties parameter is missing', () => {
    const dataRequestId = 'defined';
    const fileProperties = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingFilePropertiesRunError;

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeRunErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should error if requestId parameter is missing', () => {
    const dataRequestId = undefined;
    const fileProperties = { url: 'URl', filename: 'File' } as FileProperties;
    const expectedHasError = true;
    const expectedErrorMessage = missingRequestIdRunError;

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeRunErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should error if both requestId and fileProperties parameters are missing', () => {
    const dataRequestId = undefined;
    const fileProperties = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingRequestIdRunError;

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeRunErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should NOT error if both requestId and fileProperties parameters are provided', () => {
    const dataRequestId = 'defined';
    const fileProperties = { url: 'URl', filename: 'File' } as FileProperties;
    const expectedHasError = false;
    const expectedErrorMessage = 'No error occurred';

    const expected$ = FileAttachmentsStepServiceTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = FileAttachmentsStepServiceTestHelper.executeRunErrorTest(
      attachmentsServiceStub,
      fileAttachmentStepService,
      dataRequestId,
      fileProperties,
      AttachmentType.DataSpecificationPDF,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      )
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should return an empty StepResult', () => {
    attachmentsServiceStub.attachFile.mockReturnValueOnce(
      of({
        result: {},
      } as StepResult)
    );

    attachmentsServiceStub.attachmentsAreRequired.mockReturnValue(
      of({ isRequired: true } as StepResult)
    );

    const stepInput = FileAttachmentsStepServiceTestHelper.getStepInput(
      fileAttachmentStepService,
      '1',
      { url: 'mockedObjectURL', filename: 'someFileName' } as FileProperties
    );

    const expected$ = cold('(a|)', {
      a: { result: {} },
    });

    const actual$ = fileAttachmentStepService.run(
      stepInput,
      FileAttachmentsStepServiceTestHelper.StepNameForAttachmentType(
        AttachmentType.DataSpecificationPDF
      ),
      AttachmentType.DataSpecificationPDF
    );
    expect(actual$).toBeObservable(expected$);
  });
});
