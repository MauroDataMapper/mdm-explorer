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
import { EMPTY, catchError, concatMap, finalize, from, map, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SubmissionStateService } from './submission-state.service';
import { CreateDataRequestStep } from '../submission-steps/create-data-request.step';
import { ISubmissionStep, StepName, StepResult } from '../type-declarations/submission.resource';
import { GenerateSqlStep } from '../submission-steps/generate-sql.step';
import { AttachSqlStep } from '../submission-steps/attach-sql.step';
import { GeneratePdfStep } from '../submission-steps/generate-pdf.step';
import { AttachPdfStep } from '../submission-steps/attach-pdf.step';
import { SubmitRequestStep } from '../submission-steps/submit-request.step';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DialogService } from '../../dialog.service';
import {
  DEFAULT_ERROR_MESSAGE,
  NoProjectsFoundError,
} from '../type-declarations/submission.custom-errors';

@Injectable({
  providedIn: 'root',
})
export class SpecificationSubmissionService {
  private submissionSteps: ISubmissionStep[] = [];

  constructor(
    private stateService: SubmissionStateService,
    private dialogService: DialogService,
    private broadcastService: BroadcastService,
    private createDataRequestStep: CreateDataRequestStep,
    private generateSqlStep: GenerateSqlStep,
    private attachSqlStep: AttachSqlStep,
    private generatePdfStep: GeneratePdfStep,
    private attachPdfStep: AttachPdfStep,
    private submitRequestStep: SubmitRequestStep
  ) {
    this.submissionSteps = [
      this.createDataRequestStep,
      this.generateSqlStep,
      this.attachSqlStep,
      this.generatePdfStep,
      this.attachPdfStep,
      this.submitRequestStep,
    ];
  }

  /**
   * @description Submits a specification for processing.
   * @param specificationId The ID of the specification to submit.
   * @returns An observable that emits a boolean value indicating whether the submission was successful.
   */
  submit(specificationId: Uuid): Observable<boolean> {
    // Set initial state.
    this.stateService.clear();
    this.stateService.set({ specificationId });

    // Run each step, once at a time, ensuring it completes before running the next.
    return from(this.submissionSteps).pipe(
      concatMap((step: ISubmissionStep) => {
        // Retrieve the step input from the state.
        const stepInput = this.stateService.getStepInputFromShape(step.getInputShape());

        if (stepInput.cancel) {
          return EMPTY;
        }

        return step.isRequired(stepInput).pipe(
          // Get a step result, either from checking or running the step.
          switchMap((stepResult: StepResult) => {
            if (!stepResult.isRequired) {
              this.stateService.set({ ...stepResult.result });
              return of(stepResult);
            }
            return step.run(stepInput);
          }),
          tap((stepResult: StepResult) => {
            // Save the relevant stepResult information.
            this.stateService.set({ ...stepResult.result });
          }),
          catchError((error: Error) => {
            this.handleSubmissionError(error, step.name);

            // Cancel the submission at this step if an error occurs.
            const cancelResult = {
              result: { cancel: true },
            } as StepResult;
            this.stateService.set({ ...cancelResult.result });

            // Complete the step with cancel set.
            return EMPTY;
          })
        );
      }),
      map((stepResult) => {
        return stepResult.result.succeeded ?? false;
      }),
      finalize(() => {
        this.broadcastService.loading({ isLoading: false });
      })
    );
  }

  private handleSubmissionError(error: Error, stepName: StepName): void {
    // Log the true error to the console no matter what.
    console.error(`Error running step ${stepName}. Step failed with error message: ${error}`);

    const userFriendlyErrorMessage = this.getUserFriendlyErrorMessage(error, stepName);
    this.dialogService.openSimple({
      heading: 'Submission Error',
      message: userFriendlyErrorMessage,
    });
  }

  private getUserFriendlyErrorMessage(error: Error, stepName: StepName): string {
    const title = `Submission Step <b>${stepName}</b> failed.`;

    // If the error is a NoProjectsFoundError, show the message from the error. Otherwise, show the default message.
    // This is becuase the no projects error is the only error a researcher can feasibly fix on their own.
    const content = error instanceof NoProjectsFoundError ? error.message : DEFAULT_ERROR_MESSAGE;

    return `<p>${title}</p><p>${content}</p>`;
  }
}
