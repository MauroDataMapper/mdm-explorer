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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataClass,
  DataModelDetail,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  defaultIfEmpty,
  EMPTY,
  filter,
  finalize,
  forkJoin,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import {
  DataClassWithElements,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  DataElementSearchResult,
  DataItemDeleteEvent,
  DataRequest,
  DataRequestQueryPayload,
  DataRequestQueryType,
  DataSchema,
  mapToDataRequest,
  QueryCondition,
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
import { DataSchemaService } from 'src/app/data-explorer/data-schema.service';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
export interface RemoveSelectedResponse {
  okCancelDialogResponse: Observable<OkCancelDialogResponse>;
  deletedItems: Observable<DataElementMultipleOperationResult>;
  deletedClasses?: Observable<DataElementMultipleOperationResult>;
  deletedSchemas?: Observable<DataElementMultipleOperationResult>;
}

export type ItemToBeDeleted = 'dataElement' | 'dataClass' | 'dataSchema';
export type UserFacingText = {
  confirmationHeading: string;
  confirmationMessage: string;
  loadingMessage: string;
  successMessage: string;
  failureMessage: string;
};

@Component({
  selector: 'mdm-my-request-detail',
  templateUrl: './my-request-detail.component.html',
  styleUrls: ['./my-request-detail.component.scss'],
})
export class MyRequestDetailComponent implements OnInit, OnDestroy {
  request?: DataRequest;
  state: 'idle' | 'loading' = 'idle';
  sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
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
  dataSchemas: DataSchema[] = [];
  isEmpty = false;

  // To store all dataElements of this request.
  allElements?: DataElementSearchResult[];

  // Binds to the checked property of the "select all" checkbox
  allElementsSelected = false;

  // When no element is selected (!anyElementSelected) the
  // remove selected button is disabled.
  anyElementSelected = false;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private dataRequestsService: DataRequestsService,
    private toastr: ToastrService,
    private researchPlugin: ResearchPluginService,
    private dialogs: DialogService,
    private broadcastService: BroadcastService,
    private dataSchemaService: DataSchemaService
  ) {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    this.initialiseRequest();
    this.subscribeDataRequestChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initialiseRequest(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const requestId: Uuid = params.requestId;
          this.state = 'loading';
          return this.dataRequestsService.get(requestId);
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

    this.dataRequestsService
      .getQuery(this.request.id, this.cohortQueryType)
      .subscribe((query) => {
        if (!query) {
          return;
        }

        this.cohortQuery = query.condition;
      });

    this.dataRequestsService
      .getQuery(this.request.id, this.dataQueryType)
      .subscribe((query) => {
        if (!query) {
          return;
        }

        this.dataQuery = query.condition;
      });
  }

  onSelectAll() {
    if (this.allElementsSelected) {
      this.selectOrUnselectAllDataElements(false);
    } else {
      this.selectOrUnselectAllDataElements(true);
    }

    this.updateAllOrSomeChildrenSelectedHandler();
  }

  // Can mark all the children (schema, dataClass and dataElements)
  // of this request as either selected or not.
  selectOrUnselectAllDataElements(valueToSet: boolean) {
    this.dataSchemas.forEach((dataSchema) => {
      dataSchema.schema.isSelected = valueToSet;
      dataSchema.dataClasses.forEach((dataClass) => {
        dataClass.dataClass.isSelected = valueToSet;
        dataClass.dataElements.forEach((dataElement) => {
          dataElement.isSelected = valueToSet;
        });
      });
    });
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

          this.broadcastService.loading({
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
        finalize(() => this.broadcastService.loading({ isLoading: false }))
      )
      .subscribe((dataModel) => {
        // Refresh the current state of the request in view
        this.request = mapToDataRequest(dataModel);
        this.broadcastService.dispatch('data-request-submitted');

        this.dialogs.openSuccess({
          heading: 'Request submitted',
          message: `Your request "${this.request.label}" has been successfully submitted. It will now be reviewed and you will be contacted shortly to discuss further steps.`,
        });
      });
  }

  removeItem(event: DataItemDeleteEvent) {
    if (!event.dataSchema) {
      this.toastr.error('Data schema undefined', 'Unable to delete items');
      return;
    }

    const userFacingText = this.getUserFacingText(event);
    if (!userFacingText) {
      this.toastr.error('Data schema undefined', 'User text not found');
      return;
    }

    this.okCancelItem(userFacingText)
      .afterClosed()
      .pipe(
        filter((response) => !!response?.result),
        tap(() =>
          this.broadcastService.loading({
            isLoading: true,
            caption: userFacingText?.loadingMessage,
          })
        ),
        switchMap(() => {
          return this.deleteItem(event);
        }),
        switchMap((result: DataElementOperationResult) => {
          return this.deleteElementsFromQueries(event, result);
        }),
        finalize(() => this.broadcastService.loading({ isLoading: false }))
      )
      .subscribe(({ dataQuery, cohortQuery, result }) => {
        this.refreshQueries(dataQuery, cohortQuery);

        const message = result.success
          ? `${userFacingText?.successMessage}`
          : `${userFacingText?.failureMessage}${result.message}`;
        this.processRemoveDataElementResponse(result.success, message);
      });
  }

  // listens for external update to the request and refreshes if so
  handleRequestElementsChange(event: RequestElementAddDeleteEvent) {
    if (event.dataModel?.id === this.request?.id) {
      this.setRequest(this.request);
    } else {
      this.loadIntersections(this.dataSchemas).subscribe((intersections) => {
        this.sourceTargetIntersections = intersections;
        this.broadcastService.dispatch('data-intersections-refreshed', intersections);
      });
    }
  }

  removeSelected() {
    const itemList = this.getSelectedItems();
    const classList = this.getSelectedClasses();
    const schemaList = this.getSelectedSchemas();

    this.okCancelItemList(itemList)
      .afterClosed()
      .pipe(
        switchMap((okCancelDialogResponse: OkCancelDialogResponse) => {
          return this.removeSelectedItems(okCancelDialogResponse, itemList);
        }),
        switchMap(([okCancelDialogResponse, deletedElements]) => {
          return this.removeSelectedClasses(
            okCancelDialogResponse,
            deletedElements,
            classList
          );
        }),
        switchMap(([okCancelDialogResponse, deletedElements, deletedClasses]) => {
          return this.removeSelectedSchemas(
            okCancelDialogResponse,
            deletedElements,
            deletedClasses,
            schemaList
          );
        }),
        switchMap(([deletedElements, deletedClasses, deletedSchemas]) => {
          const labels = itemList.map((item) => item.label);
          return forkJoin({
            deletedElements: of(deletedElements),
            deletedClasses: of(deletedClasses),
            deletedSchemas: of(deletedSchemas),
            dataQuery: this.removeDataElementFromQuery(labels, this.dataQueryType),
            cohortQuery: this.removeDataElementFromQuery(labels, this.cohortQueryType),
          });
        })
      )
      .subscribe(
        ({ deletedElements, deletedClasses, deletedSchemas, dataQuery, cohortQuery }) => {
          this.refreshQueries(dataQuery, cohortQuery);

          const success = deletedElements.failures.length === 0;
          let message = `${deletedElements.successes.length} Data element${
            deletedElements.successes.length === 1 ? '' : 's'
          } removed from request "${this.request?.label}".`;
          if (!success) {
            message += `\r\n${deletedElements.failures.length} Data element${
              deletedElements.failures.length === 1 ? '' : 's'
            } caused an error.`;
            deletedElements.failures.forEach((item: DataElementOperationResult) =>
              console.log(item.message)
            );
          }

          const classSuccess = deletedClasses.failures.length === 0;
          if (!classSuccess) {
            message += `\r\n${deletedClasses.failures.length} Data class${
              deletedClasses.failures.length === 1 ? '' : 'es'
            } caused an error.`;
            deletedClasses.failures.forEach((item: DataElementOperationResult) =>
              console.log(item.message)
            );
          }

          const schemaSuccess = deletedSchemas.failures.length === 0;
          if (!schemaSuccess) {
            message += `\r\n${deletedSchemas.failures.length} Data schema${
              deletedSchemas.failures.length === 1 ? '' : 's'
            } caused an error.`;
            deletedSchemas.failures.forEach((item: DataElementOperationResult) =>
              console.log(item.message)
            );
          }

          this.processRemoveDataElementResponse(success, message);
          this.broadcastService.loading({ isLoading: false });
          this.setRequest(this.request);
        }
      );
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

    this.dataRequestsService.forkWithDialogs(this.request).subscribe();
  }

  /**
   * Opens a dialog for the user to update the request.
   * Then, updates {@link request}.
   *
   * @returns void
   */
  editRequest() {
    if (!this.request || !this.request.id) {
      return;
    }

    this.dataRequestsService
      .updateWithDialog(this.request.id, this.request.label, this.request.description)
      .subscribe((response: DataModelDetail) => {
        if (!response || !this.request) {
          return;
        }

        this.request.description = response.description;
        this.request.label = response.label;
      });
  }

  showCohortCreate() {
    return this.cohortQuery.rules.length === 0 && this.request?.status === 'unsent';
  }

  showCohortEdit() {
    return this.cohortQuery.rules.length > 0 && this.request?.status === 'unsent';
  }

  showDataEdit() {
    return this.dataQuery.rules.length > 0 && this.request?.status === 'unsent';
  }

  /**
   * Each time any of the childrens at any level (schema, data class
   * or dataElement) is selected, it emits an event to update
   * if all its children are selected. To keep tracks of the
   * childrens, we check if all or any of the elements are selected
   * and update the variables.
   */
  updateAllOrSomeChildrenSelectedHandler() {
    this.updateAllElementsSelected();
    this.updateAnyElementsSelected();
  }

  private updateAllElementsSelected() {
    if (!this.allElements) {
      this.allElements = this.dataSchemaService.reduceDataElementsFromSchemas(
        this.dataSchemas
      );
    }

    this.allElementsSelected = this.allElements.every(
      (dataElement) => dataElement.isSelected
    );
  }

  private updateAnyElementsSelected() {
    if (!this.allElements) {
      this.allElements = this.dataSchemaService.reduceDataElementsFromSchemas(
        this.dataSchemas
      );
    }

    this.anyElementSelected = this.allElements.some(
      (dataElement) => dataElement.isSelected
    );
  }

  /**
   * Methods for general page management
   */
  private loadError() {
    this.toastr.error('There was a problem locating your request details.');
    return EMPTY;
  }

  /**
   * Methods for loading/reloading request data.
   */
  private setRequest(request?: DataRequest) {
    this.request = request;
    if (!this.request) {
      return;
    }
    this.state = 'loading';

    this.dataSchemaService
      .loadDataSchemas(this.request)
      .pipe(
        defaultIfEmpty(undefined),
        switchMap((dataSchemas: DataSchema[] | undefined) => {
          return forkJoin([
            of(dataSchemas ?? []),
            this.loadIntersections(dataSchemas ?? []),
          ]) as Observable<[DataSchema[], DataAccessRequestsSourceTargetIntersections]>;
        }),
        catchError(() => {
          return this.loadError();
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe(([dataSchemas, intersections]) => {
        this.dataSchemas = dataSchemas;
        this.isEmpty =
          this.dataSchemaService.reduceDataElementsFromSchemas(this.dataSchemas)
            .length === 0;
        this.sourceTargetIntersections = intersections;
      });
  }

  // intersections are dataelements that are part of the request
  private loadIntersections(
    dataSchemas: DataSchema[]
  ): Observable<DataAccessRequestsSourceTargetIntersections> {
    const dataElementIds: Uuid[] = this.dataSchemaService
      .reduceDataElementsFromSchemas(dataSchemas)
      .map((element) => element.id);

    return of(this.request).pipe(
      switchMap((dataRequest) => {
        if (dataRequest?.id) {
          return this.dataRequestsService.getRequestsIntersections(
            dataRequest.id,
            dataElementIds
          );
        } else {
          return EMPTY;
        }
      })
    );
  }

  private subscribeDataRequestChanges() {
    this.broadcastService
      .on('data-request-added')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(() => {
        this.loadIntersections(this.dataSchemas).subscribe((intersections) => {
          this.sourceTargetIntersections = intersections;
          this.broadcastService.dispatch('data-intersections-refreshed', intersections);
        });
      });
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
   * Methods for managing the okCancel dialogs.
   */
  private confirmSumbitRequest(): MatDialogRef<OkCancelDialogData> {
    return this.okCancel(
      'Submit request',
      `You are about to submit your request "${this.request?.label}" for review. You will not be able to change it further from this point. Do you want to continue?`
    );
  }

  private okCancelItem(userFacingText: UserFacingText): MatDialogRef<OkCancelDialogData> {
    return this.okCancel(
      userFacingText.confirmationHeading,
      userFacingText.confirmationMessage
    );
  }

  private okCancelItemList(
    itemList: DataElementSearchResult[]
  ): MatDialogRef<OkCancelDialogData> {
    return this.okCancel(
      'Remove selected data elements',
      `Are you sure you want to remove these ${itemList.length} selected data elements from request ${this.request?.label}?`
    );
  }

  private okCancel(heading: string, content: string): MatDialogRef<OkCancelDialogData> {
    return this.dialogs.openOkCancel({
      heading,
      content,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }

  /**
   * Methods for managing the selection of items.
   */
  private getSelectedItems(): DataElementSearchResult[] {
    return this.dataSchemaService
      .reduceDataElementsFromSchemas(this.dataSchemas)
      .filter((item) => item.isSelected);
  }

  private getSelectedClasses(): DataClass[] {
    return this.dataSchemaService
      .reduceDataClassesFromSchemas(this.dataSchemas)
      .filter(
        (dataClassWithElements) =>
          dataClassWithElements.dataElements.filter(
            (dataElement) => dataElement.isSelected
          ).length === dataClassWithElements.dataElements.length
      )
      .map((dataClassWithElements) => dataClassWithElements.dataClass);
  }

  private getSelectedSchemas(): DataSchema[] {
    return this.dataSchemas.filter(
      (dataSchema) =>
        this.dataSchemaService
          .reduceDataElementsFromSchema(dataSchema)
          .filter((dataElement) => dataElement.isSelected).length ===
        this.dataSchemaService.reduceDataElementsFromSchema(dataSchema).length
    );
  }

  private removeSelectedItems(
    okCancelDialogResponse: OkCancelDialogResponse,
    itemList: DataElementSearchResult[]
  ): Observable<[OkCancelDialogResponse, DataElementMultipleOperationResult]> {
    if (okCancelDialogResponse.result) {
      this.broadcastService.loading({
        isLoading: true,
        caption: `Removing ${itemList.length} data element${
          itemList.length === 1 ? '' : 's'
        } from request ${this.request?.label} ...`,
      });
      const dataModel: DataModelDetail = {
        domainType: CatalogueItemDomainType.DataModel,
        label: this.request?.label ?? '',
        availableActions: [],
        finalised: false,
        id: this.request?.id ?? '',
      };
      return forkJoin([
        of(okCancelDialogResponse),
        this.dataRequestsService.deleteDataElementMultiple(itemList, dataModel),
      ]) as Observable<[OkCancelDialogResponse, DataElementMultipleOperationResult]>;
    } else {
      return forkJoin([of(okCancelDialogResponse), EMPTY]) as Observable<
        [OkCancelDialogResponse, DataElementMultipleOperationResult]
      >;
    }
  }

  private removeSelectedClasses(
    okCancelDialogResponse: OkCancelDialogResponse,
    deletedElements: DataElementMultipleOperationResult,
    classList: DataClass[]
  ): Observable<
    [
      OkCancelDialogResponse,
      DataElementMultipleOperationResult,
      DataElementMultipleOperationResult
    ]
  > {
    if (okCancelDialogResponse.result) {
      return forkJoin([
        of(okCancelDialogResponse),
        of(deletedElements),
        this.dataRequestsService.deleteDataClassMultiple(classList),
      ]) as Observable<
        [
          OkCancelDialogResponse,
          DataElementMultipleOperationResult,
          DataElementMultipleOperationResult
        ]
      >;
    } else {
      return forkJoin([of(okCancelDialogResponse), EMPTY, EMPTY]) as Observable<
        [
          OkCancelDialogResponse,
          DataElementMultipleOperationResult,
          DataElementMultipleOperationResult
        ]
      >;
    }
  }

  private removeSelectedSchemas(
    okCancelDialogResponse: OkCancelDialogResponse,
    deletedElements: DataElementMultipleOperationResult,
    deletedClasses: DataElementMultipleOperationResult,
    schemaList: DataSchema[]
  ): Observable<
    [
      DataElementMultipleOperationResult,
      DataElementMultipleOperationResult,
      DataElementMultipleOperationResult
    ]
  > {
    if (okCancelDialogResponse.result) {
      return forkJoin([
        of(deletedElements),
        of(deletedClasses),
        this.dataRequestsService.deleteDataSchemaMultiple(schemaList),
      ]) as Observable<
        [
          DataElementMultipleOperationResult,
          DataElementMultipleOperationResult,
          DataElementMultipleOperationResult
        ]
      >;
    } else {
      return forkJoin([EMPTY, EMPTY, EMPTY]) as Observable<
        [
          DataElementMultipleOperationResult,
          DataElementMultipleOperationResult,
          DataElementMultipleOperationResult
        ]
      >;
    }
  }

  /**
   * Methods for managing the data elements associated with a query.
   */
  private removeDataElementFromQuery(
    dataElementLabels: string[],
    queryType: DataRequestQueryType
  ): Observable<DataRequestQueryPayload | undefined> {
    if (!this.request?.id) {
      return EMPTY;
    }

    return this.dataRequestsService.deleteDataElementsFromQuery(
      this.request.id,
      queryType,
      dataElementLabels
    );
  }

  private refreshQueries(
    dataQuery?: DataRequestQueryPayload,
    cohortQuery?: DataRequestQueryPayload
  ) {
    if (dataQuery && this.dataQuery !== dataQuery.condition) {
      this.dataQuery = dataQuery.condition;
    }

    if (cohortQuery && this.cohortQuery !== cohortQuery.condition) {
      this.cohortQuery = cohortQuery.condition;
    }
  }

  /**
   * Methods for deleting dataSchemas, dataClasses and dataElements.
   */
  private getItemType(event: DataItemDeleteEvent): ItemToBeDeleted | undefined {
    if (event.dataElement && event.dataClassWithElements && event.dataSchema) {
      return 'dataElement';
    } else if (!event.dataElement && event.dataClassWithElements && event.dataSchema) {
      return 'dataClass';
    } else if (!event.dataElement && !event.dataClassWithElements && event.dataSchema) {
      return 'dataSchema';
    } else {
      return undefined;
    }
  }

  private getLabels(event: DataItemDeleteEvent): string[] {
    const itemToBeDeleted: ItemToBeDeleted | undefined = this.getItemType(event);
    switch (itemToBeDeleted) {
      case 'dataSchema': {
        const dataSchemas: DataSchema[] = [];
        if (event.dataSchema) {
          dataSchemas.push(event.dataSchema);
        }
        return this.dataSchemaService
          .reduceDataElementsFromSchemas(dataSchemas)
          .map((element) => element.label);
      }
      case 'dataClass': {
        return (
          event.dataClassWithElements?.dataElements.map((dataElement) => {
            return dataElement.label;
          }) ?? []
        );
      }
      case 'dataElement': {
        const dataElements: string[] = [];
        if (event.dataElement) {
          dataElements.push(event.dataElement.label);
        }
        return dataElements;
      }
      default:
        return [];
    }
  }

  private getUserFacingText(event: DataItemDeleteEvent): UserFacingText | undefined {
    const itemToBeDeleted: ItemToBeDeleted | undefined = this.getItemType(event);
    switch (itemToBeDeleted) {
      case 'dataSchema':
        return {
          confirmationHeading: 'Remove data schema',
          confirmationMessage: `Are you sure you want to remove all the data elements belonging to data schema "${event.dataSchema?.schema.label}" from request "${this.request?.label}" and all their related queries?`,
          loadingMessage: `Removing data elements belonging to schema ${
            event.dataSchema?.schema.label ?? ''
          } from request ${this.request?.label} ...`,
          successMessage: `Data elements belonging to schema ${event.dataSchema?.schema.label} removed from request "${this.request?.label}".`,
          failureMessage: `Removal of data elements belonging to schema ${event.dataSchema?.schema.label} failed. The error message is: `,
        };
      case 'dataClass': {
        const dataClassName = event.dataClassWithElements?.dataClass.label;
        return {
          confirmationHeading: 'Remove data class',
          confirmationMessage: `Are you sure you want to remove all the data elements belonging to data class "${dataClassName}" from request "${this.request?.label}" and all their related queries?`,
          loadingMessage: `Removing data elements belonging to class ${dataClassName} from request ${this.request?.label} ...`,
          successMessage: `Data elements belonging to class ${dataClassName} removed from request "${this.request?.label}".`,
          failureMessage: `Removal of data elements belonging to class ${dataClassName} failed. The error message is: `,
        };
      }
      case 'dataElement':
        return {
          confirmationHeading: 'Remove data element',
          confirmationMessage: `Are you sure you want to remove data element "${event.dataElement?.label}" from request "${this.request?.label}" and all its related queries?`,
          loadingMessage: `Removing data element ${event.dataElement?.label} from request ${this.request?.label} ...`,
          successMessage: `Data element "${event.dataElement?.label}" removed from request "${this.request?.label}".`,
          failureMessage: `Removal of data element ${event.dataElement?.label} failed. The error message is: `,
        };
      default:
        return undefined;
    }
  }

  private deleteDataClass(
    dataClass: DataClass | undefined,
    dataSchema: DataSchema | undefined
  ) {
    if (dataSchema?.schema && dataSchema?.dataClasses.length === 1) {
      return this.dataRequestsService.deleteDataSchema(dataSchema.schema);
    } else if (dataClass) {
      return this.dataRequestsService.deleteDataClass(dataClass);
    } else {
      return EMPTY;
    }
  }

  private deleteDataElement(
    dataElement: DataElementSearchResult | undefined,
    dataClassWithElements: DataClassWithElements | undefined,
    dataSchema: DataSchema | undefined
  ): Observable<DataElementOperationResult> {
    if (
      dataClassWithElements?.dataElements &&
      dataClassWithElements?.dataElements.length === 1
    ) {
      return this.deleteDataClass(dataClassWithElements.dataClass, dataSchema);
    } else if (dataElement) {
      if (this.request) {
        const dataModel: DataModelDetail = {
          domainType: CatalogueItemDomainType.DataModel,
          label: this.request.label,
          availableActions: [],
          finalised: false,
          id: this.request.id,
        };
        return this.dataRequestsService
          .deleteDataElementMultiple([dataElement], dataModel)
          .pipe(
            switchMap((result: DataElementMultipleOperationResult) => {
              const singleResult =
                result.failures.length === 0 ? result.successes[0] : result.failures[0];
              return of(singleResult);
            })
          );
      } else {
        return EMPTY;
      }
    } else {
      return EMPTY;
    }
  }

  private deleteItem(event: DataItemDeleteEvent) {
    const itemType = this.getItemType(event);
    if (itemType === 'dataSchema' && event.dataSchema) {
      return this.dataRequestsService.deleteDataSchema(event.dataSchema.schema);
    }

    if (itemType === 'dataClass') {
      return this.deleteDataClass(
        event.dataClassWithElements?.dataClass,
        event.dataSchema
      );
    }

    if (itemType === 'dataElement') {
      return this.deleteDataElement(
        event.dataElement,
        event.dataClassWithElements,
        event.dataSchema
      );
    }

    return EMPTY;
  }

  private deleteElementsFromQueries(
    event: DataItemDeleteEvent,
    result: DataElementOperationResult
  ) {
    const labels = this.getLabels(event);

    // Remove data element from request queries.
    return forkJoin({
      dataQuery: this.removeDataElementFromQuery(labels, this.dataQueryType),
      cohortQuery: this.removeDataElementFromQuery(labels, this.cohortQueryType),
      result: of(result),
    });
  }
}
