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
import { UserRegistrationFormComponent } from './user-registration-form.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';

describe('UserRegistrationFormComponent', () => {
  let harness: ComponentHarness<UserRegistrationFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(UserRegistrationFormComponent, {
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ToastrService, useValue: {} },
        { provide: DialogService, useValue: {} as DialogService },
        { provide: StateRouterService, useValue: {} as StateRouterService },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
