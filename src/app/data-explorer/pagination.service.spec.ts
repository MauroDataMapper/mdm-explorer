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
import { setupTestModuleForService } from '../testing/testing.helpers';
import { PaginationService } from './pagination.service';
import { PAGINATION_CONFIG } from './data-explorer.types';

describe('PaginationService', () => {
  let service: PaginationService;

  const defaultPageSize = 10;
  const maxPagesToShow = 10;

  beforeEach(() => {
    service = setupTestModuleForService(PaginationService, {
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set the max number of pagination results to the default', () => {
    const actual = service.buildPageParameters(1);
    expect(actual.max).toBe(defaultPageSize);
  });

  it.each([5, 15, 20, 30])(
    'should set the max number of pagination results to %p',
    (pageSize) => {
      const actual = service.buildPageParameters(1, pageSize);
      expect(actual.max).toBe(pageSize);
    },
  );

  it.each([
    [0, 1, 20],
    [20, 2, 20],
    [40, 3, 20],
    [0, 1, 10],
    [10, 2, 10],
    [30, 4, 10],
  ])(
    'should set the offset to be %p for page %p and page size %p',
    (expectedOffset, page, pageSize) => {
      const actual = service.buildPageParameters(page, pageSize);
      expect(actual.offset).toBe(expectedOffset);
    },
  );

  it.each([
    [4, 37, 10],
    [2, 37, 20],
    [4, 40, 10],
    [5, 108, 25],
  ])(
    'should say total pages is %p when there are %p results and page size is %p',
    (expectedPageCount, totalResults, pageSize) => {
      const actualPageCount = service.getTotalNumberOfPages(totalResults, pageSize);
      expect(actualPageCount).toBe(expectedPageCount);
    },
  );

  const pageNumberTestCases: [number, number, number[]][] = [
    [1, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [5, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [10, 10, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]],
    [10, 20, [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]],
    [7, 20, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]],
  ];

  it.each(pageNumberTestCases)(
    'should return the expected page numbers when current page is %p, total pages is %p',
    (currentPage, totalPages, expected) => {
      const actual = service.getPageNumbers(currentPage, totalPages);
      expect(actual).toStrictEqual(expected);
    },
  );
});
