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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DataModel, DataModelSubsetPayload } from '@maurodatamapper/mdm-resources';
import { EMPTY, filter, finalize, Observable, of, Subject, switchMap } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import {
  DataElementInstance,
  DataElementSearchResult,
  RemoveBookmarkEvent,
} from 'src/app/data-explorer/data-explorer.types';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataModelService } from 'src/app/mauro/data-model.service';

export interface CreateRequestEvent {
  item: DataElementSearchResult;
}

@Component({
  selector: 'mdm-data-element-multi-select',
  templateUrl: './data-element-multi-select.component.html',
  styleUrls: ['./data-element-multi-select.component.scss'],
})
export class DataElementMultiSelectComponent implements OnInit, OnDestroy {
  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  @Input() dataElements: DataElementSearchResult[] = [];

  @Input() showRemoveFromBookmarks = false;
  @Input() suppressViewRequestsDialogButton = false;

  @Output() createRequestClicked = new EventEmitter<CreateRequestEvent>();

  @Output() remove = new EventEmitter<RemoveBookmarkEvent>();

  ready = false;

  private user: UserDetails | null;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    security: SecurityService,
    private stateRouter: StateRouterService,
    private dataRequests: DataRequestsService,
    private dataModels: DataModelService,
    private dialogs: DialogService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    private bookmarks: BookmarkService
  ) {
    this.user = security.getSignedInUser();
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    if (this.user === null) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }

    this.ready = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onClickCreateRequest() {
    if (this.dataElements.length === 0) return;

    this.createRequest(this.dataElements);
  }

  createRequest(dataElements: DataElementSearchResult[]) {
    if (!this.user) {
      this.toastr.error('You must be signed-in in order to create data requests.');
      return;
    }

    const getDataElements = (): Observable<DataElementInstance[]> => {
      return of(dataElements);
    };

    this.dataRequests
      .createWithDialogs(getDataElements, this.suppressViewRequestsDialogButton)
      .subscribe((action) => {
        if (action === 'view-requests') {
          this.stateRouter.navigateToKnownPath('/requests');
        }
      });
  }

  /**
   * Add a set of selected data elements to a request
   *
   * @param item The DataModel representing the request
   */
  onClickAddSelectedToRequest(item: DataModel) {
    // If there are any selected data elements then they should all be from the same source data model.
    // So pick the first and use that
    const sourceDataModelId =
      this.dataElements.length > 0 ? this.dataElements[0].model : null;

    // The target data model (aka request)
    const targetDataModelId = item.id;

    // A payload for subsetting. We only handle additions here, not deletions.
    const datamodelSubsetPayload: DataModelSubsetPayload = {
      additions: this.dataElements.map((de) => de.id),
      deletions: [],
    };

    if (
      sourceDataModelId &&
      targetDataModelId &&
      datamodelSubsetPayload.additions.length > 0
    ) {
      this.broadcast.loading({ isLoading: true, caption: 'Updating your request...' });

      this.dataModels
        .copySubset(sourceDataModelId, targetDataModelId, datamodelSubsetPayload)
        .pipe(finalize(() => this.broadcast.loading({ isLoading: false })))
        .subscribe(() => {
          // Really this is an update rather than add, but broadcasting data-request-added has the effect we want
          // i.e. forcing intersections to be refreshed
          this.broadcast.dispatch('data-request-added');

          return this.dialogs
            .openRequestUpdated({
              request: item,
              addedElements: this.dataElements,
            })
            .afterClosed()
            .subscribe((action) => {
              if (action === 'view-requests') {
                this.stateRouter.navigateToKnownPath('/requests');
              }
            });
        }); // eslint-disable-line @typescript-eslint/no-unsafe-argument
    }
  }

  /**
   * Remove the set of selected data elements from bookmarks
   *
   */
  onClickRemoveSelectedFromBookmarks() {
    this.dialogs
      .openConfirmation({
        title: 'Remove bookmarks',
        message: 'Are you sure you want to remove the selected bookmarks?',
        okBtnTitle: 'Yes',
        cancelBtnTitle: 'No',
      })
      .afterClosed()
      .pipe(
        filter((response) => response?.status === 'ok'),
        switchMap(() => {
          const bookmarks = this.dataElements;
          if (bookmarks.length > 0) {
            return this.bookmarks.remove(bookmarks);
          }

          return EMPTY;
        })
      )
      .subscribe(() => {
        this.broadcast.dispatch('data-bookmarks-refreshed');
      });
  }
}
