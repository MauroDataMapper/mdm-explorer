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
import { Injectable } from '@angular/core';
import {
  CatalogueItemDomainType,
  DataElement,
  DataElementIndexParameters,
  PageParameters,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { map, Observable, switchMap, throwError } from 'rxjs';
import { DataModelService } from '../mauro/data-model.service';
import { DataExplorerService } from './data-explorer.service';
import { PaginationService } from './pagination.service';
import {
  DataElementSearchParameters,
  DataElementSearchResult,
  DataElementSearchResultSet,
  mapSearchResult,
} from './data-explorer.types';

/**
 * Service to search for Data Elements, either by providing a listing or using full text search.
 */
@Injectable({
  providedIn: 'root',
})
export class DataElementSearchService {
  constructor(
    private dataModels: DataModelService,
    private dataExplorer: DataExplorerService,
    private pagination: PaginationService
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
    const [page, pageParams] = this.getPageParameters(params);
    const query: DataElementIndexParameters = {
      ...pageParams,
      sort: params.sort,
      order: params.order,
    };

    if (!params?.dataClass) {
      return throwError(() => new Error('Must provide a root Data Class.'));
    }

    return this.dataModels.getDataElements(params.dataClass, query).pipe(
      map((dataElements) => {
        return {
          totalResults: dataElements.count,
          pageSize: pageParams.max!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          page,
          items: dataElements.items.map(mapSearchResult),
        };
      })
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
      searchTerm: params.search,
      sort: params.sort,
      order: params.order,
      domainTypes: [CatalogueItemDomainType.DataElement],
      ...pageParams,
    };

    return this.dataExplorer.getRootDataModel().pipe(
      switchMap((dataModel) => {
        if (!dataModel.id) {
          return throwError(() => new Error('Root Data Model has no id.'));
        }

        return this.dataModels.searchDataModel(dataModel.id, query);
      }),
      map((dataElements) => {
        return {
          totalResults: dataElements.count,
          pageSize: pageParams.max!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          page,
          items: dataElements.items.map(mapSearchResult),
        };
      })
    );
  }

  getDataModelFromSearchResults(items: DataElementSearchResult[]): Uuid {
    // The result set *should* all be in the same model, and *should* all
    // have the model accessible. Try and get model from model property,
    // otherwise attempt to retrieve from breadcrumbs.
    let model: Uuid | null = null;
    let currentModel: Uuid | null = null;
    for (let i = 0; i < items.length; i++) {
      const item: DataElementSearchResult = items[i];
      currentModel = (item as unknown as DataElement).model as Uuid;
      if (!currentModel && item.breadcrumbs) {
        for (let b = 0; b < item.breadcrumbs.length; b++) {
          if (item.breadcrumbs[b].domainType === 'DataModel') {
            currentModel = item.breadcrumbs[b].id;
            break;
          }
        }
      }
      if (!currentModel) {
        throw new Error(`Data Element '${item.label}' has no model id`);
      } else if (model !== null && model !== currentModel) {
        throw new Error(
          `Data Elements are drawn from different models: ${model} and ${currentModel}`
        );
      }
      if (model == null) {
        model = currentModel;
      }
    }
    return currentModel!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
  }

  private getPageParameters(
    params: DataElementSearchParameters
  ): [number, PageParameters] {
    const page = params.page ?? 1;
    const pageParams = this.pagination.buildPageParameters(page, params.pageSize);
    return [page, pageParams];
  }
}
