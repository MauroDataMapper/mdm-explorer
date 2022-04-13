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
import { catchError, EMPTY, filter, finalize, forkJoin, of, switchMap } from 'rxjs';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { KnownRouterPath, StateRouterService } from 'src/app/core/state-router.service';
import { DataElementSearchService } from 'src/app/data-explorer/data-element-search.service';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
  mapParamMapToSearchParameters,
  mapSearchParametersToParams,
  mapToDataRequest,
  SortOrder,
} from 'src/app/data-explorer/data-explorer.types';
import {
  DataElementBookmarkEvent,
  DataElementCheckedEvent,
} from 'src/app/data-explorer/data-explorer.types';
import { UserDetails } from 'src/app/security/user-details.service';
import { Bookmark, BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { CreateRequestEvent } from 'src/app/data-explorer/data-element-search-result/data-element-search-result.component';
import { SortByOption } from 'src/app/data-explorer/sort-by/sort-by.component';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { SecurityService } from 'src/app/security/security.service';
import { BroadcastService } from 'src/app/core/broadcast.service';

export type SearchListingSource = 'unknown' | 'browse' | 'search';
export type SearchListingStatus = 'init' | 'loading' | 'ready' | 'error';

/**
 * These options must be of the form '{propertyToSortBy}-{order}' where propertyToSortBy
 * can be any property on the objects you are sorting and order must be of type
 * {@link SortOrder }
 */
export type SearchListingSortByOption = 'label-asc' | 'label-desc';

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
  userBookmarks: Bookmark[] = [];
  creatingRequest = false;
  sortBy?: SortByOption;
  /**
   * Each new option must have a {@link SearchListingSortByOption} as a value to ensure
   * the search-listing page can interpret the result emitted by the SortByComponent
   */
  searchListingSortByOptions: SortByOption[] = [
    { value: 'label-asc', displayName: 'Label (a-z)' },
    { value: 'label-desc', displayName: 'Label (z-a)' },
  ];
  sortByDefaultOption: SortByOption = this.searchListingSortByOptions[0];
  private user: UserDetails | null;

  constructor(
    private route: ActivatedRoute,
    private dataElementsSearch: DataElementSearchService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    private bookmarks: BookmarkService,
    private dialogs: DialogService,
    private dataRequests: DataRequestsService,
    security: SecurityService,
    private broadcast: BroadcastService
  ) {
    this.user = security.getSignedInUser();
  }

  get backRouterLink(): KnownRouterPath {
    return this.source === 'browse' ? '/browse' : '/search';
  }

  get backLabel() {
    return this.source === 'browse'
      ? 'Back to browsing compartments'
      : 'Back to search fields';
  }

  ngOnInit(): void {
    this.bookmarks.index().subscribe((result) => {
      this.userBookmarks = result;
    });

    this.route.queryParamMap
      .pipe(
        switchMap((query) => {
          this.parameters = mapParamMapToSearchParameters(query);
          this.searchTerms = this.parameters.search;

          // Set sortBy from route val, or set to default value.
          this.sortBy = this.setSortByFromRouteOrAsDefault(
            this.parameters.sort,
            this.parameters.order
          );

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

  bookmarkElement(event: DataElementBookmarkEvent) {
    if (event.selected) {
      this.bookmarks.add(event.item).subscribe(() => {
        this.toastr.success(`${event.item.label} added to bookmarks`);
      });
    } else {
      this.bookmarks.remove(event.item).subscribe(() => {
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

  selectSortBy(selected: SortByOption) {
    const sortBy = selected.value as SearchListingSortByOption;
    const sort = this.getSortFromSortByOptionString(sortBy);
    const order = this.getOrderFromSortByOptionString(sortBy);
    const next: DataElementSearchParameters = {
      ...this.parameters,
      sort,
      order,
    };

    const params = mapSearchParametersToParams(next);
    this.stateRouter.navigateToKnownPath('/search/listing', params);
  }

  createRequest(event: CreateRequestEvent) {
    this.dialogs
      .openCreateRequest()
      .afterClosed()
      .pipe(
        filter((response) => !!response),
        switchMap((response) => {
          if (!response || !this.user) {
            return EMPTY;
          }

          this.creatingRequest = true;
          return this.dataRequests.createFromSearchResults(
            response.name,
            response.description,
            this.user,
            [event.item]
          );
        }),
        switchMap(([dataRequest, errors]) => {
          if (errors.length > 0) {
            this.toastr.error(
              `There was a problem creating your request. ${errors[0]}`,
              'Request creation error'
            );
            return EMPTY;
          }

          this.broadcast.dataRequestChanged({
            request: mapToDataRequest(dataRequest),
            change: 'created',
          });

          return this.dialogs
            .openRequestCreated({
              request: dataRequest,
              addedElements: [event.item],
            })
            .afterClosed();
        }),
        finalize(() => (this.creatingRequest = false))
      )
      .subscribe((action) => {
        if (action === 'view-requests') {
          this.stateRouter.navigateToKnownPath('/requests');
        }
      });
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

  /**
   * Match route params sort and order to sortBy option or return the default value if not set.
   *
   * @param sort the route string value for which property is being sorted on.
   * @param order the order in which to sort that propery
   * @returns a SortByOption object with value matching the route string sortBy value or the default sortBy option.
   */
  private setSortByFromRouteOrAsDefault(
    sort: string | undefined,
    order: string | undefined
  ): SortByOption {
    if (!sort || !order) {
      return this.sortByDefaultOption;
    }
    const valueString = `${sort}-${order}`;

    const filteredOptionsList = this.searchListingSortByOptions.filter(
      (item: SortByOption) => item.value === valueString
    );

    return filteredOptionsList.length === 0
      ? this.sortByDefaultOption
      : filteredOptionsList[0];
  }

  private getSortFromSortByOptionString(sortBy: string) {
    return sortBy.split('-')[0];
  }

  private getOrderFromSortByOptionString(sortBy: string) {
    return sortBy.split('-')[1] as SortOrder;
  }
}
