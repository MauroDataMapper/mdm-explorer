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
import { DataModelSubsetPayload } from '@maurodatamapper/mdm-resources';
import { catchError, EMPTY, filter, finalize, Subject, switchMap, takeUntil } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { SecurityService } from 'src/app/security/security.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import {
  DataElementBasic,
  DataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from 'src/app/core/broadcast.service';

export interface CreateRequestEvent {
  item: DataElementSearchResult;
}

export interface RequestElementAddDeleteEvent {
  adding: boolean;
  dataModel: DataAccessRequestMenuItem;
  dataElement: DataElementBasic;
}

interface DataAccessRequestMenuItem {
  id: Uuid;
  label: string;
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

    this.refreshDataRequestMenuItems();

    this.subscribeIntersectionsRefreshed();

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
  changed(event: MatCheckboxChange, item: DataAccessRequestMenuItem) {
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

      this.endpoints.dataModel
        .copySubset(
          this.dataElement.dataModelId,
          targetDataModelId,
          datamodelSubsetPayload
        )
        .subscribe(() => {
          this.toastr.success(
            `${this.dataElement?.label} ${
              event.checked ? 'added to' : 'removed from'
            } request`
          );
          // Communicate change to the outside world
          if (this.dataElement) {
            const addDeleteEventData: RequestElementAddDeleteEvent = {
              adding: event.checked,
              dataElement: this.dataElement,
              dataModel: item,
            };
            this.requestAddDelete.emit(addDeleteEventData);
          }
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
          id: req.id ?? '',
          label: req.label,
          containsElement: idsOfRequestsContainingElement.includes(req.id ?? ''),
        };
      }
    );
  }

  onClickCreateRequest() {
    if (this.dataElement) {
      const event: CreateRequestEvent = {
        item: this.dataElement, // eslint-disable-line @typescript-eslint/no-non-null-assertion
      };
      this.createRequest(event);
    }
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

          this.broadcast.loading({
            isLoading: true,
            caption: 'Creating new request ...',
          });

          return this.dataRequests.createFromDataElements(
            [event.item],
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
              addedElements: [event.item],
            })
            .afterClosed();
        }),
        finalize(() => {
          this.broadcast.loading({ isLoading: false });
          this.createRequestClicked.emit(event);
        })
      )
      .subscribe((action) => {
        if (action === 'view-requests') {
          this.stateRouter.navigateToKnownPath('/requests');
        }
      });
  }

  /**
   * When intersections are refreshed (which happens after a data request has been added) recache this.inRequests
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
