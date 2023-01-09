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
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MockComponent } from 'ng-mocks';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { SuccessDialogComponent, SuccessDialogData } from './success-dialog.component';

describe('SuccessDialogComponent', () => {
  let harness: ComponentHarness<SuccessDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<void>();

  const data: SuccessDialogData = {
    heading: 'test heading',
    message: 'test message',
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SuccessDialogComponent, {
      declarations: [MockComponent(MatDialogContent), MockComponent(MatDialogActions)],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefStub,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.heading).toBe(data.heading);
    expect(harness.component.message).toBe(data.message);
  });

  it('should close', () => {
    harness.component.close();
    expect(dialogRefStub.close).toHaveBeenCalled();
  });
});
