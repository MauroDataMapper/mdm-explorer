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
import {
  SdeRequestEndpointsSharedStub,
  createSdeRequestEndpointsSharedStub,
} from 'src/app/testing/stubs/sde/sde-request-endpoints-shared.stub';
import {
  AttachmentType,
  RequestAttachmentData,
  RequestEndpoints,
} from '@maurodatamapper/sde-resources';
import { cold } from 'jest-marbles';
import { GenerateSqlStep } from './generate-sql.step';
import { SubmissionStateService } from '../submission-state.service';
import { DataExporterService } from '../services/dataExporter.service';
import { createDataExporterServiceStub } from 'src/app/testing/stubs/data-specification-submission/data-exporter.service.stub';
import { Observable, catchError, map, of } from 'rxjs';

type ErrorResponse = {
  hasError: boolean;
  errorMessage: string;
};

class GenerateSqlStepTestHelper {
  static getExpectedError(expectedHasError: boolean, expectedErrorMessage: string) {
    return cold('(a|)', {
      a: {
        hasError: expectedHasError,
        errorMessage: expectedErrorMessage,
      } as ErrorResponse,
    });
  }

  static getStepInput(
    step: GenerateSqlStep,
    dataRequestId: string | undefined,
    specificationId: string | undefined
  ) {
    // Although all of this could be mocked, it seems easier to use the actual service
    const stateService: SubmissionStateService = new SubmissionStateService();
    stateService.set({ dataRequestId, specificationId });
    return stateService.getStepInputFromShape(step.getInputShape());
  }

  static executeIsRequiredErrorTest(
    requestEndpointsStub: SdeRequestEndpointsSharedStub,
    step: GenerateSqlStep,
    dataRequestId: string | undefined,
    specificationId: string | undefined
  ): Observable<ErrorResponse> {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(of([]));

    const stepInput = GenerateSqlStepTestHelper.getStepInput(step, dataRequestId, specificationId);

    return step.isRequired(stepInput).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );
  }

  static executeRunErrorTest(
    step: GenerateSqlStep,
    dataRequestId: string | undefined,
    specificationId: string | undefined
  ) {
    const stepInput = GenerateSqlStepTestHelper.getStepInput(step, dataRequestId, specificationId);

    return step.run(stepInput).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );
  }
}

describe('GenerateSqlStep', () => {
  let step: GenerateSqlStep;
  const requestEndpointsStub = createSdeRequestEndpointsSharedStub();
  const dataExporterServiceStub = createDataExporterServiceStub();

  const missingSpecificationIdIsRequiredError =
    'Generate Meql Step (isRequired) expects Specification Id, which was not provided.';
  const missingRequestIdIsRequiredError =
    'Generate Meql Step (isRequired) expects Data Request Id, which was not provided.';
  const missingSpecificationIdRunError =
    'Generate Meql Step (run) expects Specification Id, which was not provided.';

  beforeEach(() => {
    // Default endpoint call
    step = setupTestModuleForService(GenerateSqlStep, {
      providers: [
        {
          provide: RequestEndpoints,
          useValue: requestEndpointsStub,
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
    expect(step).toBeTruthy();
  });

  it('getInputShape should return expected fields', () => {
    const expectedInputStep = ['specificationId', 'dataRequestId'];
    const inputStep = step.getInputShape();
    expect(inputStep).toEqual(expectedInputStep);
  });

  it('isRequired should error if specification id parameter is missing', () => {
    const dataRequestId = 'defined';
    const specificationId = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingSpecificationIdIsRequiredError;

    const expected$ = GenerateSqlStepTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = GenerateSqlStepTestHelper.executeIsRequiredErrorTest(
      requestEndpointsStub,
      step,
      dataRequestId,
      specificationId
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should error if request id parameter is missing', () => {
    const dataRequestId = undefined;
    const specificationId = 'defined';
    const expectedHasError = true;
    const expectedErrorMessage = missingRequestIdIsRequiredError;

    const expected$ = GenerateSqlStepTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = GenerateSqlStepTestHelper.executeIsRequiredErrorTest(
      requestEndpointsStub,
      step,
      dataRequestId,
      specificationId
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should error if both request id and specification id parameters are missing', () => {
    const dataRequestId = undefined;
    const specificationId = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingSpecificationIdIsRequiredError;

    const expected$ = GenerateSqlStepTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = GenerateSqlStepTestHelper.executeIsRequiredErrorTest(
      requestEndpointsStub,
      step,
      dataRequestId,
      specificationId
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should NOT error if both request id and specification id parameters are provided', () => {
    const dataRequestId = 'defined';
    const specificationId = 'defined';
    const expectedHasError = false;
    const expectedErrorMessage = 'No error occurred';

    const expected$ = GenerateSqlStepTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = GenerateSqlStepTestHelper.executeIsRequiredErrorTest(
      requestEndpointsStub,
      step,
      dataRequestId,
      specificationId
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should be true when there are no attachments', () => {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(of([]));

    const stepInput = GenerateSqlStepTestHelper.getStepInput(step, '1', '1');

    const expected$ = cold('(a|)', {
      a: { isRequired: true, result: {} },
    });

    const actual$ = step.isRequired(stepInput);

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should be true when existing attachments do not match the attachment type', () => {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(
      of([
        {
          id: '1',
          fileId: 'FILE1',
          attachedAt: new Date(),
          fileName: 'file.pdf',
          contentType: 'pdf',
          attachedByName: 'user1',
          attachmentType: AttachmentType.DataSpecificationPDF,
        } as RequestAttachmentData,
        {
          id: '2',
          fileId: 'FILE2',
          attachedAt: new Date(),
          fileName: 'file.txt',
          contentType: 'txt',
          attachedByName: 'user1',
          attachmentType: AttachmentType.User,
        } as RequestAttachmentData,
      ])
    );

    const stepInput = GenerateSqlStepTestHelper.getStepInput(step, '1', '1');

    const expected$ = cold('(a|)', {
      a: { isRequired: true, result: {} },
    });

    const actual$ = step.isRequired(stepInput);

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should be false when an existing attachment matches the attachment type', () => {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(
      of([
        {
          id: '1',
          fileId: 'FILE1',
          attachedAt: new Date(),
          fileName: 'file.pdf',
          contentType: 'pdf',
          attachedByName: 'user1',
          attachmentType: AttachmentType.DataSpecificationPDF,
        } as RequestAttachmentData,
        {
          id: '2',
          fileId: 'FILE2',
          attachedAt: new Date(),
          fileName: 'file.txt',
          contentType: 'txt',
          attachedByName: 'user1',
          attachmentType: AttachmentType.User,
        } as RequestAttachmentData,
        {
          id: '3',
          fileId: 'FILE3',
          attachedAt: new Date(),
          fileName: 'file.sql',
          contentType: 'sql',
          attachedByName: 'user1',
          attachmentType: AttachmentType.DataSpecificationSQL,
        } as RequestAttachmentData,
      ])
    );

    const stepInput = GenerateSqlStepTestHelper.getStepInput(step, '1', '1');

    const expected$ = cold('(a|)', {
      a: { isRequired: false, result: {} },
    });

    const actual$ = step.isRequired(stepInput);
    expect(actual$).toBeObservable(expected$);
  });

  it('run should error if specification id parameter is missing', () => {
    const dataRequestId = 'defined';
    const specificationId = undefined;
    const expectedHasError = true;
    const expectedErrorMessage = missingSpecificationIdRunError;

    const expected$ = GenerateSqlStepTestHelper.getExpectedError(
      expectedHasError,
      expectedErrorMessage
    );

    const actual$ = GenerateSqlStepTestHelper.executeRunErrorTest(
      step,
      dataRequestId,
      specificationId
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('run should return a path to a file', () => {
    requestEndpointsStub.listAttachments.mockReturnValue(of([]));

    dataExporterServiceStub.exportDataSpecification.mockReturnValueOnce(of('mockedObjectURL'));

    const stepInput = GenerateSqlStepTestHelper.getStepInput(step, '1', '1');

    const expected$ = cold('(a|)', {
      a: { result: { pathToExportFile: 'mockedObjectURL' } },
    });

    const actual$ = step.run(stepInput);
    expect(actual$).toBeObservable(expected$);
  });
});
