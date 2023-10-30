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

import { SdeMainComponent } from './sde-main.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { SecurityService } from 'src/app/security/security.service';

describe('SdeMainComponent', () => {
  let harness: ComponentHarness<SdeMainComponent>;

  const securityStub = createSecurityServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SdeMainComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
