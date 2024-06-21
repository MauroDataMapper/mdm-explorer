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
import { Observable, map } from 'rxjs';
import {
  ISubmissionState,
  ISubmissionStep,
  StepFunction,
  StepName,
  StepResult,
} from '../type-declarations/submission.resource';
import { RequestEndpoints } from '@maurodatamapper/sde-resources';
import { ErrorService } from '../services/error.service';
import { SubmissionBroadcastService } from '../services/submission.broadcast.service';

@Injectable({
  providedIn: 'root',
})
export class SubmitRequestStep implements ISubmissionStep {
  name: StepName = StepName.SubmitDataRequest;

  constructor(
    private requestEndpoints: RequestEndpoints,
    private submissionBroadcastService: SubmissionBroadcastService
  ) {}

  isRequired(input: Partial<ISubmissionState>): Observable<StepResult> {
    this.submissionBroadcastService.broadcast('Submitting data request...');

    if (!input.dataRequestId) {
      return ErrorService.missingInputError(this.name, StepFunction.IsRequired, 'dataRequestId');
    }

    return this.requestEndpoints.getRequest(input.dataRequestId).pipe(
      map((requestResponse) => {
        const stepResult: StepResult = {
          result: {},
          isRequired: requestResponse.status !== 'AWAITING_APPROVAL',
        } as StepResult;
        return stepResult;
      })
    );
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.dataRequestId) {
      return ErrorService.missingInputError(this.name, StepFunction.Run, 'dataRequestId');
    }

    return this.requestEndpoints
      .changeStatus(input.dataRequestId, { requestAction: 'REQUEST_SUBMISSION_APPROVAL' })
      .pipe(
        map((requestResponse) => {
          if (requestResponse.status !== 'AWAITING_APPROVAL') {
            return { result: { succeeded: false } } as StepResult;
          }
          return { result: { succeeded: true } } as StepResult;
        })
      );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['dataRequestId', 'cancel'];
  }
}
