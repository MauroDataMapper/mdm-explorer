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
import { map, Observable, of } from 'rxjs';
import { DialogService } from '../../dialog.service';
import { SuccessDialogData } from '../../success-dialog/success-dialog.component';
import { ISubmissionState, ISubmissionStep, StepName, StepResult } from '../submission.resource';

@Injectable({
  providedIn: 'root',
})
export class GetDataRequestStep implements ISubmissionStep {
  name: StepName = 'GetDataRequest';

  constructor(private dialogs: DialogService) {}

  isRequired(): Observable<StepResult> {
    const result: StepResult = {
      result: {},
      isRequired: true,
    };
    return of(result);
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    const data: SuccessDialogData = {
      heading: 'Step 2',
      message: input.whatStep1Did,
    };
    return this.dialogs
      .openSuccess(data)
      .afterClosed()
      .pipe(
        map(() => {
          return { result: {}, isRequired: false };
        })
      );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['whatStep1Did'];
  }
}
