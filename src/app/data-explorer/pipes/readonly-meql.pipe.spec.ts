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
import { TestBed } from '@angular/core/testing';
import { ReadOnlyMeqlPipe } from './readonly-meql.pipe';

describe('ReadOnlyMeqlPipe', () => {
  let pipe: ReadOnlyMeqlPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReadOnlyMeqlPipe],
    });
    pipe = TestBed.inject(ReadOnlyMeqlPipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it.each([
    ['draft, empty and current owner', 'draft', true, true, true],
    ['draft, NOT empty and current owner', 'draft', false, true, false],
    ['draft, empty and NOT current owner', 'draft', true, false, true],
    ['draft, NOT empty and NOT current owner', 'draft', false, false, true],
    ['finalised, empty and current owner', 'finalised', true, true, true],
    ['finalised, NOT empty and current owner', 'finalised', false, true, true],
    ['finalised, empty and NOT current owner', 'finalised', true, false, true],
    ['finalised, NOT empty and NOT current owner', 'finalised', false, false, true],
    ['submitted, empty and current owner', 'submitted', true, true, true],
    ['submitted, NOT empty and current owner', 'submitted', false, true, true],
    ['submitted, empty and NOT current owner', 'submitted', true, false, true],
    ['submitted, NOT empty and NOT current owner', 'submitted', false, false, true],
  ])('%s', (_, status, isEmpty, currentUserOwnsDataSpec, expected) => {
    const actual = pipe.transform(status, isEmpty, currentUserOwnsDataSpec);
    expect(actual).toBe(expected);
  });
});
