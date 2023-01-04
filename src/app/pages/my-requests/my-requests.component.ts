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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  finalize,
  forkJoin,
  of,
  switchMap,
  throwError,
  filter,
} from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import {
  DataElementSearchResult,
  DataRequest,
  DataRequestStatus,
  mapToDataRequest,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss'],
})
export class MyRequestsComponent implements OnInit {
  allRequests: DataRequest[] = [];
  filteredRequests: DataRequest[] = [];
  statusFilters: DataRequestStatus[] = [];
  request?: DataRequest;
  requestElements: DataElementSearchResult[] = [];
  state: 'idle' | 'loading' = 'idle';
  creatingNextVersion = false;

  constructor(
    private security: SecurityService,
    private dataRequests: DataRequestsService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private dialogs: DialogService,
    private broadcast: BroadcastService
  ) {}

  get hasMultipleRequestStatus() {
    const statuses = this.allRequests.map((req) => req.status);
    const distinct = new Set(statuses);
    return distinct.size > 1;
  }

  ngOnInit(): void {
    this.initialiseRequests();
  }

  filterByStatus(event: MatCheckboxChange) {
    const status = event.source.value as DataRequestStatus;
    if (event.checked) {
      this.statusFilters = [...this.statusFilters, status];
    } else {
      this.statusFilters = this.statusFilters.filter((s) => s !== status);
    }

    this.filterRequests();
  }

  refreshRequests() {
    this.initialiseRequests();
  }

  initialiseRequests() {
    this.getUserRequests().subscribe((requests) => {
      this.allRequests = requests;
      this.filterRequests();
    });
  }

  private getUserRequests() {
    const user = this.security.getSignedInUser();
    if (!user) {
      return throwError(() => new Error('Cannot find user'));
    }

    return this.dataRequests.list().pipe(
      catchError(() => {
        this.toastr.error('There was a problem finding your requests.');
        return EMPTY;
      })
    );
  }

  private filterRequests() {
    this.filteredRequests =
      this.statusFilters.length === 0
        ? this.allRequests
        : this.allRequests.filter((req) => this.statusFilters.includes(req.status));
  }
  copyRequest() {
    if (
      !this.request ||
      !this.request.id ||
      !this.request.modelVersion ||
      this.request.status !== 'submitted'
    ) {
      return;
    }

    this.dialogs
      .openCreateRequest({ showDescription: false })
      .afterClosed()
      .pipe(
        filter((response) => !!response),
        switchMap((response) => {
          if (!response || !this.request) return EMPTY;

          this.broadcast.loading({
            isLoading: true,
            caption: 'Creating new request ...',
          });

          return this.dataModels.createFork(this.request, { label: response.name });
        }),
        catchError(() => {
          this.toastr.error(
            'There was a problem creating your request. Please try again or contact us for support.',
            'Creation error'
          );
          return EMPTY;
        }),
        switchMap((nextDraftModel) => {
          return forkJoin([of(nextDraftModel), this.getUserRequests()]);
        }),
        finalize(() => this.broadcast.loading({ isLoading: false }))
      )
      .subscribe(([nextDraftModel, allRequests]) => {
        const nextDataRequest = mapToDataRequest(nextDraftModel);

        this.allRequests = allRequests;
        this.filterRequests();

        this.dialogs.openSuccess({
          heading: 'Request created',
          message: `Your new request "${nextDataRequest.label}" has been successfully created. Modify this request by searching or browsing our catalogue before submitting again.`,
        });
      });
  }
}
