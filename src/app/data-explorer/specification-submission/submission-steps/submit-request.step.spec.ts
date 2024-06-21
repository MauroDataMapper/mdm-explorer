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
import { SubmitRequestStep } from './submit-request.step';
import { RequestEndpoints, RequestResponse } from '@maurodatamapper/sde-resources';
import { createSdeRequestEndpointsSharedStub } from 'src/app/testing/stubs/sde/sde-request-endpoints-shared.stub';

describe('SubmitRequestStep', () => {
  let step: SubmitRequestStep;
  const requestEndpointsStub = createSdeRequestEndpointsSharedStub();

  beforeEach(() => {
    // Default endpoint call
    step = setupTestModuleForService(SubmitRequestStep, {
      providers: [
        {
          provide: RequestEndpoints,
          useValue: requestEndpointsStub,
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
    const expectedInputStep = ['dataRequestId' as keyof ISubmissionState];

    const inputStep = step.getInputShape();
    expect(inputStep).toEqual(expectedInputStep);
  });

  it('isRequired should return true when request status IS NOT awaiting approval', () => {
    const stepResult = { isRequired: true, result: {} } as StepResult;
    const expected$ = cold('(a|)', { a: stepResult });

    requestEndpointsStub.getRequest.mockReturnValueOnce(of({ status: 'DRAFT' } as RequestResponse));

    const input: Partial<ISubmissionState> = {
      dataRequestId: '1',
    };

    const actual$ = step.isRequired(input);

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should return false when request status is awaiting approval', () => {
    const stepResult = { isRequired: false, result: {} } as StepResult;
    const expected$ = cold('(a|)', { a: stepResult });

    requestEndpointsStub.getRequest.mockReturnValueOnce(
      of({ status: 'AWAITING_APPROVAL' } as RequestResponse)
    );

    const input: Partial<ISubmissionState> = {
      dataRequestId: '1',
    };

    const actual$ = step.isRequired(input);

    expect(actual$).toBeObservable(expected$);
  });

  it('run should return expected fields', () => {
    const stepResult = { result: {} } as StepResult;
    const expected$ = cold('(a|)', { a: stepResult });

    requestEndpointsStub.changeStatus.mockReturnValueOnce(of({} as RequestResponse));
    const input: Partial<ISubmissionState> = {
      dataRequestId: '1',
    };
    const actual$ = step.run(input);

    expect(actual$).toBeObservable(expected$);
  });
});
