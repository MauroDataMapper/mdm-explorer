import { Injectable } from '@angular/core';
import { Uuid } from '@maurodatamapper/sde-resources';
import { catchError, concatMap, from, tap } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SubmissionStateService } from './submission-state.service';
import { SelectProjectStep } from './submission-steps/select-project.step';
import { ISubmissionStep, StepResult } from './submission.resource';

@Injectable({
  providedIn: 'root',
})
export class SpecificationSubmissionService {
  submissionSteps: ISubmissionStep[] = [];

  constructor(
    private stateService: SubmissionStateService,
    private selectProjectStep: SelectProjectStep
  ) {
    this.submissionSteps = [this.selectProjectStep];
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
      concatMap((step: ISubmissionStep) =>
        step.isRequired().pipe(
          // Get a step result, either from checking or running the step.
          switchMap((stepResult: StepResult) => {
            if (!stepResult.isRequired) {
              return of(stepResult);
            }

            const stepInput = this.stateService.getStepInputFromShape(step.getInputShape());
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
