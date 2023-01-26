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
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { DataRequestRowComponent } from './data-request-row.component';

describe('DataRequestRowComponent', () => {
  let harness: ComponentHarness<DataRequestRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataRequestRowComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.request).toBeUndefined();
    expect(harness.component.detailsRouterLink).toBeUndefined();
    expect(harness.component.showStatus).toBe(true);
    expect(harness.component.showLabel).toBe(true);
    expect(harness.component.showSubmitButton).toBe(false);
    expect(harness.component.showCopyButton).toBe(false);
  });

  it('should raise the submit click event', () => {
    const spy = jest.spyOn(harness.component.submitClick, 'emit');
    harness.component.onSubmitClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should raise the copy click event', () => {
    const spy = jest.spyOn(harness.component.copyClick, 'emit');
    harness.component.onCopyClick();
    expect(spy).toHaveBeenCalled();
  });
});
