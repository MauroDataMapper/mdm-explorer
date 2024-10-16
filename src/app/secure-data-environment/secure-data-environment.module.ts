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
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SdeRequestsComponent } from './components/sde-requests/sde-requests.component';
import { DepartmentListComponent } from './components/department-list/department-list.component';
import { DepartmentsComponent } from './pages/departments/departments.component';
import { SdeSignInComponent } from './sde-sign-in/sde-sign-in.component';

@NgModule({
  declarations: [
    SdeRequestsComponent,
    DepartmentListComponent,
    DepartmentsComponent,
    SdeSignInComponent,
  ],
  imports: [CoreModule, SharedModule],
  exports: [
    SdeRequestsComponent,
    DepartmentListComponent,
    DepartmentsComponent,
    SdeSignInComponent,
  ],
})
export class SecureDataEnvironmentModule {}
