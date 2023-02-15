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
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent, MockDirective } from 'ng-mocks';
import { Observable, of } from 'rxjs';
import { dontAllowDuplicatedNames } from 'src/app/shared/mdm-validators';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import {
  createMatDialogRefStub,
  createMatDialogStub,
} from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataRequestsService } from '../data-requests.service';
import { OkCancelDialogResponse } from '../ok-cancel-dialog/ok-cancel-dialog.component';

import {
  EditRequestDialogComponent,
  EditRequestDialogOptions,
  EditRequestDialogResponse,
} from './edit-request-dialog.component';

describe('EditRequestDialogComponent', () => {
  let harness: ComponentHarness<EditRequestDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<EditRequestDialogResponse>();
  const dataRequestsStub = createDataRequestsServiceStub();
  const dialogsStub = createMatDialogStub();

  dataRequestsStub.isDataRequestNameAvailable.mockImplementation(
    (): Observable<boolean> => {
      return of(true);
    }
  );
  const label = 'label 1';
  const description = 'description';
  const requestData: EditRequestDialogOptions = {
    requestName: label,
    requestDescription: description,
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(EditRequestDialogComponent, {
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
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: requestData,
        },
        {
          provide: MatDialog,
          useValue: dialogsStub,
        },
      ],
    });
  });

  beforeEach(() => {
    dialogRefStub.close.mockClear();
  });

  it('should create', () => {
    // Assert
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.requestForm).toBeUndefined();
  });

  it('should initialise', () => {
    // Act
    harness.component.ngOnInit();

    // Assert
    expect(harness.component.requestForm).toBeDefined();
    expect(harness.component.name?.value).toBe(label);
    expect(harness.component.name?.hasValidator(Validators.required)).toBeTruthy(); // eslint-disable-line @typescript-eslint/unbound-method
    expect(harness.component.description?.value).toBe(description);

    // TODO: when adding an async validator
    // the form seems to call the function
    // and the validator will not show as added
    // until the observable that the validator function
    // returns is completed. Is there any nicer way of doing this?
    // I tried .toSatisfyOnFlush but is not available for Observable<bool>
    setTimeout(() => {
      expect(
        harness.component.name?.hasAsyncValidator(
          dontAllowDuplicatedNames(
            dataRequestsStub as unknown as DataRequestsService,
            label
          )
        )
      ).toBeTruthy(); // eslint-disable-line @typescript-eslint/unbound-method
    }, 100);
  });

  it('should not close without confirmation if changes were made', () => {
    // Act
    harness.component.ngOnInit();

    // Assert
    setTimeout(() => {
      harness.component.name?.setValue('new value');
      harness.component.close();
      expect(dialogsStub.open).toHaveBeenCalled();
      expect(dialogRefStub.close).toHaveBeenCalledTimes(0);
    }, 100);
  });

  it('should close after confirmation if changes were made', () => {
    // Arrange
    const okCancelResponse: OkCancelDialogResponse = {
      result: true,
    };
    dataRequestsStub.isDataRequestNameAvailable.mockImplementation(
      (): Observable<boolean> => {
        return of(true);
      }
    );
    dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

    // Act
    harness.component.ngOnInit();

    // Arrange
    setTimeout(() => {
      harness.component.name?.setValue('new value');
      harness.component.close();
      expect(dialogRefStub.close).toHaveBeenCalled();
    }, 100);
  });

  it('should close without confirmation if no change was made', () => {
    // Act
    harness.component.ngOnInit();
    harness.component.close();

    // Assert
    expect(dialogRefStub.close).toHaveBeenCalled();
  });

  it('should not update when form is invalid', () => {
    // Act
    harness.component.ngOnInit();
    harness.component.update();

    // Assert
    expect(dialogRefStub.close).not.toHaveBeenCalled();
  });

  it('should update when form is valid', () => {
    // Arrange
    dataRequestsStub.isDataRequestNameAvailable.mockImplementation(
      (): Observable<boolean> => {
        return of(true);
      }
    );
    const expected: EditRequestDialogResponse = {
      name: 'Test request',
      description: 'Test description',
    };

    // Act
    harness.component.ngOnInit();
    harness.component.name?.setValue(expected.name);
    harness.component.description?.setValue(expected.description);
    harness.component.update();

    // Assert
    expect(dialogRefStub.close).toHaveBeenCalledWith(expected);
  });
});
