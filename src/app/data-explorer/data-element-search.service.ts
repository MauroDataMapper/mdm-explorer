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
import { Inject, Injectable } from '@angular/core';
import {
  CatalogueItemDomainType,
  MultiFacetAwareDomainType,
  PageParameters,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { DataExplorerService } from './data-explorer.service';
import { PaginationService } from './pagination.service';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
  mapProfileSearchResult,
} from './data-explorer.types';
import { ProfileService } from '../mauro/profile.service';

/**
 * Service to search for Data Elements, either by providing a listing or using full text search.
 */
@Injectable({
  providedIn: 'root',
})
export class DataElementSearchService {
  constructor(
    private profiles: ProfileService,
    private dataExplorer: DataExplorerService,
    private pagination: PaginationService,
    @Inject(DATA_EXPLORER_CONFIGURATION)
    private explorerConfig: DataExplorerConfiguration,
  ) {}

  /**
   * Gets a Data Element listing based on a parent Data Class. This will return the list of Data Elements
   * directly under said Data Class.
   *
   * @param params The parameters to control the search.
   * @returns An observable that returns an {@link DataElementSearchResultSet} containing the search
   * results and information related to the results.
   */
  listing(params: DataElementSearchParameters): Observable<DataElementSearchResultSet> {
    if (!params?.dataClass) {
      return throwError(() => new Error('Must provide a root Data Class.'));
    }

    const [page, pageParams] = this.getPageParameters(params);
    const query: SearchQueryParameters = {
      ...this.getCommonQueryParameters(params),
      ...pageParams,
      searchTerm: '*', // No search term, use filters for listing instead
    };

    return this.performSearch(
      MultiFacetAwareDomainType.DataClasses,
      params.dataClass.dataClassId,
      query,
      page,
      pageParams,
    );
  }

  /**
   * Perform a full text search on the root Data Model to find any Data Elements matching the given
   * search terms.
   *
   * @param params The parameters to control the search.
   * @returns An observable that returns an {@link DataElementSearchResultSet} containing the search
   * results and information related to the results.
   */
  search(params: DataElementSearchParameters): Observable<DataElementSearchResultSet> {
    const [page, pageParams] = this.getPageParameters(params);
    const query: SearchQueryParameters = {
      ...this.getCommonQueryParameters(params),
      ...pageParams,
      searchTerm: params.search,
    };

    return this.dataExplorer.getRootDataModel().pipe(
      switchMap((dataModel) => {
        if (!dataModel.id) {
          return throwError(() => new Error('Root Data Model has no id.'));
        }

        return this.performSearch(
          MultiFacetAwareDomainType.DataModels,
          dataModel.id,
          query,
          page,
          pageParams,
        );
      }),
    );
  }

  private getPageParameters(
    params: DataElementSearchParameters,
  ): [number, PageParameters] {
    const page = params.page ?? 1;
    const pageParams = this.pagination.buildPageParameters(page, params.pageSize);
    return [page, pageParams];
  }

  private getCommonQueryParameters(
    params: DataElementSearchParameters,
  ): SearchQueryParameters {
    return {
      sort: params.sort,
      order: params.order,
      researchFields: params.filters, // Use custom research profile fields to map filter values
      domainTypes: [CatalogueItemDomainType.DataElement],
    };
  }

  private performSearch(
    domainType: MultiFacetAwareDomainType,
    id: Uuid,
    query: SearchQueryParameters,
    page: number,
    pageParams: PageParameters,
  ): Observable<DataElementSearchResultSet> {
    // Force search to be limited to a domain, this might change in future to do catalogue-wide search...
    return this.profiles
      .searchCatalogueItem(
        domainType,
        id,
        this.explorerConfig.profileNamespace,
        this.explorerConfig.profileServiceName,
        query,
      )
      .pipe(
        map((dataElements) => {
          return {
            totalResults: dataElements.count,
            pageSize: pageParams.max!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            page,
            items: dataElements.items.map(mapProfileSearchResult),
          };
        }),
      );
  }
}
