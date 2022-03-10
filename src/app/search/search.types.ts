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
import { inject, InjectionToken } from '@angular/core';
import {
  Breadcrumb,
  CatalogueItemSearchResult,
  DataElement,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { UIRouterGlobals } from '@uirouter/angular';
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

/**
 * Function type to invoke a function to return a {@link DataElementSearchParameters} object.
 */
export type DataElementSearchParametersFn = () => DataElementSearchParameters;

/**
 * Injection token to inject a {@link DataElementSearchParametersFn} function into a component.
 *
 * This injected function will return the latest values from the URL query parameter to use as the basis of
 * a {@link DataElementSearchParameters} object.
 *
 * Use the injected function to retrieve the current query parameters to operate the search functionality.
 */
export const SEARCH_QUERY_PARAMS = new InjectionToken<DataElementSearchParametersFn>(
  'SearchQueryParameters',
  {
    factory: () => {
      const routerGlobals = inject(UIRouterGlobals);

      return () => {
        return {
          dataClass: {
            dataModelId: routerGlobals.params.dm,
            dataClassId: routerGlobals.params.dc,
            parentDataClassId: routerGlobals.params.pdc,
          },
          search: routerGlobals.params.search,
        };
      };
    },
  }
);
