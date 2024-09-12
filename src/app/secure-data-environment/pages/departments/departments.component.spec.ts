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
import { DepartmentsComponent } from './departments.component';
import { SdeDepartmentService } from '../../services/sde-department.service';
import { createSdeDepartmentServiceStub } from '../../../testing/stubs/sde/sde-department-service.stub';
import { ComponentHarness, setupTestModuleForComponent } from '../../../testing/testing.helpers';
import {
  APPROVER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST,
  MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST,
  ListColumn,
  Department,
  DepartmentMemberService,
  UserDepartmentDTO,
} from '@maurodatamapper/sde-resources';
import { createDepartmentMemberServiceStub } from '../../../testing/stubs/sde/department-member.service.stub';
import { of } from 'rxjs';

describe('DepartmentsComponent', () => {
  let harness: ComponentHarness<DepartmentsComponent>;
  const sdeDepartmentServiceStub = createSdeDepartmentServiceStub();
  const departmentMemberService = createDepartmentMemberServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DepartmentsComponent, {
      providers: [
        {
          provide: SdeDepartmentService,
          useValue: sdeDepartmentServiceStub,
        },
        {
          provide: DepartmentMemberService,
          useValue: departmentMemberService,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
  });

  describe('ngOnInit: setting initial selectedDept, myDepartments, userHasDepartments, and displayColumns', () => {
    it('should handle the case where the user has no departments', () => {
      sdeDepartmentServiceStub.getUsersDepartments.mockReturnValueOnce(of([]));

      harness.detectChanges();

      expect(harness.component.myDepartments).toEqual([]);
      expect(harness.component.selectedDepartment).toBeUndefined();
      expect(harness.component.userHasDepartments).toBe(false);
      expect(harness.component.displayColumnsForDepartmentMemberList).toEqual([]);
    });

    it('should initialise for an APPROVER', () => {
      const userDepts = [{ departmentId: '1', role: 'APPROVER' } as UserDepartmentDTO];
      const expectedDept = { id: '1' } as Department;
      const expectedDisplayColumns = APPROVER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST;

      sdeDepartmentServiceStub.getUsersDepartments.mockReturnValueOnce(of(userDepts));
      sdeDepartmentServiceStub.get.mockReturnValueOnce(of(expectedDept));
      departmentMemberService.getDisplayColumnsForResearcher.mockReturnValueOnce(
        APPROVER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST as ListColumn[]
      );

      harness.detectChanges();

      expect(harness.component.myDepartments).toEqual(userDepts);
      expect(harness.component.selectedDepartment).toEqual(expectedDept);
      expect(harness.component.userHasDepartments).toBe(true);
      expect(harness.component.displayColumnsForDepartmentMemberList).toBe(expectedDisplayColumns);
    });

    it('should initialise for a MEMBER', () => {
      const userDepts = [{ departmentId: '1', role: 'MEMBER' } as UserDepartmentDTO];
      const expectedDept = { id: '1' } as Department;
      const expectedDisplayColumns = MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST;

      sdeDepartmentServiceStub.getUsersDepartments.mockReturnValueOnce(of(userDepts));
      sdeDepartmentServiceStub.get.mockReturnValueOnce(of(expectedDept));
      departmentMemberService.getDisplayColumnsForResearcher.mockReturnValueOnce(
        MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST as ListColumn[]
      );

      harness.detectChanges();

      expect(harness.component.myDepartments).toEqual(userDepts);
      expect(harness.component.selectedDepartment).toEqual(expectedDept);
      expect(harness.component.userHasDepartments).toBe(true);
      expect(harness.component.displayColumnsForDepartmentMemberList).toBe(expectedDisplayColumns);
    });
  });
});
