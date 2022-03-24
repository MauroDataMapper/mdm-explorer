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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataClassDetail } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, forkJoin, of, switchMap } from 'rxjs';
import { Bookmark, BookmarkService } from 'src/app/core/bookmark.service';
import { DataModelService } from 'src/app/catalogue/data-model.service';
import { KnownRouterPath, StateRouterService } from 'src/app/core/state-router.service';
import { DataElementSearchService } from 'src/app/search/data-element-search.service';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
  DataElementBookmarkEvent,
  DataElementCheckedEvent,
  mapParamMapToSearchParameters,
  mapSearchParametersToParams,
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
    private route: ActivatedRoute,
    private dataElementsSearch: DataElementSearchService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    private bookmarkService: BookmarkService
  ) {}

  get backRouterLink(): KnownRouterPath {
    return this.source === 'browse' ? '/browse' : '/search';
  }

  get backLabel() {
    return this.source === 'browse'
      ? 'Back to browsing compartments'
      : 'Back to search fields';
  }

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((query) => {
          this.parameters = mapParamMapToSearchParameters(query);
          this.searchTerms = this.parameters.search;

          // If there is a Data Class ID provided, then these parameters came from the "Browse" page,
          // listing Data Elements under a specific Data Class
          this.source = this.parameters.dataClass?.dataClassId ? 'browse' : 'search';

          this.status = 'loading';

          return forkJoin([this.loadDataClass(), this.loadSearchResults()]);
        })
      )
      .subscribe(([dataClass, resultSet]) => {
        this.status = 'ready';
        this.root = dataClass;
        this.resultSet = resultSet;
      });
  }

  updateSearch() {
    // Transition to same state but with different parameters
    // Cannot mix search terms with Data Class root, so this only triggers a catalogue wide search
    this.stateRouter.navigateToKnownPath('/search/listing', {
      search: this.searchTerms,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  selectElement(event: DataElementCheckedEvent) {
    alert('TODO: selecting elements from SearchListingComponent');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  bookmarkElement(event: DataElementBookmarkEvent) {
    const bookmark: Bookmark = {
      id: event.item.id,
      label: event.item.label,
    };

    if (event.selected) {
      this.bookmarkService.add(bookmark).subscribe(() => {
        this.toastr.success(`${event.item.label} added to bookmarks`);
      });
    } else {
      this.bookmarkService.remove(bookmark).subscribe(() => {
        this.toastr.success(`${event.item.label} removed from bookmarks`);
      });
    }
  }

  selectPage(page: number) {
    const next: DataElementSearchParameters = {
      ...this.parameters,
      page,
    };

    const params = mapSearchParametersToParams(next);
    this.stateRouter.navigateToKnownPath('/search/listing', params);
  }

  private loadDataClass() {
    if (this.source !== 'browse') {
      return of(undefined);
    }

    if (!this.parameters.dataClass) {
      return of(undefined);
    }

    return this.dataModels.getDataClass(this.parameters.dataClass).pipe(
      catchError(() => {
        this.toastr.error('Unable to retrieve the chosen Data Class.');
        return EMPTY;
      })
    );
  }

  private loadSearchResults() {
    if (this.source === 'unknown') {
      return of(undefined);
    }

    const request$ =
      this.source === 'browse'
        ? this.dataElementsSearch.listing(this.parameters)
        : this.dataElementsSearch.search(this.parameters);

    return request$.pipe(
      catchError(() => {
        this.status = 'error';
        return EMPTY;
      })
    );
  }
}
