import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { SelectProjectStep } from './select-project.step';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { MatDialog } from '@angular/material/dialog';

describe('SelectProjectStep', () => {
  let step: SelectProjectStep;
  const matDialogStub = createMatDialogStub();

  beforeEach(() => {
    // Default endpoint call
    step = setupTestModuleForService(SelectProjectStep, {
      providers: [
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
      ],
    });
  });

  it('should create an instance', () => {
    expect(step).toBeTruthy();
  });
});
