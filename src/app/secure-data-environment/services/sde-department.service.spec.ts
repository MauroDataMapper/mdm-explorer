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
import { setupTestModuleForService } from '../../testing/testing.helpers';
import { SdeDepartmentService } from './sde-department.service';
import { createSdeDepartmentEndpointsStub } from '../../testing/stubs/sde/department-endpoints.stub';
import { Department, DepartmentEndpoints } from '@maurodatamapper/sde-resources';
import { of } from 'rxjs';

describe('SdeDepartmentService', () => {
  let service: SdeDepartmentService;
  const departmentEndpointsStub = createSdeDepartmentEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(SdeDepartmentService, {
      providers: [
        {
          provide: DepartmentEndpoints,
          useValue: departmentEndpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('add an department to the cache', () => {
    const expectedDept = { id: 'test-dept-id' } as Department;

    service.addDepartmentToCache(expectedDept);

    expect(service.departments).toContain(expectedDept);
  });

  it('should return cached department data when available', () => {
    const deptId = 'test-dept-id';
    const expectedDept = { id: deptId } as Department;

    service.addDepartmentToCache(expectedDept);

    service.get(deptId).subscribe((dept) => {
      expect(dept).toEqual(expectedDept);
      expect(departmentEndpointsStub.getDepartment).not.toHaveBeenCalled();
    });
  });

  it('should fetch department data when not cached and add that dept to the cache', () => {
    const deptId = 'test-dept-id';
    const expectedDept = { id: deptId } as Department;

    departmentEndpointsStub.getDepartment.mockReturnValueOnce(of(expectedDept));

    service.get(deptId).subscribe((dept) => {
      expect(dept).toEqual(expectedDept);
      expect(service.departments).toContain(expectedDept);
    });
  });
});
