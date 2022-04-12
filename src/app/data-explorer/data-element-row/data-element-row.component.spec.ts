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
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementBasic } from '../data-explorer.types';

import { DataElementRowComponent } from './data-element-row.component';

describe('DataElementRowComponent', () => {
  let harness: ComponentHarness<DataElementRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementRowComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.item).toBeUndefined();
  });

  it('should not raise an event when checked but has no item', () => {
    const emitSpy = jest.spyOn(harness.component.checked, 'emit');
    const event = {} as MatCheckboxChange;
    harness.component.itemChecked(event);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'should raise an event when has an item and checked is %p',
    (checked) => {
      const emitSpy = jest.spyOn(harness.component.checked, 'emit');
      const event = { checked } as MatCheckboxChange;
      const item: DataElementBasic = {
        id: '1',
        dataModelId: '2',
        dataClassId: '3',
        label: 'test',
      };

      harness.component.item = item;
      harness.component.itemChecked(event);

      expect(emitSpy).toHaveBeenCalled();
    }
  );
});
