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
import { DataClassDetail, DataModel } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  filter,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  OperatorFunction,
  switchMap,
  tap,
} from 'rxjs';
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
  SortOrder,
  DataElementSearchResult,
} from 'src/app/search/search.types';
import { SortByOption } from 'src/app/search/sort-by/sort-by.component';
import {
  CreateRequestComponent,
  NewRequestDialogResult,
} from 'src/app/shared/create-request/create-request.component';
import { ConfirmData } from 'src/app/shared/confirm/confirm.component';
import { ShowErrorData } from 'src/app/shared/mdm-show-error/mdm-show-error.component';
import { MdmShowErrorService } from 'src/app/core/mdm-show-error.service';
import { ConfirmService } from 'src/app/core/confirm-service';
import { UserDetails, UserDetailsService } from 'src/app/security/user-details.service';
import { CreateRequestEvent } from 'src/app/search/data-element-search-result/data-element-search-result.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { UserRequestsService } from 'src/app/core/user-requests.service';

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
  bookmarks: Bookmark[] = [];
  showLoadingWheel: boolean = false;
  private user: UserDetails | null;
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

  constructor(
    private route: ActivatedRoute,
    private dataElementsSearch: DataElementSearchService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    private bookmarkService: BookmarkService,
    private showErrorService: MdmShowErrorService,
    private confirmationService: ConfirmService,
    private theMatDialog: MatDialog,
    private userRequestsService: UserRequestsService,
    userDetailsService: UserDetailsService
  ) {
    this.user = userDetailsService.get();
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
    this.bookmarkService.index().subscribe((result) => {
      this.bookmarks = result;
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
      this.bookmarkService.add(event.item).subscribe(() => {
        this.toastr.success(`${event.item.label} added to bookmarks`);
      });
    } else {
      this.bookmarkService.remove(event.item).subscribe(() => {
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
    const dialogProps = new MatDialogConfig();
    dialogProps.height = 'fit-content';
    dialogProps.width = '343px';
    const dialogRef = this.theMatDialog.open(CreateRequestComponent, dialogProps);

    dialogRef
      .afterClosed()
      .pipe(this.createNewRequestOrBail(event.item))
      .subscribe({
        next: ([requestName, resultErrors]: [string, string[]]) => {
          if (resultErrors.length === 0) {
            this.showConfirmation(event, requestName);
          } else {
            this.showErrorDialog(event, requestName, resultErrors);
          }
        },
        complete: () => (this.showLoadingWheel = false),
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

  private showErrorDialog(
    event: CreateRequestEvent,
    requestName: string,
    resultErrors: string[]
  ) {
    let item = event.item;
    let menuTrigger = event.menuTrigger;
    let errorData: ShowErrorData = {
      heading: 'Request creation error',
      subheading: `The following error occurred while trying to add Data Element '${
        item!.label // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }' to new request '${requestName}'.`,
      message: resultErrors[0],
      buttonLabel: 'Continue searching',
    };
    const errorRef = this.showErrorService.open(errorData, 400);
    // Restore focus to item that was originally clicked on
    errorRef.afterClosed().subscribe(() => menuTrigger.focus());
  }

  private showConfirmation(event: CreateRequestEvent, requestName: string) {
    let item = event.item;
    let menuTrigger = event.menuTrigger;
    let confirmationData: ConfirmData = {
      heading: 'New request created',
      subheading: `Data Element added to new request: '${requestName}'`,
      content: [item!.label],
      buttonActionCaption: 'View Requests',
      buttonCloseCaption: 'Continue Browsing',
      buttonActionCallback: () => true, //This will ultimately open the "Browse Requests" page
    };
    const confirmationRef = this.confirmationService.open(confirmationData, 343);
    // Restore focus to item that was originally clicked on
    confirmationRef.afterClosed().subscribe(() => menuTrigger.focus());
  }

  private createNewRequestOrBail(
    item: DataElementSearchResult
  ): OperatorFunction<NewRequestDialogResult, [string, string[]]> {
    return (source: Observable<NewRequestDialogResult>) => {
      return source.pipe(
        //side-effect: show the loading wheel
        tap(() => (this.showLoadingWheel = true)),
        //if the user didn't enter a name or clicked cancel, then bail
        filter((result) => result.Name !== '' && this.user != null),
        //Do the doings
        mergeMap((result) => {
          const fakeSearchResult: DataElementSearchResultSet = {
            totalResults: 1,
            pageSize: 0,
            page: 0,
            items: new Array(item!), // eslint-disable-line @typescript-eslint/no-non-null-assertion
          };
          return this.userRequestsService.createNewUserRequestFromSearchResults(
            result.Name,
            result.Description,
            this.user!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            fakeSearchResult
          );
        }),
        //retain just the label, which is the only interesting bit (at the moment)
        map(([dataModel, errors]) => [dataModel.label, errors])
      );
    };
  }
}
