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
import { Component, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataModelDetail,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { KnownRouterPath } from 'src/app/core/state-router.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  DataElementDeleteEvent,
  DataElementDto,
  DataElementInstance,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  DataElementSearchResult,
  DataRequest,
  DataRequestQueryType,
  mapToDataRequest,
  QueryCondition,
  SelectableDataElementSearchResultCheckedEvent,
  QueryExpression,
  DataRequestQueryPayload,
} from 'src/app/data-explorer/data-explorer.types';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import {
  OkCancelDialogData,
  OkCancelDialogResponse,
} from 'src/app/data-explorer/ok-cancel-dialog/ok-cancel-dialog.component';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
@Component({
  selector: 'mdm-my-request-detail',
  templateUrl: './my-request-detail.component.html',
  styleUrls: ['./my-request-detail.component.scss'],
})
export class MyRequestDetailComponent implements OnInit {
  request?: DataRequest;
  requestElements: DataElementSearchResult[] = [];
  state: 'idle' | 'loading' = 'idle';
  sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
  removeSelectedButtonDisabled = true;
  backRouterLink: KnownRouterPath = '';
  backLabel = '';
  cohortQueryType: DataRequestQueryType = 'cohort';
  cohortQuery: QueryCondition = {
    condition: 'and',
    rules: [],
  };
  dataQueryType: DataRequestQueryType = 'data';
  dataQuery: QueryCondition = {
    condition: 'and',
    rules: [],
  };

  constructor(
    private route: ActivatedRoute,
    private dataRequests: DataRequestsService,
    private explorer: DataExplorerService,
    private toastr: ToastrService,
    private dataModels: DataModelService,
    private researchPlugin: ResearchPluginService,
    private dialogs: DialogService,
    private broadcast: BroadcastService
  ) {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    this.initialiseRequest();
    this.setBackButtonProperties();
  }

  initialiseRequest(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const requestId: Uuid = params.requestId;
          this.state = 'loading';
          return this.dataRequests.get(requestId);
        }),
        catchError((error) => {
          this.toastr.error(`Invalid Request Id. ${error}`);
          this.state = 'idle';
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe((request) => {
        this.setRequest(request);
        this.initialiseRequestQueries();
      });
  }

  initialiseRequestQueries() {
    if (!this.request?.id) {
      return;
    }

    this.dataRequests
      .getQuery(this.request.id, this.cohortQueryType)
      .subscribe((query) => {
        if (!query) {
          return;
        }

        this.cohortQuery = query.condition;
      });

    this.dataRequests.getQuery(this.request.id, this.dataQueryType).subscribe((query) => {
      if (!query) {
        return;
      }

      this.dataQuery = query.condition;
    });
  }

  onSelectElement(event: SelectableDataElementSearchResultCheckedEvent) {
    event.item.isSelected = event.checked;
    this.setRemoveSelectedButtonDisabled();
  }

  onSelectAll(event: MatCheckboxChange) {
    if (this.requestElements) {
      this.requestElements = this.requestElements.map((item) => {
        return { ...item, isSelected: event.checked };
      });
    }

    this.setRemoveSelectedButtonDisabled();
  }

  submitRequest() {
    if (!this.request || !this.request.id || this.request.status !== 'unsent') {
      return;
    }

    this.confirmSumbitRequest()
      .afterClosed()
      .pipe(
        filter((response) => response?.result ?? false),
        switchMap(() => {
          if (!this.request || !this.request.id) {
            return EMPTY;
          }

          this.broadcast.loading({
            isLoading: true,
            caption: 'Submitting your request...',
          });
          return this.researchPlugin.submitRequest(this.request.id);
        }),
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

        this.dialogs.openSuccess({
          heading: 'Request submitted',
          message: `Your request "${this.request.label}" has been successfully submitted. It will now be reviewed and you will be contacted shortly to discuss further steps.`,
        });
      });
  }

  removeItem(event: DataElementDeleteEvent) {
    const item = event.item;
    this.removeOneOrMoreDataElements([item]);
  }

  // listens for external uodate to the request and refreshes if so
  handlePossibleSelfDelete(event: RequestElementAddDeleteEvent) {
    if (event.dataModel?.id === this.request?.id) {
      this.setRequest(this.request);
    }
  }

  removeOneOrMoreDataElements(items: DataElementSearchResult[]) {
    this.okCancelItemList(items)
      .afterClosed()
      .pipe(
        switchMap((result: OkCancelDialogResponse) => {
          if (result.result) {
            this.broadcast.loading({
              isLoading: true,
              caption:
                items.length === 1
                  ? `Removing data element ${items[0].label} from request ${this.request?.label} ...`
                  : `Removing ${items.length} data elements from request ${this.request?.label} ...`,
            });
            const dataModel: DataModelDetail = {
              domainType: CatalogueItemDomainType.DataModel,
              label: this.request?.label ?? '',
              availableActions: [],
              finalised: false,
              id: this.request?.id ?? '',
            };
            return this.dataRequests.deleteDataElementMultiple(items, dataModel);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe((resultMultiple: DataElementMultipleOperationResult) => {
        const labels = resultMultiple.successes.map((success) => {
          return success.item.label;
        });

        // Remove data element from request queries.
        this.removeDataElementFromQuery(labels, this.dataQueryType);
        this.removeDataElementFromQuery(labels, this.cohortQueryType);

        let success: boolean;
        let message: string = '';

        if (items.length === 1) {
          const singleResult =
            resultMultiple.failures.length === 0
              ? resultMultiple.successes[0]
              : resultMultiple.failures[0];
          success = singleResult.success;

          if (!singleResult.success) {
            message = `Removal of data element ${items[0].label} failed. The error message is: ${singleResult.message}`;
          } else {
            message = `Data element "${items[0].label}" removed from request "${this.request?.label}".`;
          }
        } else {
          success = resultMultiple.failures.length === 0;
          message = `${resultMultiple.successes.length} Data element${
            resultMultiple.successes.length === 1 ? '' : 's'
          } removed from request "${this.request?.label}".`;

          if (!success) {
            message += `\r\n${resultMultiple.failures.length} Data element${
              resultMultiple.failures.length === 1 ? '' : 's'
            } caused an error.`;
          }
        }
        this.processRemoveDataElementResponse(success, message);
        this.broadcast.loading({ isLoading: false });
      });
  }

  removeSelected() {
    const itemList = this.requestElements.filter((item) => item.isSelected);
    this.removeOneOrMoreDataElements(itemList);
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
          return forkJoin([of(nextDraftModel)]);
        }),
        finalize(() => this.broadcast.loading({ isLoading: false }))
      )
      .subscribe(([nextDraftModel]) => {
        const nextDataRequest = mapToDataRequest(nextDraftModel);
        this.dialogs.openSuccess({
          heading: 'Request created',
          message: `Your new request "${nextDataRequest.label}" has been successfully created. Modify this request by searching or browsing our catalogue before submitting again.`,
        });
      });
  }

  showCohortCreate() {
    return this.cohortQuery.rules.length === 0 && this.request?.status === 'unsent';
  }

  showCohortEdit() {
    return this.cohortQuery.rules.length > 0 && this.request?.status === 'unsent';
  }

  showDataCreate() {
    return this.dataQuery.rules.length === 0 && this.request?.status === 'unsent';
  }

  showDataEdit() {
    return this.dataQuery.rules.length > 0 && this.request?.status === 'unsent';
  }

  private removeDataElementFromQuery(
    dataElementLabels: string[],
    queryType: DataRequestQueryType
  ) {
    if (!this.request?.id) {
      return;
    }

    this.dataRequests
      .deleteDataElementsFromQuery(this.request.id, queryType, dataElementLabels)
      .subscribe((newQuery) => {
        if (!newQuery) {
          return;
        }

        switch (queryType) {
          case this.cohortQueryType:
            this.cohortQuery = newQuery.condition;
            break;
          case this.dataQueryType:
            this.dataQuery = newQuery.condition;
        }
      });
  }

  private setBackButtonProperties() {
    this.backRouterLink = '/requests';
    this.backLabel = 'Back to My Requests';
  }

  private setRequest(request?: DataRequest) {
    this.request = request;
    if (!this.request) {
      this.requestElements = [];
      return;
    }
    this.state = 'loading';
    forkJoin([
      this.dataRequests.listDataElements(this.request),
      this.explorer.getRootDataModel(),
    ])
      .pipe(
        switchMap(([dataElements, rootModel]: [DataElementDto[], DataModelDetail]) => {
          if (this.request?.id && rootModel?.id) {
            return this.dataModels.elementsInAnotherModel(rootModel, dataElements);
          }
          throw new Error('Id cannot be found for user request or root data model');
        }),
        switchMap((dataElements: (DataElementDto | null)[]) => {
          return of(
            dataElements.map((element) => {
              return (
                element
                  ? {
                      ...element,
                      isSelected: false,
                      isBookmarked: false,
                    }
                  : null
              ) as DataElementSearchResult;
            })
          );
        }),
        switchMap((dataElements: DataElementSearchResult[]) => {
          return forkJoin([
            of(dataElements),
            this.loadIntersections(dataElements),
          ]) as Observable<
            [DataElementSearchResult[], DataAccessRequestsSourceTargetIntersections]
          >;
        }),
        catchError(() => {
          this.toastr.error('There was a problem locating your request details.');
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe({
        next: ([dataElements, intersections]) => {
          this.requestElements = dataElements;
          this.sourceTargetIntersections = intersections;
        },
      });
  }

  // intersections are dataelements that are part of the request
  private loadIntersections(elements: DataElementInstance[]) {
    const dataElementIds: Uuid[] = [];

    if (elements) {
      elements.forEach((item: DataElementInstance) => {
        dataElementIds.push(item.id);
      });
    }

    return this.explorer.getRootDataModel().pipe(
      switchMap((rootModel: DataModelDetail) => {
        if (rootModel.id) {
          return this.dataRequests.getRequestsIntersections(rootModel.id, dataElementIds);
        } else {
          return EMPTY;
        }
      })
    );
  }

  private processRemoveDataElementResponse(result: boolean, message: string) {
    if (result === false) {
      this.toastr.error(message, 'Data element removal');
    } else {
      this.toastr.success(message, 'Data element removal');
    }
    // refresh the request
    this.setRequest(this.request);
  }

  /**
   * Disable the 'Remove Selected' button unless some elements are selected in the current request
   */
  private setRemoveSelectedButtonDisabled() {
    const selectedItemList = this.requestElements.filter((item) => item.isSelected);
    this.removeSelectedButtonDisabled = !this.request || selectedItemList.length === 0;
  }

  private confirmSumbitRequest(): MatDialogRef<OkCancelDialogData> {
    return this.dialogs.openOkCancel({
      heading: 'Submit request',
      content: `You are about to submit your request "${this.request?.label}" for review. You will not be able to change it further from this point. Do you want to continue?`,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }

  private okCancelItemList(
    itemList: DataElementSearchResult[]
  ): MatDialogRef<OkCancelDialogData> {
    if (itemList.length == 1) {
      return this.dialogs.openOkCancel({
        heading: 'Remove data element',
        content: `Are you sure you want to remove data element "${itemList[0].label}" from request "${this.request?.label}" and all its related queries?`,
        okLabel: 'Yes',
        cancelLabel: 'No',
      });
    } else {
      return this.dialogs.openOkCancel({
        heading: 'Remove selected data elements',
        content: `Are you sure you want to remove these ${itemList.length} selected data elements from request "${this.request?.label}" and all its related queries?`,
        okLabel: 'Yes',
        cancelLabel: 'No',
      });
    }
  }
}
