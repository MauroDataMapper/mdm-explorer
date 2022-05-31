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
import {
  Breadcrumb,
  CatalogueItemDomainType,
  DataElement,
  DataModel,
  ProfileField,
  ProfileSearchResult,
  ProfileSearchResultField,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { DataClassIdentifier } from '../mauro/mauro.types';

export interface DataExplorerConfiguration {
  profileNamespace: string;
  profileServiceName: string;
  rootDataModelPath: string;
}

export const DATA_EXPLORER_CONFIGURATION = new InjectionToken<DataExplorerConfiguration>(
  'CatalogueConfiguration'
);

export type SortOrder = 'asc' | 'desc';

export type DataElementSearchFilters = {
  [key: string]: string | undefined;
};

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

  /**
   * Optionally provide filter values to control what search results are returned.
   */
  filters?: DataElementSearchFilters;
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
    ...parameters.filters,
  };
};

export const mapParamMapToFilters = (
  query: ParamMap,
  profileFields?: ProfileField[]
): DataElementSearchFilters => {
  if (!profileFields) {
    return {};
  }

  return profileFields.reduce((filters, field) => {
    const key = field.metadataPropertyName;
    filters[key] = query.has(key) ? query.get(key)! : undefined; // eslint-disable-line @typescript-eslint/no-non-null-assertion
    return filters;
  }, {} as DataElementSearchFilters);
};

/**
 * Maps query parameters from a route to a {@link DataElementSearchParameters} object.
 *
 * @param query The {@link ParamMap} containing the query parameters.
 * @returns A {@link DataElementSearchParameters} containing the mapped parameters.
 */
export const mapParamMapToSearchParameters = (
  query: ParamMap,
  profileFields?: ProfileField[]
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
    filters: mapParamMapToFilters(query, profileFields),
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

export interface DataElementSearchResult extends DataElementInstance {
  description?: string;
  identifiableData?: string;
}

export interface SelectableDataElementSearchResult extends DataElementSearchResult {
  isSelected: boolean;
}

export interface DataElementSearchResultSet {
  totalResults: number;
  pageSize: number;
  page: number;
  items: SelectableDataElementSearchResult[];
}

export interface DataElementOperationResult {
  success: boolean;
  message: string;
  item: DataElementInstance;
}

export interface DataElementMultipleOperationResult {
  successes: DataElementOperationResult[];
  failures: DataElementOperationResult[];
}

export const mapProfileSearchResult = (
  item: ProfileSearchResult
): SelectableDataElementSearchResult => {
  // Note: Assumption that the the last breadcrumb is the data class containing the data element
  const dataClassId =
    item.breadcrumbs && item.breadcrumbs.length > 0
      ? item.breadcrumbs[item.breadcrumbs.length - 1].id
      : '';

  // Map profile fields directly to the returned object for ease of access
  const idenfifableDataField = item.profileFields.find(
    (field: ProfileSearchResultField) => field.metadataPropertyName === 'identifiableData'
  );

  return {
    id: item.id ?? '',
    model: item.model ?? '',
    dataClass: dataClassId,
    label: item.label,
    description: item.description,
    breadcrumbs: item.breadcrumbs ?? [],
    identifiableData: idenfifableDataField?.currentValue,
    isSelected: false,
    isBookmarked: false,
  };
};

export type DataRequestStatus = 'unsent' | 'submitted';

/* .*
 * Determine the status of a request made by a user for data access.
 */
export const getDataRequestStatus = (model: DataModel): DataRequestStatus => {
  if (model.modelVersion) {
    // Model was finalised, so is now locked
    return 'submitted';
  }

  return 'unsent';
};

/**
 * Define a Data Request, which is an extension of a {@link DataModel}.
 */
export interface DataRequest extends DataModel {
  /**
   * Get the status of this request, one of {@link DataRequestStatus}.
   */
  status: DataRequestStatus;
}

export const mapToDataRequest = (dataModel: DataModel): DataRequest => {
  return {
    ...dataModel,
    status: getDataRequestStatus(dataModel),
  };
};

export interface DataElementDto extends DataElement {}

export interface DataElementInstance extends IsBookmarkable {
  [key: string]: any;
  id: Uuid;
  model: Uuid;
  dataClass: Uuid;
  label: string;
  breadcrumbs?: Breadcrumb[];
  domainType?: CatalogueItemDomainType;
}

export interface DataElementCheckedEvent {
  item: DataElementInstance;
  checked: boolean;
}

export interface SelectableDataElementSearchResultCheckedEvent {
  item: SelectableDataElementSearchResult;
  checked: boolean;
}

export interface BookMarkCheckedEvent {
  item: DataElementSearchResult;
  checked: boolean;
}

export interface AddToRequestEvent {
  item: DataElementSearchResult;
  requestId: Uuid;
}

export interface RemoveBookmarkEvent {
  item: DataElementSearchResult;
}

export interface DataElementBookmarkEvent {
  item: DataElementSearchResult;
  selected: boolean;
}

export interface IsBookmarkable {
  isBookmarked: boolean;
}

export interface DataElementDeleteEvent {
  item: SelectableDataElementSearchResult;
}
