import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  SelectProjectDialogComponent,
  SelectProjectDialogData,
} from './select-project-dialog.component';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('SelectProjectDialogComponent', () => {
  let harness: ComponentHarness<SelectProjectDialogComponent>;
  const matDialogRefStub = createMatDialogRefStub();

  const setupTestbed = async (data: SelectProjectDialogData) => {
    harness = await setupTestModuleForComponent(SelectProjectDialogComponent, {
      providers: [
        {
          provide: MatDialogRef,
          useValue: matDialogRefStub,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
      ],
    });
  };

  it('should create', async () => {
    await setupTestbed({} as SelectProjectDialogData);
    expect(harness.component).toBeTruthy();
  });
});
