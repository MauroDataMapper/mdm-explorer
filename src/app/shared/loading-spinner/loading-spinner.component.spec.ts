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
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { MatSpinner } from '@angular/material/progress-spinner';
import { LoadingSpinnerComponent } from './loading-spinner.component';
import { MockComponent } from 'ng-mocks';

describe('LoadingSpinnerComponent', () => {
  let harness: ComponentHarness<LoadingSpinnerComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(LoadingSpinnerComponent, {
      declarations: [MockComponent(MatSpinner)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.color).toBe('primary');
    expect(harness.component.diameter).toBeGreaterThan(0);
    expect(harness.component.caption).toBeDefined();
  });
});
