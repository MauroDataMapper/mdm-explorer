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
import { Inject, Injectable, Optional } from '@angular/core';
import { PageParameters } from '@maurodatamapper/mdm-resources';
import { PaginationConfiguration, PAGINATION_CONFIG } from './data-explorer.types';

const defaultPageSize = 10;
const defaultMaxPagesToShow = 10;

/**
 * Service to manage calculations related to pagination of results.
 *
 * You can optionally inject a {@link PaginationConfiguration} object via the
 * {@link PAGINATION_CONFIG} injection token to control:
 *
 * 1. The default page size for result pages. If not provided, this will default to 10.
 * 2. The maximum number of page numbers to show in a pagination control. If not provided,
 * this will default to 10.
 */
@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  constructor(
    @Optional() @Inject(PAGINATION_CONFIG) private config?: PaginationConfiguration
  ) {}

  /**
   * Build an object to send to Mauro to define the max and offset for searches.
   *
   * @param page The page to view.
   * @param pageSize The size of the page to request.
   * @returns A {@link PageParameters} object to pass to a Mauro endpoint.
   */
  buildPageParameters(page: number, pageSize?: number): PageParameters {
    const max = pageSize ?? this.config?.defaultPageSize ?? defaultPageSize;
    const offset = page * max - max;

    return { max, offset };
  }

  /**
   * Calculate the total number of pages required to fit the given number of results.
   *
   * @param totalResults The total number of results available.
   * @param pageSize The size of each page.
   * @returns The total number of pages required, rounded up to the nearest whole number.
   */
  getTotalNumberOfPages(totalResults: number, pageSize: number) {
    return Math.ceil(totalResults / pageSize);
  }

  /**
   * Gets an array of page numbers to display in a pagination control.
   *
   * @param currentPage The current page to view.
   * @param totalPages The total number of pages in the range.
   * @returns An array of page numbers to display.
   *
   * The array of page numbers will be limited in size based on {@link PaginationConfiguration.maxPagesToShow},
   * and shifted to represent the range of numbers centered around the {@link currentPage}. For example,
   * when total pages is 20 and current page is 10, a limited list of 10 pages would return:
   *
   * ```ts
   * [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
   * ```
   */
  getPageNumbers(currentPage: number, totalPages: number) {
    const maxPagesToShow = this.config?.maxPagesToShow ?? defaultMaxPagesToShow;
    const pagesToShow = maxPagesToShow > totalPages ? totalPages : maxPagesToShow;
    const boundary = Math.floor(pagesToShow / 2);

    let firstPageNumber: number;
    if (currentPage <= boundary) {
      firstPageNumber = 1;
    } else if (currentPage > totalPages - boundary) {
      firstPageNumber = totalPages - (pagesToShow - 1);
    } else {
      firstPageNumber = currentPage - boundary;
    }

    // Create a range of page numbers, starting from firstPageNumber up to the number of pages
    // to show
    const pages = [...Array(pagesToShow).keys()].map((i) => i + firstPageNumber);
    return pages;
  }
}
