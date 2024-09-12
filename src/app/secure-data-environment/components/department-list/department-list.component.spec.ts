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
import { DepartmentListComponent } from './department-list.component';
import { ComponentHarness, setupTestModuleForComponent } from '../../../testing/testing.helpers';
import { createMatDialogStub } from '../../../testing/stubs/mat-dialog.stub';
import { MatDialog } from '@angular/material/dialog';
import { UserDepartmentDTO } from '@maurodatamapper/sde-resources';
import { spyOn } from 'jest-mock';

describe('DepartmentListComponent', () => {
  let harness: ComponentHarness<DepartmentListComponent>;
  const matDialogStub = createMatDialogStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DepartmentListComponent, {
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

  it('should emit rowClickEvent when onRowClickEvent is called', () => {
    const userOrgDto = { departmentId: '1' } as UserDepartmentDTO;
    const spy = spyOn(harness.component.rowClickEvent, 'emit');

    harness.component.onRowClickEvent(userOrgDto);

    expect(spy).toHaveBeenCalledWith(userOrgDto);
  });
});
