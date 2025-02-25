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
import { createSdeOrganisationServiceStub } from '../../../testing/stubs/sde/sde-organisation-service.stub';
import { ComponentHarness, setupTestModuleForComponent } from '../../../testing/testing.helpers';
import {
  APPROVER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST,
  MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST,
  ListColumn,
  Department,
  DepartmentMemberService,
  DepartmentContactService,
  UserDepartmentDTO,
  Contact,
  MEMBER_DISPLAY_COLUMNS_FOR_DEPT_CONTACT_LIST,
} from '@maurodatamapper/sde-resources';
import { createDepartmentMemberServiceStub } from '../../../testing/stubs/sde/department-member.service.stub';
import { createDepartmentContactServiceStub } from 'src/app/testing/stubs/sde/department-contact.service.stub';
import { of } from 'rxjs';
import { SdeOrganisationService } from '../../services/sde-organisation.service';

describe('DepartmentsComponent', () => {
  let harness: ComponentHarness<DepartmentsComponent>;
  const sdeOrganisationService = createSdeOrganisationServiceStub();
  const sdeDepartmentServiceStub = createSdeDepartmentServiceStub();
  const departmentMemberService = createDepartmentMemberServiceStub();
  const departmentContactServiceStub = createDepartmentContactServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DepartmentsComponent, {
      providers: [
        {
          provide: SdeOrganisationService,
          useValue: sdeOrganisationService,
        },
        {
          provide: SdeDepartmentService,
          useValue: sdeDepartmentServiceStub,
        },
        {
          provide: DepartmentMemberService,
          useValue: departmentMemberService,
        },
        {
          provide: DepartmentContactService,
          useValue: departmentContactServiceStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
  });

  describe('ngOnInit: setting initial selectedDept, myDepartments, userHasDepartments, and displayColumns', () => {
    it('should handle the case where the user has no departments', () => {
      sdeOrganisationService.getUsersOrganisation.mockReturnValueOnce(of([]));
      sdeDepartmentServiceStub.getUsersDepartments.mockReturnValueOnce(of([]));

      harness.detectChanges();

      expect(harness.component.myDepartments).toEqual([]);
      expect(harness.component.selectedDepartment).toBeUndefined();
      expect(harness.component.userHasDepartments).toBe(false);
      expect(harness.component.displayColumnsForDepartmentMemberList).toEqual([]);
      expect(harness.component.displayColumnsForDepartmentContactList).toEqual([]);
    });

    it('should initialise for an APPROVER', () => {
      const userDepts = [{ departmentId: '1', role: 'APPROVER' } as UserDepartmentDTO];
      const contactDepts = [
        { id: '10', fullName: 'Test Contact', email: 'contact@email.com' } as Contact,
      ];
      const expectedDept = { id: '1' } as Department;
      const expectedDisplayColumns = APPROVER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST;
      const expectedDisplayContactsColumn = MEMBER_DISPLAY_COLUMNS_FOR_DEPT_CONTACT_LIST;

      sdeOrganisationService.getUsersOrganisation.mockReturnValueOnce(of([]));
      sdeDepartmentServiceStub.getUsersDepartments.mockReturnValueOnce(of(userDepts));
      departmentContactServiceStub.list.mockReturnValue(of(contactDepts));
      sdeDepartmentServiceStub.get.mockReturnValueOnce(of(expectedDept));
      departmentMemberService.getDisplayColumnsForResearcher.mockReturnValueOnce(
        APPROVER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST as ListColumn[]
      );
      departmentContactServiceStub.getDisplayColumnsForResearcher.mockReturnValueOnce(
        MEMBER_DISPLAY_COLUMNS_FOR_DEPT_CONTACT_LIST as ListColumn[]
      );

      harness.detectChanges();

      expect(harness.component.myDepartments).toEqual(userDepts);
      expect(harness.component.selectedDepartment).toEqual(expectedDept);
      expect(harness.component.userHasDepartments).toBe(true);
      expect(harness.component.displayColumnsForDepartmentMemberList).toBe(expectedDisplayColumns);
      expect(harness.component.displayColumnsForDepartmentContactList).toBe(
        expectedDisplayContactsColumn
      );
    });

    it('should initialise for a MEMBER', () => {
      const userDepts = [{ departmentId: '1', role: 'MEMBER' } as UserDepartmentDTO];
      const expectedDept = { id: '1' } as Department;
      const expectedDisplayColumns = MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST;
      const expectedDisplayContactsColumn = MEMBER_DISPLAY_COLUMNS_FOR_DEPT_CONTACT_LIST;

      sdeOrganisationService.getUsersOrganisation.mockReturnValueOnce(of([]));
      sdeDepartmentServiceStub.getUsersDepartments.mockReturnValueOnce(of(userDepts));
      sdeDepartmentServiceStub.get.mockReturnValueOnce(of(expectedDept));
      departmentMemberService.getDisplayColumnsForResearcher.mockReturnValueOnce(
        MEMBER_DISPLAY_COLUMNS_FOR_DEPT_MEMBER_LIST as ListColumn[]
      );
      departmentContactServiceStub.getDisplayColumnsForResearcher.mockReturnValueOnce(
        MEMBER_DISPLAY_COLUMNS_FOR_DEPT_CONTACT_LIST as ListColumn[]
      );

      harness.detectChanges();

      expect(harness.component.myDepartments).toEqual(userDepts);
      expect(harness.component.selectedDepartment).toEqual(expectedDept);
      expect(harness.component.userHasDepartments).toBe(true);
      expect(harness.component.displayColumnsForDepartmentMemberList).toBe(expectedDisplayColumns);
      expect(harness.component.displayColumnsForDepartmentContactList).toBe(
        expectedDisplayContactsColumn
      );
    });
  });
});
