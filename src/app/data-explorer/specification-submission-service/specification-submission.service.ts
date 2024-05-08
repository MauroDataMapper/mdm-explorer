import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs/internal/observable/throwError';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SubmissionStateService } from './submission-state.service';
import { SelectProjectStep } from './submission-steps/select-project.step';
import { ISubmissionStep } from './submission.resource';

@Injectable({
  providedIn: 'root',
})
export class SpecificationSubmissionService {
  submissionSteps: ISubmissionStep[] = [];

  constructor(
    stateService: SubmissionStateService,
    selectProjectStep: SelectProjectStep,
  ) {
    this.submissionSteps = [selectProjectStep];
  }

  submit(): Observable<boolean> {
    return this.submissionSteps.reduce(
      (observable, step) =>
        observable.pipe(
          switchMap(() => step.executionRequired()),
          switchMap((isExecutionRequired: boolean) => {
            if (!isExecutionRequired) {
              return of(true); // Skip the step
            } else {
              return step.execute(); // Execute the step
            }
          }),
          catchError((error) => {
            // Handle errors
            return throwError(() => error);
          }),
        ),
      of(true), // Start with a successful observable
    );
  }
}
