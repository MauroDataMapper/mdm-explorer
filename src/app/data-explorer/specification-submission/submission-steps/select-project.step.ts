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
