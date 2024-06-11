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
import { ErrorService } from './error.service';
import { StepFunction, StepName } from '../type-declarations/submission.resource';
import { catchError, map, of } from 'rxjs';
import { ErrorResponse } from 'src/app/testing/testing.helpers';
import { cold } from 'jest-marbles';

describe('ErrorService', () => {
  it('should create an observable error', () => {
    const errorMessage = 'Test error message';

    const expected$ = cold('(a|)', {
      a: {
        hasError: true,
        errorMessage,
      } as ErrorResponse,
    });

    const actual$ = ErrorService.observableError(errorMessage).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('should create a missing input error', () => {
    const stepName = StepName.SubmitDataRequest;
    const fieldName = 'Test Field';

    const expected$ = cold('(a|)', {
      a: {
        hasError: true,
        errorMessage: 'Submit data request (run) expects Test Field, which was not provided.',
      } as ErrorResponse,
    });

    const actual$ = ErrorService.missingInputError(stepName, StepFunction.Run, fieldName).pipe(
      map(() => {
        return { hasError: false, errorMessage: 'No error occurred' } as ErrorResponse;
      }),
      catchError((error) => {
        return of({ hasError: true, errorMessage: error.message } as ErrorResponse);
      })
    );

    expect(actual$).toBeObservable(expected$);
  });
});
