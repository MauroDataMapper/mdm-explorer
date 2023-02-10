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
import { Validators } from '@angular/forms';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent, MockDirective } from 'ng-mocks';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  CreateRequestDialogComponent,
  CreateRequestDialogResponse,
} from './create-request-dialog.component';

describe('CreateRequestDialogComponent', () => {
  let harness: ComponentHarness<CreateRequestDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<CreateRequestDialogResponse>();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CreateRequestDialogComponent, {
      declarations: [
        MockDirective(MatDialogContent),
        MockDirective(MatDialogActions),
        MockComponent(MatFormField),
        MockDirective(MatLabel),
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
    expect(harness.component.requestForm).toBeUndefined();
    expect(harness.component.showDescription).toBeTruthy();
  });

  it('should initialise', () => {
    harness.component.ngOnInit();
    expect(harness.component.requestForm).toBeDefined();
    expect(harness.component.name?.value).toBe('');
    expect(harness.component.name?.hasValidator(Validators.required)).toBeTruthy(); // eslint-disable-line @typescript-eslint/unbound-method
    expect(harness.component.description?.value).toBe('');
  });

  it('should close', () => {
    harness.component.close();
    expect(dialogRefStub.close).toHaveBeenCalled();
  });

  it('should not close when form is invalid', () => {
    harness.component.ngOnInit();
    harness.component.create();
    expect(dialogRefStub.close).not.toHaveBeenCalled();
  });

  it('should close when form is valid', () => {
    const expected: CreateRequestDialogResponse = {
      name: 'Test request',
      description: 'Test description',
    };

    harness.component.ngOnInit();
    harness.component.name?.setValue(expected.name);
    harness.component.description?.setValue(expected.description);

    harness.component.create();
    expect(dialogRefStub.close).toHaveBeenCalledWith(expected);
  });
});
