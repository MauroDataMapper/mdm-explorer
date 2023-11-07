import { OrganisationListComponent } from './organisation-list.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { MatDialog } from '@angular/material/dialog';

describe('OrganisationListComponent', () => {
  let harness: ComponentHarness<OrganisationListComponent>;
  const matDialogStub = createMatDialogStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(OrganisationListComponent, {
      providers: [
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
  });
});
