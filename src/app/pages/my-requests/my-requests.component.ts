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
import { HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { DataModelDetail } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, from, forkJoin, of, switchMap, throwError } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import {
  DataElementDeleteEvent,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  DataRequest,
  DataRequestStatus,
  mapToDataRequest,
  SelectableDataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import {
  OkCancelDialogData,
  OkCancelDialogResponse,
} from 'src/app/data-explorer/ok-cancel-dialog/ok-cancel-dialog.component';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { SecurityService } from 'src/app/security/security.service';
import { resourceLimits } from 'worker_threads';

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
  requestElements: SelectableDataElementSearchResult[] = [];
  state: 'idle' | 'loading' = 'idle';
  showSpinner = false;
  spinnerCaption = '';
  creatingNextVersion = false;

  constructor(
    private security: SecurityService,
    private dataRequests: DataRequestsService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private researchPlugin: ResearchPluginService,
    private dialogs: DialogService,
    private broadcast: BroadcastService
  ) {}

  get hasMultipleRequestStatus() {
    const statuses = this.allRequests.map((req) => req.status);
    const distinct = new Set(statuses);
    return distinct.size > 1;
  }

  ngOnInit(): void {
    this.state = 'loading';

    this.getUserRequests()
      .pipe(finalize(() => (this.state = 'idle')))
      .subscribe((requests) => {
        this.allRequests = requests;
        this.filterRequests();
        this.setRequest(
          this.filteredRequests.length > 0 ? this.filteredRequests[0] : undefined
        );
      });
  }

  selectRequest(event: MatSelectionListChange) {
    const selected = event.options[0].value as DataRequest;
    this.setRequest(selected);
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

  submitRequest() {
    if (!this.request || !this.request.id || this.request.status !== 'unsent') {
      return;
    }

    this.broadcast.loading({ isLoading: true, caption: 'Submitting your request...' });

    this.showSpinner = true;
    this.spinnerCaption = 'Submitting your request ...';
    this.researchPlugin
      .submitRequest(this.request.id)
      .pipe(
        catchError(() => {
          this.toastr.error(
            'There was a problem submitting your request. Please try again or contact us for support.',
            'Submission error'
          );
          return EMPTY;
        }),
        finalize(() => this.broadcast.loading({ isLoading: false }))
      )
      .subscribe((dataModel) => {
        // Refresh the current state of the request in view
        this.request = mapToDataRequest(dataModel);
        this.broadcast.dispatch('data-request-submitted');
        this.updateRequestList(this.request);

        this.dialogs.openSuccess({
          heading: 'Request submitted',
          message: `Your request "${this.request.label}" has been successfully submitted. It will now be reviewed and you will be contacted shortly to discuss further steps.`,
        });
      });
  }

  createNextVersion() {
    if (
      !this.request ||
      !this.request.id ||
      !this.request.modelVersion ||
      this.request.status !== 'submitted'
    ) {
      return;
    }

    this.broadcast.loading({
      isLoading: true,
      caption: 'Creating next version of your request...',
    });

    this.dataModels
      .createNextVersion(this.request)
      .pipe(
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
        this.setRequest(mapToDataRequest(nextDraftModel));

        this.dialogs.openSuccess({
          heading: 'Request created',
          message: `Your new request "${nextDataRequest.label}" has been successfully created. Modify this request by searching or browsing our catalogue before submitting again.`,
        });
      });
  }

  private getUserRequests() {
    const user = this.security.getSignedInUser();
    if (!user) {
      return throwError(() => new Error('Cannot find user'));
    }

    return this.dataRequests.list(user.email).pipe(
      catchError(() => {
        this.toastr.error('There was a problem finding your requests.');
        return EMPTY;
      }),
      finalize(() => (this.state = 'idle'))
    );
  }


  removeSelected() {
    const itemList = this.requestElements.filter((item) => item.isSelected);
    this.okCancelItemList(itemList)
      .afterClosed()
      .pipe(
        switchMap((result: OkCancelDialogResponse) => {
          if (result.result) {
            this.showSpinner = true;
            this.spinnerCaption = `Removing ${itemList.length} data element${
              itemList.length === 1 ? '' : 's'
            } from request ${this.request?.label} ...`;
            return this.dataRequests.deleteDataElementMultiple(itemList);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe((result: DataElementMultipleOperationResult) => {
        const success = result.failures.length === 0;
        let message = `${result.successes.length} Data element${
          result.successes.length === 1 ? '' : 's'
        } removed from request "${this.request?.label}".`;
        if (!success) {
          message += `\r\n${result.failures.length} Data element${
            result.failures.length === 1 ? '' : 's'
          } caused an error.`;
          result.failures.forEach((item: DataElementOperationResult) =>
            console.log(item.message)
          );
        }
        this.processRemoveDataElementResponse(success, message);
        this.showSpinner = false;
      });
  }

  removeItem(event: DataElementDeleteEvent) {
    const item = event.item;
    this.okCancelItem(item)
      .afterClosed()
      .pipe(
        switchMap((result: OkCancelDialogResponse) => {
          if (result.result) {
            this.showSpinner = true;
            this.spinnerCaption = `Removing data element ${item.label} from request ${this.request?.label} ...`;
            return this.dataRequests.deleteDataElement(item);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe((result: DataElementOperationResult) => {
        let message: string = '';
        if (!result.success) {
          message = `Removal of data element ${item.label} failed. The error message is: ${result.message}`;
        } else {
          message = `Data element "${item.label}" removed from request "${this.request?.label}".`;
        }
        this.processRemoveDataElementResponse(result.success, message);
        this.showSpinner = false;
      });
  }

  removeSelectedButtonDisabled(): boolean {
    const selectedItemList = this.requestElements.filter((item) => item.isSelected);
    return !this.request || !this.requestElements || selectedItemList.length === 0;
  }

  onSelectAll(event: MatCheckboxChange) {
    if (this.requestElements) {
      this.requestElements = this.requestElements.map((item) => {
        return { ...item, isSelected: event.checked };
      });
    }
  }

  private processRemoveDataElementResponse(result: boolean, message: string) {
    if (result === false) {
      this.toastr.error(message, 'Data element removal');
      console.log(message);
    } else {
      this.toastr.success(message, 'Data element removal');
    }
    this.setRequest(this.request);
  }

  private okCancelItemList(
    itemList: SelectableDataElementSearchResult[]
  ): MatDialogRef<OkCancelDialogData> {
    return this.dialogs.openOkCancel({
      heading: 'Delete selected data elements',
      content: `Are you sure you want to delete these ${itemList.length} selected data elements from request ${this.request?.label}?`,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }

  private okCancelItem(
    item: SelectableDataElementSearchResult
  ): MatDialogRef<OkCancelDialogData> {
    return this.dialogs.openOkCancel({
      heading: 'Delete data element',
      content: `Are you sure you want to delete data element "${item.label}" from request "${this.request?.label}"?`,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }

  private filterRequests() {
    this.filteredRequests =
      this.statusFilters.length === 0
        ? this.allRequests
        : this.allRequests.filter((req) => this.statusFilters.includes(req.status));
  }

  private setRequest(request?: DataRequest) {
    this.request = request;
    if (!this.request) {
      this.requestElements = [];
      return;
    }

    this.state = 'loading';

    this.dataRequests
      .listDataElements(this.request)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem locating your request details.');
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe((dataElements) => {
        this.requestElements = dataElements.map((element) => {
          return {
            id: element.id ?? '',
            dataModelId: element.model ?? '',
            dataClassId: element.dataClass ?? '',
            label: element.label,
            breadcrumbs: element.breadcrumbs,
            isSelected: false,
            isBookmarked: false,
          };
        });
      });
  }

  private updateRequestList(request: DataRequest) {
    const index = this.allRequests.findIndex((req) => req.id === request.id);
    this.allRequests[index] = request;
    this.filterRequests();
  }
}
