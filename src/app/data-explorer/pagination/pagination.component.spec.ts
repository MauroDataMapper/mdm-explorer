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
import { PAGINATION_CONFIG } from '../data-explorer.types';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let harness: ComponentHarness<PaginationComponent>;

  const defaultPageSize = 10;
  const maxPagesToShow = 10;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(PaginationComponent, {
      providers: [
        {
          provide: PAGINATION_CONFIG,
          useValue: {
            defaultPageSize,
            maxPagesToShow,
          },
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.currentPage).toBe(1);
    expect(harness.component.pageSize).toBe(0);
    expect(harness.component.totalResults).toBe(0);
    expect(harness.component.totalPages).toBe(0);
    expect(harness.component.pages).toStrictEqual([]);
  });

  /**
   * Test cases: CurrentPage, PageSize, TotalResults, ExpectedTotalPages, ExpectedPages
   */
  const pageNumberTestCases: [number, number, number, number, number[]][] = [
    [1, 10, 100, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [5, 10, 100, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [10, 10, 200, 20, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
    [7, 10, 200, 20, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
  ];

  const testSettingOfPages = (
    act: (component: PaginationComponent) => void,
    currentPage: number,
    pageSize: number,
    totalResults: number,
    expectedTotalPages: number,
    expectedPages: number[],
  ) => {
    harness.component.currentPage = currentPage;
    harness.component.pageSize = pageSize;
    harness.component.totalResults = totalResults;

    act(harness.component);

    expect(harness.component.totalPages).toBe(expectedTotalPages);
    expect(harness.component.pages).toStrictEqual(expectedPages);
  };

  it.each(pageNumberTestCases)(
    'should initialise the correct pages when page is %p, page size is %p and total results is %p',
    (currentPage, pageSize, totalResults, expectedTotalPages, expectedPages) => {
      testSettingOfPages(
        (comp) => comp.ngOnInit(),
        currentPage,
        pageSize,
        totalResults,
        expectedTotalPages,
        expectedPages,
      );
    },
  );

  it.each(pageNumberTestCases)(
    'should change the correct pages when page is %p, page size is %p and total results is %p',
    (currentPage, pageSize, totalResults, expectedTotalPages, expectedPages) => {
      testSettingOfPages(
        (comp) => comp.ngOnChanges(),
        currentPage,
        pageSize,
        totalResults,
        expectedTotalPages,
        expectedPages,
      );
    },
  );

  it('should not select a page if selecting the same current page', () => {
    const spy = jest.spyOn(harness.component.selected, 'emit');
    harness.component.currentPage = 2;
    harness.component.select(harness.component.currentPage);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should select a page if selecting a different page', () => {
    const spy = jest.spyOn(harness.component.selected, 'emit');
    harness.component.currentPage = 2;
    harness.component.select(harness.component.currentPage + 1);
    expect(spy).toHaveBeenCalled();
  });
});
