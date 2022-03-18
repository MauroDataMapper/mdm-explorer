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
import { ParamMap, Params } from '@angular/router';
import {
  Breadcrumb,
  CatalogueItemSearchResult,
  DataElement,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { DataClassIdentifier } from '../catalogue/catalogue.types';

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

  // TODO: more parameters will go here - filters, sorting, pagination etc
}

export const mapSearchParametersToParams = (
  parameters: DataElementSearchParameters
): Params => {
  return {
    ...(parameters.dataClass && {
      dm: parameters.dataClass.dataModelId,
      dc: parameters.dataClass.dataClassId,
      pdc: parameters.dataClass.parentDataClassId,
    }),
    ...(parameters.search && { search: parameters.search }),
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
  };
};

export interface DataElementSearchResult {
  id: Uuid;
  label: string;
  description?: string;
  breadcrumbs: Breadcrumb[];
}

export interface DataElementSearchResultSet {
  count: number;
  items: DataElementSearchResult[];
  // TODO: pagination fields...
}

export const mapSearchResult = (
  item: DataElement | CatalogueItemSearchResult
): DataElementSearchResult => {
  return {
    id: item.id ?? '',
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
  item: DataElementSearchResult;
  selected: boolean;
}
