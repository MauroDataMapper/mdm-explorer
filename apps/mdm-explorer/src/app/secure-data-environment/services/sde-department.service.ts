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
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, tap } from 'rxjs';
import {
  Department,
  DepartmentEndpoints,
  UserDepartmentDTO,
  Uuid,
} from '@maurodatamapper/sde-resources';

@Injectable({
  providedIn: 'root',
})
export class SdeDepartmentService {
  private _departments = new BehaviorSubject<Department[]>([]);

  constructor(private departmentEndpoints: DepartmentEndpoints) {}

  get departments$(): Observable<Department[]> {
    return this._departments.asObservable();
  }

  get departments(): Department[] {
    return this._departments.value;
  }

  get(departmentId: Uuid): Observable<Department> {
    const cachedDept = this.departments.find((dept) => dept.id === departmentId);
    return cachedDept ? of(cachedDept) : this.fetch(departmentId);
  }

  getUsersDepartments(): Observable<UserDepartmentDTO[]> {
    return this.departmentEndpoints.listResearchersDepartmentMemberships();
  }

  addDepartmentToCache(department: Department): void {
    this._departments.next([...this.departments, department]);
  }

  private fetch(departmentId: Uuid): Observable<Department> {
    return this.departmentEndpoints.getDepartment(departmentId).pipe(
      tap((dept: Department) => {
        this.addDepartmentToCache(dept);
      })
    );
  }
}
