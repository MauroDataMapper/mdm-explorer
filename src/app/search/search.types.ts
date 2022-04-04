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
import { InjectionToken } from '@angular/core';
import { ParamMap, Params } from '@angular/router';
import { Bookmark } from 'src/app/core/bookmark.service';
import {
  Breadcrumb,
  CatalogueItemSearchResult,
  DataElement,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { DataClassIdentifier } from '../catalogue/catalogue.types';

export type SortOrder = 'asc' | 'desc';

/**
 * Represents the parameters to drive a Data Element search.
 */
export interface DataElementSearchParameters {
  /**
   * If provided, provides the full identifier to a parent Data Class.
   */
  dataClass?: DataClassIdentifier;

  /**
   * If provided, provides the search terms for full text search.
   */
  search?: string;

  /**
   * If provided, state which page of results to fetch. If not provided, the first page
   * is assumed.
   */
  page?: number;

  /**
   * If provided, state how many results to return per page. If not provided, the default
   * value is assumed.
   */
  pageSize?: number;

  /**
   * The field/property name to sort by.
   */
  sort?: string;

  /**
   * State what sort order to use. If supplied, must be either:
   *
   * * `'asc'` for ascending order, or
   * * `'desc'` for descending order.
   *
   * If not supplied, the default value used will depend on the resource requested.
   */
  order?: SortOrder;

  // TODO: more parameters will go here - filters, sorting, pagination etc
}

/**
 * Map {@link DataElementSearchParameters} to a {@link Params} map to be used for query parameters in
 * a route navigation.
 */
export const mapSearchParametersToParams = (
  parameters: DataElementSearchParameters
): Params => {
  return {
    ...(parameters.dataClass && {
      ...(parameters.dataClass.dataModelId && { dm: parameters.dataClass.dataModelId }),
      ...(parameters.dataClass.dataClassId && { dc: parameters.dataClass.dataClassId }),
      ...(parameters.dataClass.parentDataClassId && {
        pdc: parameters.dataClass.parentDataClassId,
      }),
    }),
    ...(parameters.search && { search: parameters.search }),
    ...(parameters.page && { page: parameters.page }),
    ...(parameters.sort && { sort: parameters.sort }),
    ...(parameters.order && { order: parameters.order }),
  };
};

/**
 * Maps query parameters from a route to a {@link DataElementSearchParameters} object.
 *
 * @param query The {@link ParamMap} containing the query parameters.
 * @returns A {@link DataElementSearchParameters} containing the mapped parameters.
 */
export const mapParamMapToSearchParameters = (
  query: ParamMap
): DataElementSearchParameters => {
  return {
    dataClass: {
      dataModelId: query.get('dm') ?? '',
      dataClassId: query.get('dc') ?? '',
      parentDataClassId: query.get('pdc') ?? undefined,
    },
    search: query.get('search') ?? undefined,
    page: query.has('page') ? Number(query.get('page')) : undefined,
    sort: query.get('sort') ?? '',
    order: query.has('order') ? (query.get('order') as SortOrder) : undefined,
  };
};

/**
 * Represents the configuration for the {@link PaginationService}.
 */
export interface PaginationConfiguration {
  /**
   * State the default page size for all search results.
   */
  defaultPageSize: number;

  /**
   * State how many pages to show in a pagination control.
   */
  maxPagesToShow: number;
}

export const PAGINATION_CONFIG = new InjectionToken<PaginationConfiguration>(
  'PaginationConfiguration'
);

export interface DataElementSearchResult {
  id: Uuid;
  dataModelId: Uuid;
  dataClassId: Uuid;
  label: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
}

export interface DataElementSearchResultSet {
  totalResults: number;
  pageSize: number;
  page: number;
  items: DataElementSearchResult[];
}

// Note: Assumption that the the last breadcrumb is the data class containing the data element
export const mapSearchResult = (
  item: DataElement | CatalogueItemSearchResult
): DataElementSearchResult => {
  let dataClassId = '';

  if (item.breadcrumbs && item.breadcrumbs.length > 0) {
    dataClassId = item.breadcrumbs[item.breadcrumbs.length - 1].id;
  }
  return {
    id: item.id ?? '',
    dataModelId: item.model ?? '',
    dataClassId,
    label: item.label,
    description: item.description,
    breadcrumbs: item.breadcrumbs ?? [],
  };
};

export interface DataElementCheckedEvent {
  item: DataElementSearchResult;
  checked: boolean;
}

export interface DataElementBookmarkEvent {
  item: Bookmark;
  selected: boolean;
}
