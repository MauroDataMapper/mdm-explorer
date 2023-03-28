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
import { DataSpecificationQueryType } from '../data-explorer.types';

import { DataQueryRowComponent } from './data-query-row.component';

describe('DataQueryRowComponent', () => {
  let harness: ComponentHarness<DataQueryRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataQueryRowComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.queryType).toBeUndefined();
    expect(harness.component.condition).toBeUndefined();
    expect(harness.component.readOnly).toBe(false);
    expect(harness.component.createRouterLink).toBeUndefined();
    expect(harness.component.editRouterLink).toBeUndefined();
  });

  it.each<[DataSpecificationQueryType | undefined, string | null]>([
    ['cohort', 'Cohort query'],
    ['data', 'Data query'],
    [undefined, null],
  ])('should use type %p to use label %p', (type, expected) => {
    harness.component.queryType = type;
    const actual = harness.component.label;
    expect(actual).toBe(expected);
  });

  it('should allow create button when no query is set', () => {
    expect(harness.component.canCreate).toBe(true);
  });

  it('should allow create button when a query has no rules', () => {
    harness.component.condition = {
      condition: 'and',
      rules: [],
    };

    expect(harness.component.canCreate).toBe(true);
  });

  it('should not allow create button when a query has at least one rule', () => {
    harness.component.condition = {
      condition: 'and',
      rules: [
        {
          field: 'test',
          operator: '=',
          value: 'test',
        },
      ],
    };

    expect(harness.component.canCreate).toBe(false);
  });

  it('should allow edit button when a query has at least one rule', () => {
    harness.component.condition = {
      condition: 'and',
      rules: [
        {
          field: 'test',
          operator: '=',
          value: 'test',
        },
      ],
    };

    expect(harness.component.canEdit).toBe(true);
  });

  it('should not allow edit button when no query is set', () => {
    expect(harness.component.canEdit).toBeFalsy();
  });

  it('should not allow edit button when a query has no rules', () => {
    harness.component.condition = {
      condition: 'and',
      rules: [],
    };

    expect(harness.component.canEdit).toBe(false);
  });
});
