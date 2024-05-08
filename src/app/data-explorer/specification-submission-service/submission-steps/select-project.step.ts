import { Observable, of } from 'rxjs';
import { DialogService } from '../../dialog.service';
import { ISubmissionStep, StepName } from '../submission.resource';

export class SelectProjectStep implements ISubmissionStep {
  name: StepName = 'SelectProject';

  constructor(dialogService: DialogService) {}

  executionRequired(): Observable<boolean> {
    return of(true);
  }

  execute(): Observable<any> {
    return of(true);
  }

  saveResults(): void {}
  validateExecutionInputs(): void {}
}
