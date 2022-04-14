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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DataModel, DataModelSubsetPayload } from '@maurodatamapper/mdm-resources';
import { EMPTY, filter, finalize, forkJoin, switchMap } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { SecurityService } from 'src/app/security/security.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { DataElementSearchResult } from 'src/app/data-explorer/data-explorer.types';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from 'src/app/core/broadcast.service';

export interface CreateRequestEvent {
  item: DataElementSearchResult;
}

@Component({
  selector: 'mdm-data-element-in-request',
  templateUrl: './data-element-in-request.component.html',
  styleUrls: ['./data-element-in-request.component.scss'],
})
export class DataElementInRequestComponent implements OnInit {
  @Input() dataElement?: DataElementSearchResult;

  @Output() createRequestClicked = new EventEmitter<CreateRequestEvent>();

  dataAccessRequests: DataModel[] = [];

  creatingRequest = false;

  ready = false;

  // A list of requests to which this data element belongs
  inRequests: Uuid[] = [];

  private user: UserDetails | null;

  constructor(
    security: SecurityService,
    private stateRouter: StateRouterService,
    private dataModels: DataModelService,
    private dataRequests: DataRequestsService,
    private endpoints: MdmEndpointsService,
    private dialogs: DialogService,
    private toastr: ToastrService,
    private broadcast: BroadcastService
  ) {
    this.user = security.getSignedInUser();
  }

  ngOnInit(): void {
    // const user = this.security.getSignedInUser();
    if (this.user === null) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }

    const checkedTargetDataModelIds: Uuid[] = [];

    /**
     * Get all the data access requests.
     * For each request, use the intersects method to check whether this data element is in the request.
     * This is slow and it would benefit from an endpoint which returns a list of data models containing this
     * data element.
     */
    this.dataRequests
      .list(this.user.email)
      .pipe(
        switchMap((dataModels: DataModel[]) => {
          this.dataAccessRequests = [...dataModels];

          const checks: any[] = [];

          this.dataAccessRequests.forEach((item: DataModel) => {
            if (this.dataElement && item.id) {
              checks.push(this.checkIntersection(this.dataElement.dataModelId, item.id));
              checkedTargetDataModelIds.push(item.id);
            }
          });

          return forkJoin(checks);
        })
      )
      .subscribe((intersectionsForEachTargetDataModel) => {
        for (let i = 0; i < checkedTargetDataModelIds.length; i++) {
          const mySourceDataModelId = checkedTargetDataModelIds[i];
          const intersections = intersectionsForEachTargetDataModel[i];

          if (
            this.dataElement &&
            intersections.intersects.indexOf(this.dataElement.id) > -1
          ) {
            this.inRequests.push(mySourceDataModelId);
          }
          this.ready = true;
        }
      });
  }

  checkIntersection(sourceDataModelId: Uuid, targetDataModelId: Uuid) {
    return this.dataModels.getIntersection(sourceDataModelId, targetDataModelId).pipe();
  }

  /**
   * Do a subset operation to add or remove this data element from the
   * request data model (target data model) whose ID is specified in event.source.value
   *
   * @param event
   */
  changed(event: MatCheckboxChange) {
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
        .subscribe(() => {}); // eslint-disable-line @typescript-eslint/no-unsafe-argument
    }
  }

  /**
   * Is this data element present in the targetDataModel?
   *
   * @param targetDataModel
   * @returns boolean
   */
  isInRequests(targetDataModel: DataModel): boolean {
    return this.inRequests.indexOf(targetDataModel.id ?? '') > -1;
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

          this.broadcast.dispatch('data-request-added');

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
}
