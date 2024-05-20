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
import { Uuid } from '@maurodatamapper/sde-resources';
import { catchError, concatMap, from, map, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SubmissionStateService } from './submission-state.service';
import { CreateDataRequestStep } from './submission-steps/create-data-request.step';
import { ISubmissionStep, StepResult } from './submission.resource';

@Injectable({
  providedIn: 'root',
})
export class SpecificationSubmissionService {
  submissionSteps: ISubmissionStep[] = [];

  constructor(
    private stateService: SubmissionStateService,
    private createDataRequestStep: CreateDataRequestStep
  ) {
    this.submissionSteps = [this.createDataRequestStep];
  }

  /**
   * @description Submits a specification for processing.
   * @param specificationId The ID of the specification to submit.
   * @returns An observable that emits a boolean value indicating whether the submission was successful.
   */
  submit(specificationId: Uuid): Observable<any> {
    // Set initial state.
    this.stateService.set({ specificationId });

    // Run each step, once at a time, ensuring it completes before running the next.
    return from(this.submissionSteps).pipe(
      map((step: ISubmissionStep) => {
        const stepInput = this.stateService.getStepInputFromShape(step.getInputShape());
        return { step, stepInput };
      }),
      concatMap(({ step, stepInput }) =>
        step.isRequired(stepInput).pipe(
          // Get a step result, either from checking or running the step.
          switchMap((stepResult: StepResult) => {
            if (!stepResult.isRequired) {
              return of(stepResult);
            }
            return step.run(stepInput);
          }),
          tap((stepResult: StepResult) => {
            // Save the relevant stepResult information.
            this.stateService.set({ ...stepResult.result });
          }),
          catchError((error) => {
            console.error('Error running step', step.name, error);
            return throwError(() => error);
          })
        )
      )
    );
  }
}
