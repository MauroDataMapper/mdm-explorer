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
import { catchError, EMPTY, finalize, forkJoin, Observable, of, switchMap } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  DataElementDeleteEvent,
  DataElementDto,
  DataElementInstance,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  DataElementSearchResult,
  DataRequest,
  mapToDataRequest,
  SelectableDataElementSearchResultCheckedEvent,
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
  }

  initialiseRequest(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const requestId = params.requestId;
          this.state = 'loading';
          return this.dataRequests.get(requestId);
        }),
        catchError((error) => {
          this.toastr.error(`Invalid Request Id. ${error}`);
          this.state = 'idle';
          return EMPTY;
        })
      )
      .subscribe((request) => {
        this.setRequest(request);
        this.state = 'idle';
      });
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

  //intersections are dataelements that are part of the request
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
      console.log(message);
    } else {
      this.toastr.success(message, 'Data element removal');
    }
    //refresh the request
    this.setRequest(this.request);
  }

  /**
   * Disable the 'Remove Selected' button unless some elements are selected in the current request
   */
  private setRemoveSelectedButtonDisabled() {
    const selectedItemList = this.requestElements.filter((item) => item.isSelected);
    this.removeSelectedButtonDisabled = !this.request || selectedItemList.length === 0;
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

    this.broadcast.loading({ isLoading: true, caption: 'Submitting your request...' });
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

        this.dialogs.openSuccess({
          heading: 'Request submitted',
          message: `Your request "${this.request.label}" has been successfully submitted. It will now be reviewed and you will be contacted shortly to discuss further steps.`,
        });
      });
  }

  removeItem(event: DataElementDeleteEvent) {
    const item = event.item;
    this.okCancelItem(item)
      .afterClosed()
      .pipe(
        switchMap((result: OkCancelDialogResponse) => {
          if (result.result) {
            this.broadcast.loading({
              isLoading: true,
              caption: `Removing data element ${item.label} from request ${this.request?.label} ...`,
            });
            const dataModel: DataModelDetail = {
              domainType: CatalogueItemDomainType.DataModel,
              label: this.request?.label ?? '',
              availableActions: [],
              finalised: false,
              id: this.request?.id ?? '',
            };
            return this.dataRequests.deleteDataElementMultiple([item], dataModel);
          } else {
            return EMPTY;
          }
        })
      )
      .subscribe((resultMultiple: DataElementMultipleOperationResult) => {
        const result =
          resultMultiple.failures.length === 0
            ? resultMultiple.successes[0]
            : resultMultiple.failures[0];
        let message = '';
        if (!result.success) {
          message = `Removal of data element ${item.label} failed. The error message is: ${result.message}`;
        } else {
          message = `Data element "${item.label}" removed from request "${this.request?.label}".`;
        }
        this.processRemoveDataElementResponse(result.success, message);
        this.broadcast.loading({ isLoading: false });
      });
  }

  private okCancelItem(item: DataElementSearchResult): MatDialogRef<OkCancelDialogData> {
    return this.dialogs.openOkCancel({
      heading: 'Remove data element',
      content: `Are you sure you want to remove data element "${item.label}" from request "${this.request?.label}"?`,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }

  //listens for external uodate to the request and refreshes if so
  handlePossibleSelfDelete(event: RequestElementAddDeleteEvent) {
    if (event.dataModel?.id === this.request?.id) {
      this.setRequest(this.request);
    }
  }

  removeSelected() {
    const itemList = this.requestElements.filter((item) => item.isSelected);
    this.okCancelItemList(itemList)
      .afterClosed()
      .pipe(
        switchMap((result: OkCancelDialogResponse) => {
          if (result.result) {
            this.broadcast.loading({
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
            return this.dataRequests.deleteDataElementMultiple(itemList, dataModel);
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
        this.broadcast.loading({ isLoading: false });
      });
  }

  private okCancelItemList(
    itemList: DataElementSearchResult[]
  ): MatDialogRef<OkCancelDialogData> {
    return this.dialogs.openOkCancel({
      heading: 'Remove selected data elements',
      content: `Are you sure you want to remove these ${itemList.length} selected data elements from request ${this.request?.label}?`,
      okLabel: 'Yes',
      cancelLabel: 'No',
    });
  }
}
