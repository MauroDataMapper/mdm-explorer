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
import { InjectionToken } from '@angular/core';
import { ParamMap, Params } from '@angular/router';
import {
  Breadcrumb,
  CatalogueItemDomainType,
  DataClass,
  DataElement,
  DataModel,
  DataType,
  Folder,
  ProfileField,
  ProfileSearchResult,
  ProfileSearchResultField,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { DataClassIdentifier } from '../mauro/mauro.types';

export interface DataExplorerConfiguration {
  profileNamespace: string;
  profileServiceName: string;
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
export const mapSearchParametersToParams = (parameters: DataElementSearchParameters): Params => {
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
    ...(parameters.pageSize && { pageSize: parameters.pageSize }),
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
    pageSize: query.has('pageSize') ? Number(query.get('pageSize')) : undefined,
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
  isSelected: boolean;
}

export interface DataElementSearchResultSet {
  totalResults: number;
  pageSize: number;
  page: number;
  items: DataElementSearchResult[];
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

export const mapProfileSearchResult = (item: ProfileSearchResult): DataElementSearchResult => {
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

export type DataSpecificationStatus = 'draft' | 'finalised' | 'submitted';

/**
 * Define a data specification, which is an extension of a {@link DataModel}.
 */
export interface DataSpecification extends DataModel {
  /**
   * Get the status of this data specification, one of {@link DataSpecificationStatus}.
   */
  status: DataSpecificationStatus;
}

export type DataElementDto = DataElement;

export interface BookmarkDto {
  id?: Uuid;
  dataModelId?: Uuid;
  dataClassId?: Uuid;
  label: string;
  breadcrumbs: Breadcrumb[];
}

export interface DataElementInstance extends IsBookmarkable {
  [key: string]: any;
  /**
   * The unique ID of the data element.
   */
  id: Uuid;
  /**
   * The unique ID of the parent data model the data element belongs under.
   */
  model: Uuid;
  /**
   * The unique ID of the parent data class the data element belongs under.
   */
  dataClass: Uuid;
  dataType?: DataType;
  label: string;
  breadcrumbs?: Breadcrumb[];
  domainType?: CatalogueItemDomainType;
}

export interface DataElementCheckedEvent {
  item: DataElementInstance;
  checked: boolean;
}

export interface SelectableDataElementSearchResultCheckedEvent {
  item: DataElementSearchResult;
  checked: boolean;
}
export interface SelectionChangedBy {
  instigator: 'parent' | 'child';
}
export interface SelectionChange {
  changedBy: SelectionChangedBy;
  isSelected: boolean;
}

export interface BookMarkCheckedEvent {
  item: DataElementSearchResult;
  checked: boolean;
}

export interface AddToDataSpecificationEvent {
  item: DataElementSearchResult;
  dataSpecificationId: Uuid;
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
  item: DataElementSearchResult;
  confirmationMessage?: string;
}

export interface DataElementSelectEvent {
  selected: boolean;
}

export interface DataClassDeleteEvent {
  dataClassWithElements: DataClassWithElements;
  dataSchema?: DataSchema;
  confirmationMessage?: string;
}

export interface DataSchemaDeleteEvent {
  dataSchema: DataSchema;
  confirmationMessage?: string;
}

export interface DataItemDeleteEvent {
  dataSchema?: DataSchema;
  dataClassWithElements?: DataClassWithElements;
  dataElement?: DataElementSearchResult;
  confirmationMessage?: string;
}

export type DataSpecificationQueryType = 'none' | 'cohort' | 'data';

export const dataSpecificationQueryLanguage = 'json-meql';

export interface DataSpecificationQueryPayload {
  ruleId?: Uuid;
  representationId?: Uuid;
  type: DataSpecificationQueryType;
  condition: QueryCondition;
}

export type DataSpecificationQuery = Required<DataSpecificationQueryPayload>;

export type QueryOperator =
  | '='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'contains'
  | 'like'
  | 'startswith'
  | 'endswith'
  | 'in'
  | 'not in';

export interface QueryExpression {
  field: string;
  operator: QueryOperator;
  value: any;
}

export interface QueryCondition {
  condition: 'and' | 'or';
  entity: string;
  rules: QueryRule[];
}

export type QueryRule = QueryExpression | QueryCondition;

export interface DataClassWithElements {
  dataClass: DataClass;
  dataElements: DataElementSearchResult[];
}

export interface DataSchema {
  schema: DataClass;
  dataClasses: DataClassWithElements[];
}

export interface ForkDataSpecificationOptions {
  targetFolder?: Folder;
}
