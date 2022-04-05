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

import { CallToActionComponent } from './call-to-action.component';

describe('CallToActionComponent', () => {
  let harness: ComponentHarness<CallToActionComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CallToActionComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.heading).toBe('');
    expect(harness.component.actionLabel).toBe('Action');
    expect(harness.component.actionRouterLink).toBeUndefined();
  });

  it('should raise an event when performing the action', () => {
    const spy = jest.spyOn(harness.component.actionClicked, 'emit');
    harness.component.performAction();
    expect(spy).toHaveBeenCalled();
  });
});
