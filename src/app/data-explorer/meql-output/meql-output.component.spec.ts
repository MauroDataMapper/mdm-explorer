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
import { SimpleChange, SimpleChanges } from '@angular/core';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { MeqlOutputComponent } from './meql-output.component';

describe('MeqlOutputComponent', () => {
  let harness: ComponentHarness<MeqlOutputComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MeqlOutputComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should determine the query object from JSON string input', () => {
    const expected = {
      name: 'Test',
      values: [1, 2, 3],
    };

    const content = JSON.stringify(expected);
    harness.component.content = content;

    harness.component.ngOnChanges({
      content: new SimpleChange(null, content, false),
    } as SimpleChanges);

    expect(harness.component.query).toStrictEqual(expected);
  });
});
