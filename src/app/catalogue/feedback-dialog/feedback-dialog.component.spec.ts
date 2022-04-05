/*
Copyright 2022 University of Oxford
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
} from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import {
  FeedbackDialogComponent,
  FeedbackDialogResponse,
} from './feedback-dialog.component';

describe('FeedbackDialogComponent', () => {
  let harness: ComponentHarness<FeedbackDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<FeedbackDialogResponse>();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(FeedbackDialogComponent, {
      declarations: [
        MockComponent(MatDialogContent),
        MockComponent(MatDialogActions),
        MockComponent(MatFormField),
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefStub,
        },
      ],
    });
  });

  beforeEach(() => {
    dialogRefStub.close.mockClear();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.feedbackForm).toBeUndefined();
  });

  it('should initialise', () => {
    harness.component.ngOnInit();
    expect(harness.component.feedbackForm).toBeDefined();
    expect(harness.component.message?.value).toBe('');
  });

  it('should close', () => {
    harness.component.close();
    expect(dialogRefStub.close).toHaveBeenCalled();
  });

  it('should not close when form is invalid', () => {
    harness.component.ngOnInit();
    harness.component.send();
    expect(dialogRefStub.close).not.toHaveBeenCalled();
  });

  it('should close when form is valid', () => {
    const expected: FeedbackDialogResponse = {
      message: 'test feedback',
    };

    harness.component.ngOnInit();
    harness.component.message?.setValue(expected.message);

    harness.component.send();
    expect(dialogRefStub.close).toHaveBeenCalledWith(expected);
  });
});
