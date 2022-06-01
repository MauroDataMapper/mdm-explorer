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
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DataClass, DataModel } from '@maurodatamapper/mdm-resources';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementInstance } from '../data-explorer.types';
import {
  RequestUpdatedAction,
  RequestUpdatedData,
  RequestUpdatedDialogComponent,
} from './request-updated-dialog.component';
import { MockComponent } from 'ng-mocks';

describe('RequestUpdatedDialogComponent', () => {
  let harness: ComponentHarness<RequestUpdatedDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<RequestUpdatedAction>();

  const request = {
    label: 'test request',
  } as DataModel;

  const setupTestbed = async (data: RequestUpdatedData) => {
    harness = await setupTestModuleForComponent(RequestUpdatedDialogComponent, {
      declarations: [MockComponent(MatDialogActions), MockComponent(MatDialogContent)],
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
  };

  it('should create', async () => {
    await setupTestbed({} as RequestUpdatedData);
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.name).toBe('');
    expect(harness.component.subHeading).toBe('');
    expect(harness.component.items).toStrictEqual([]);
  });

  it('should initialise with a provided Data Class', async () => {
    const dataClass = {
      label: 'test class',
    } as DataClass;

    await setupTestbed({ request, addedClass: dataClass });

    harness.component.ngOnInit();
    expect(harness.component.name).toBe(request.label);
    expect(harness.component.subHeading).toContain('1 class with all elements added');
    expect(harness.component.items).toStrictEqual([dataClass.label]);
  });

  it('should initialise with provided Data Elements', async () => {
    const dataElements: DataElementInstance[] = [
      { label: 'element 1' } as DataElementInstance,
      { label: 'element 2' } as DataElementInstance,
      { label: 'element 3' } as DataElementInstance,
    ];

    await setupTestbed({ request, addedElements: dataElements });

    harness.component.ngOnInit();
    expect(harness.component.name).toBe(request.label);
    expect(harness.component.subHeading).toContain('The following elements were added');
    expect(harness.component.items).toStrictEqual(dataElements.map((de) => de.label));
  });

  it.each<RequestUpdatedAction>(['view-requests', 'continue'])(
    'should close with action %p',
    async (action) => {
      await setupTestbed({} as RequestUpdatedData);
      harness.component.close(action);
      expect(dialogRefStub.close).toHaveBeenCalledWith(action);
    }
  );
});
