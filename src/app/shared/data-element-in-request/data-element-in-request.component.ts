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
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { DataModel, DataModelSubsetPayload } from '@maurodatamapper/mdm-resources';
import { finalize, Observable, of, Subject, takeUntil } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import {
  DataElementInstance,
  DataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import { UserDetails } from 'src/app/security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { RequestUpdatedData } from 'src/app/data-explorer/request-updated-dialog/request-updated-dialog.component';

export interface CreateRequestEvent {
  item: DataElementSearchResult;
}

export interface RequestElementAddDeleteEvent {
  adding: boolean;
  dataModel: DataModel;
  dataElement: DataElementInstance;
}

export interface DataAccessRequestMenuItem {
  dataModel: DataModel;
  containsElement: boolean;
}
@Component({
  selector: 'mdm-data-element-in-request',
  templateUrl: './data-element-in-request.component.html',
  styleUrls: ['./data-element-in-request.component.scss'],
})
export class DataElementInRequestComponent implements OnInit, OnDestroy {
  @Input() dataElement?: DataElementSearchResult;
  @Input() caption = 'Add to request';

  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
  @Input() suppressViewRequestsDialogButton = false;

  @Output() createRequestClicked = new EventEmitter<CreateRequestEvent>();
  @Output() requestAddDelete = new EventEmitter<RequestElementAddDeleteEvent>();

  ready = false;

  // The list of items in the createRequest menu
  dataRequestMenuItems: DataAccessRequestMenuItem[] = [];

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

    this.subscribeIntersectionsRefreshed();
    this.refreshDataRequestMenuItems();

    this.ready = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Do a subset operation to add or remove this data element from the
   * request data model (target data model) whose ID is specified in event.source.value
   *
   * @param event
   */
  changed(event: MatCheckboxChange, item: DataModel) {
    if (this.dataElement) {
      const targetDataModelId = event.source.value;
      const datamodelSubsetPayload: DataModelSubsetPayload = {
        additions: [],
        deletions: [],
      };
      if (event.checked) {
        // Do a subset add for this data element in the request
        datamodelSubsetPayload.additions = [this.dataElement.id];
      } else {
        // Do a subset remove for this data element in the request
        datamodelSubsetPayload.deletions = [this.dataElement.id];
      }

      this.broadcast.loading({ isLoading: true, caption: 'Updating your request...' });

      this.endpoints.dataModel
        .copySubset(this.dataElement.model, targetDataModelId, datamodelSubsetPayload)
        .pipe(
          finalize(() => {
            this.broadcast.loading({ isLoading: false });
          })
        )
        .subscribe(() => {
          // Communicate change to the outside world
          if (this.dataElement) {
            const addDeleteEventData: RequestElementAddDeleteEvent = {
              adding: event.checked,
              dataElement: this.dataElement,
              dataModel: item,
            };
            this.requestAddDelete.emit(addDeleteEventData);
          }

          const de: DataElementInstance = {
            id: this.dataElement?.id ?? '',
            model: this.dataElement?.model ?? '',
            dataClass: this.dataElement?.dataClass ?? '',
            label: this.dataElement?.label ?? '',
            isBookmarked: this.dataElement?.isBookmarked ?? false,
          };

          const requestUpdatedData: RequestUpdatedData = {
            request: item,
            addedElements: event.checked ? [de] : [],
            removedElements: !event.checked ? [de] : [],
          };
          return this.dialogs
            .openRequestUpdated(requestUpdatedData)
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
   * Refresh the addToRequest menu items
   */
  refreshDataRequestMenuItems(): void {
    if (!this.dataElement) return;

    const idsOfRequestsContainingElement =
      this.sourceTargetIntersections.sourceTargetIntersections
        .filter((sti) => sti.intersects.includes(this.dataElement!.id)) // eslint-disable-line @typescript-eslint/no-non-null-assertion
        .map((sti) => sti.targetDataModelId);

    this.dataRequestMenuItems = this.sourceTargetIntersections.dataAccessRequests.map(
      (req) => {
        return {
          dataModel: req,
          containsElement: idsOfRequestsContainingElement.includes(req.id ?? ''),
        };
      }
    );
  }

  onClickCreateRequest() {
    if (!this.dataElement) return;

    const event: CreateRequestEvent = {
      item: this.dataElement, // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };
    this.createRequest(event);
  }

  createRequest(event: CreateRequestEvent) {
    if (!this.user) {
      this.toastr.error('You must be signed in in order to create data requests.');
      return;
    }

    const getDataElements = (): Observable<DataElementInstance[]> => {
      return of([event.item]);
    };

    this.dataRequests
      .createWithDialogs(getDataElements, this.suppressViewRequestsDialogButton)
      .subscribe((action) => {
        if (action === 'view-requests') {
          this.stateRouter.navigateToKnownPath('/requests');
        }
        this.createRequestClicked.emit(event);
      });
  }

  /**
   * When intersections are refreshed (which happens after a data request has been added by another row) make a note for this row
   */
  private subscribeIntersectionsRefreshed(): void {
    this.broadcast
      .on('data-intersections-refreshed')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((intersections) => {
        this.sourceTargetIntersections = intersections;
        this.refreshDataRequestMenuItems();
      });
  }
}
