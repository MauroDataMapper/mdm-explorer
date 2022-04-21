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
import { DataElementBasic } from '../data-explorer.types';
import {
  RequestCreatedAction,
  RequestCreatedData,
  RequestCreatedDialogComponent,
} from './request-created-dialog.component';
import { MockComponent } from 'ng-mocks';

describe('RequestCreatedDialogComponent', () => {
  let harness: ComponentHarness<RequestCreatedDialogComponent>;
  const dialogRefStub = createMatDialogRefStub<RequestCreatedAction>();

  const request = {
    label: 'test request',
  } as DataModel;

  const setupTestbed = async (data: RequestCreatedData) => {
    harness = await setupTestModuleForComponent(RequestCreatedDialogComponent, {
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
    await setupTestbed({} as RequestCreatedData);
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
    const dataElements: DataElementBasic[] = [
      { label: 'element 1' } as DataElementBasic,
      { label: 'element 2' } as DataElementBasic,
      { label: 'element 3' } as DataElementBasic,
    ];

    await setupTestbed({ request, addedElements: dataElements });

    harness.component.ngOnInit();
    expect(harness.component.name).toBe(request.label);
    expect(harness.component.subHeading).toContain('The following elements were added');
    expect(harness.component.items).toStrictEqual(dataElements.map((de) => de.label));
  });

  it.each<RequestCreatedAction>(['view-requests', 'continue'])(
    'should close with action %p',
    async (action) => {
      await setupTestbed({} as RequestCreatedData);
      harness.component.close(action);
      expect(dialogRefStub.close).toHaveBeenCalledWith(action);
    }
  );
});
