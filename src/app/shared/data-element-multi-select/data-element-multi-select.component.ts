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
import { catchError, EMPTY, filter, finalize, Subject, switchMap } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import {
  DataElementSearchResult,
  SelectableDataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from 'src/app/core/broadcast.service';

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

  @Input() dataElements: SelectableDataElementSearchResult[] = [];

  @Output() createRequestClicked = new EventEmitter<CreateRequestEvent>();

  creatingRequest = false;

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
    private endpoints: MdmEndpointsService,
    private dialogs: DialogService,
    private toastr: ToastrService,
    private broadcast: BroadcastService
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
    if (this.dataElements && this.dataElements.length > 0) {
      this.createRequest(this.dataElements);
    }
  }

  createRequest(dataElements: SelectableDataElementSearchResult[]) {
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
          return this.dataRequests.createFromDataElements(
            dataElements,
            this.user,
            response.name,
            response.description
          );
        }),
        catchError((error) => {
          this.toastr.error(
            `There was a problem creating your request. ${error}`,
            'Request creation error'
          );
          return EMPTY;
        }),
        switchMap((dataRequest) => {
          this.broadcast.dispatch('data-request-added');

          return this.dialogs
            .openRequestCreated({
              request: dataRequest,
              addedElements: dataElements,
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

  /**
   * Add a set of selected data elements to a request
   *
   * @param item The DataModel representing the request
   */
  onClickAddSelectedToRequest(item: DataModel) {
    // If there are any selected data elements then they should all be from the same source data model.
    // So pick the first and use that
    const sourceDataModelId =
      this.dataElements.length > 0 ? this.dataElements[0].dataModelId : null;

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
      this.endpoints.dataModel
        .copySubset(sourceDataModelId, targetDataModelId, datamodelSubsetPayload)
        .subscribe(() => {
          // Really this is an update rather than add, but broadcasting data-request-added has the effect we want
          // i.e. forcing intersections to be refreshed
          this.broadcast.dispatch('data-request-added');

          return this.dialogs
            .openRequestUpdated({
              request: item,
              addedElements: this.dataElements,
            })
            .afterClosed();
        }); // eslint-disable-line @typescript-eslint/no-unsafe-argument
    }
  }
}
