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
import { Component, Inject, OnInit } from '@angular/core';
import { DataClassDetail } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY } from 'rxjs';
import { DataModelService } from 'src/app/catalogue/data-model.service';
import { KnownRouterState, StateRouterService } from 'src/app/core/state-router.service';
import { DataElementSearchService } from 'src/app/search/data-element-search.service';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
  DataElementSearchParametersFn,
  SEARCH_QUERY_PARAMS,
  DataElementBookmarkEvent,
  DataElementCheckedEvent,
} from 'src/app/search/search.types';

export type SearchListingSource = 'unknown' | 'browse' | 'search';

export type SearchListingStatus = 'init' | 'loading' | 'ready' | 'error';

@Component({
  selector: 'mdm-search-listing',
  templateUrl: './search-listing.component.html',
  styleUrls: ['./search-listing.component.scss'],
})
export class SearchListingComponent implements OnInit {
  parameters: DataElementSearchParameters = {};
  source: SearchListingSource = 'unknown';
  status: SearchListingStatus = 'init';
  root?: DataClassDetail;
  searchTerms?: string;
  resultSet?: DataElementSearchResultSet;

  constructor(
    @Inject(SEARCH_QUERY_PARAMS) private getParameters: DataElementSearchParametersFn,
    private dataElementsSearch: DataElementSearchService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService
  ) {}

  get backUiSref(): KnownRouterState {
    return this.source === 'browse' ? 'app.container.browse' : 'app.container.search';
  }

  get backLabel() {
    return this.source === 'browse'
      ? 'Back to browsing compartments'
      : 'Back to search fields';
  }

  ngOnInit(): void {
    this.parameters = this.getParameters();
    this.searchTerms = this.parameters.search;

    // If there is a Data Class ID provided, then these parameters came from the "Browse" page,
    // listing Data Elements under a specific Data Class
    this.source = this.parameters.dataClass?.dataClassId ? 'browse' : 'search';

    this.loadDataClass();
    this.loadSearchResults();
  }

  updateSearch() {
    // Transition to same state but with different parameters
    // Cannot mix search terms with Data Class root, so this only triggers a catalogue wide search
    this.stateRouter.transitionTo('app.container.search-listing', {
      dm: null,
      dc: null,
      pdc: null,
      search: this.searchTerms,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectElement(event: DataElementCheckedEvent) {
    alert('TODO: selecting elements from SearchListingComponent');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bookmarkElement(event: DataElementBookmarkEvent) {
    alert('TODO: add/remove bookmarks from SearchListingComponent');
  }

  private loadDataClass() {
    if (this.source !== 'browse') {
      return;
    }

    if (!this.parameters.dataClass) {
      return;
    }

    this.dataModels
      .getDataClass(this.parameters.dataClass)
      .pipe(
        catchError(() => {
          this.toastr.error('Unable to retrieve the chosen Data Class.');
          return EMPTY;
        })
      )
      .subscribe((dataClass) => (this.root = dataClass));
  }

  private loadSearchResults() {
    if (this.source === 'unknown') {
      return;
    }

    const request$ =
      this.source === 'browse'
        ? this.dataElementsSearch.listing(this.parameters)
        : this.dataElementsSearch.search(this.parameters);

    this.status = 'loading';

    request$
      .pipe(
        catchError(() => {
          this.status = 'error';
          return EMPTY;
        })
      )
      .subscribe((resultSet) => {
        this.status = 'ready';
        this.resultSet = resultSet;
      });
  }
}
