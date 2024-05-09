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
import { Observable, map, of } from 'rxjs';
import { ISubmissionState, ISubmissionStep, StepName, StepResult } from '../submission.resource';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { SelectProjectDialogData } from '../select-project-dialog/select-project-dialog.component';
import { Uuid } from '@maurodatamapper/sde-resources';

export interface SelectProjectStepResult {
  specificationId: Uuid;
}

@Injectable({
  providedIn: 'root',
})
export class SelectProjectStep implements ISubmissionStep {
  name: StepName = 'SelectProject';

  constructor(private dialog: DialogService) {}

  isRequired(): Observable<StepResult> {
    const stepResult: StepResult = {
      result: {} as SelectProjectStepResult,
      isRequired: true,
    };

    return of(stepResult);
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    const dialogData = input as SelectProjectDialogData;

    if (!input.specificationId) {
      throw new Error('Specification ID is required to select a project');
    }
    return this.dialog
      .openSelectProject(dialogData)
      .afterClosed()
      .pipe(map((result) => ({ result, isRequired: false }) as StepResult));
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['specificationId'];
  }
}
