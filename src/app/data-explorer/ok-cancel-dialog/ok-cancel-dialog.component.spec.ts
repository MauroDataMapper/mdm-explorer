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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import {
  OkCancelDialogComponent,
  OkCancelDialogResponse,
} from './ok-cancel-dialog.component';

describe('OkCancelDialogComponent', () => {
  let harness: ComponentHarness<OkCancelDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<OkCancelDialogResponse>();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(OkCancelDialogComponent, {
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefStub,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            heading: 'Heading',
            content: 'Content',
            okLabel: 'OKLabel',
            cancelLabel: 'CancelLabel',
          },
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should initialise', () => {
    harness.detectChanges();
    const component = harness.component;
    const htmlMatchString = `.*<h1.*${component.heading}.*</h1.*<mat-dialog-content.*${component.content}.*<mat-dialog-actions.*<button mat-stroked-button.*${component.cancelLabel}.*<button mat-flat-button.*${component.okLabel}.*`;
    const re = new RegExp(htmlMatchString, 's');
    expect(harness.fixture.nativeElement.innerHTML).toMatch(re);
  });

  it('should call dialogRef.close with true on click OK', () => {
    harness.detectChanges();
    const component = harness.component;
    const dom = harness.fixture.debugElement;
    const okButton = dom.query(
      (el) =>
        el.name === 'button' && el.nativeElement.innerHTML.indexOf(component.okLabel) > -1
    );
    dialogRefStub.close.mockReset();
    okButton.triggerEventHandler('click', {});
    expect(dialogRefStub.close).toBeCalledTimes(1);
    expect(dialogRefStub.close.mock.calls[0][0]).toStrictEqual({ result: true });
  });

  it('should call dialogRef.close with false on click Cancel', () => {
    harness.detectChanges();
    const component = harness.component;
    const dom = harness.fixture.debugElement;
    const okButton = dom.query(
      (el) =>
        el.name === 'button' &&
        el.nativeElement.innerHTML.indexOf(component.cancelLabel) > -1
    );
    dialogRefStub.close.mockReset();
    okButton.triggerEventHandler('click', {});
    expect(dialogRefStub.close).toBeCalledTimes(1);
    expect(dialogRefStub.close.mock.calls[0][0]).toStrictEqual({ result: false });
  });
});
