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
import {
  DataElement,
  DataModel,
  DataModelDetail,
  DataModelSubsetPayload,
} from '@maurodatamapper/mdm-resources';
import { finalize, Observable, of, Subject, switchMap, takeUntil } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import {
  DataElementDto,
  DataElementInstance,
  DataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import { UserDetails } from 'src/app/security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { RequestUpdatedData } from 'src/app/data-explorer/request-updated-dialog/request-updated-dialog.component';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import { TooltipHelpTextOption } from '../bookmark-toggle/bookmark-toggle.component';
import { SortService } from 'src/app/mauro/sort.service';
import { DataModelService } from 'src/app/mauro/data-model.service';

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
  // @Input() dataElement?: DataElementSearchResult;
  @Input() dataElements?: DataElementSearchResult[];
  @Input() caption = 'Add to request';

  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
  @Input() suppressViewRequestsDialogButton = false;

  @Output() createRequestClicked = new EventEmitter<CreateRequestEvent>();
  @Output() requestAddDelete = new EventEmitter<RequestElementAddDeleteEvent>();

  ready = false;

  // The list of items in the createRequest menu
  dataRequestMenuItems: DataAccessRequestMenuItem[] = [];
  elementLinkedToRequest = false;
  tooltipText = 'Assigned to Request';

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
    private broadcast: BroadcastService,
    private explorer: DataExplorerService,
    private sortService: SortService,
    private dataModelService: DataModelService
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

    /*
    if (this.dataElement && !this.dataElements) {
      this.dataElements = [] as DataElementSearchResult[];
      this.dataElements.push(this.dataElement);
    }*/

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
    let dataElements: DataElementSearchResult[];
    if (this.dataElements && this.dataElements?.length !== 0) {
      const targetDataModelId = event.source.value;
      const datamodelSubsetPayload: DataModelSubsetPayload = {
        additions: [],
        deletions: [],
      };

      dataElements = this.dataElements;

      this.broadcast.loading({ isLoading: true, caption: 'Updating your request...' });

      // All the elements will belong to the same dataModel so we can just check the first one.
      // const dataElement: DataElementSearchResult = this.dataElements[0];

      // If the dataModel and target is the same set the dataModel to be the root
      /*
      if (dataElements[0].model === targetDataModelId) {
        this.explorer
          .getRootDataModel()
          .pipe(
            switchMap((rootModel: DataModelDetail) => {
              return this.dataModelService.elementsInAnotherModel(
                rootModel,
                this.dataElementSearchResultsToDataElementDTOs(dataElements)
              );
            })
          )
          .subscribe({
            next: (rootDataElements) => {
              dataElements =
                this.dataElementDTOsToDataElementSearchResults(rootDataElements);
            },
          });
      } else {
        dataElements = this.dataElements;
      }


      if (event.checked) {
        // Do a subset add for this data element in the request
        //datamodelSubsetPayload.additions = [this.dataElements[0].id];
        datamodelSubsetPayload.additions = dataElements.map((de) => de.id);
      } else {
        // Do a subset remove for this data element in the request
        //datamodelSubsetPayload.deletions = [this.dataElements[0].id];
        datamodelSubsetPayload.deletions = dataElements.map((de) => de.id);
      }*/

      this.explorer
        .getRootDataModel()
        .pipe(
          switchMap((rootModel: DataModelDetail) => {
            return this.dataModelService.elementsInAnotherModel(
              rootModel,
              this.dataElementSearchResultsToDataElementDTOs(dataElements)
            );
          }),
          switchMap((rootDataElements) => {
            // Elements cannot be copied to themselves, so if the source and target model is the same,
            // use the root model as the source instead.
            if (dataElements[0].model === targetDataModelId) {
              return of(this.dataElementDTOsToDataElementSearchResults(rootDataElements));
            } else {
              return of(dataElements);
            }
          }),
          switchMap((transposedDataElements) => {
            if (event.checked) {
              // Do a subset add for this data element in the request
              datamodelSubsetPayload.additions = transposedDataElements.map(
                (de) => de.id
              );
            } else {
              // Do a subset remove for this data element in the request
              datamodelSubsetPayload.deletions = transposedDataElements.map(
                (de) => de.id
              );
            }
            return this.endpoints.dataModel.copySubset(
              transposedDataElements[0].model,
              targetDataModelId,
              datamodelSubsetPayload
            );
          }),
          finalize(() => {
            this.broadcast.loading({ isLoading: false });
          })
        )
        .subscribe(() => {
          // Communicate change to the outside world
          if (dataElements) {
            dataElements.forEach((dataElement) => {
              const addDeleteEventData: RequestElementAddDeleteEvent = {
                adding: event.checked,
                dataElement,
                dataModel: item,
              };
              this.requestAddDelete.emit(addDeleteEventData);
            });
          }

          const dataElementInstances: DataElementInstance[] = dataElements
            ? dataElements.map((dataElement) => ({
                id: dataElement?.id ?? '',
                model: dataElement?.model ?? '',
                dataClass: dataElement?.dataClass ?? '',
                label: dataElement?.label ?? '',
                isBookmarked: dataElement.isBookmarked ?? false,
              }))
            : ([] as DataElementInstance[]);

          const requestUpdatedData: RequestUpdatedData = {
            request: item,
            addedElements: event.checked ? dataElementInstances : [],
            removedElements: !event.checked ? dataElementInstances : [],
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
    if (!this.dataElements || this.dataElements?.length === 0) return;

    const element = this.dataElements[0];

    const idsOfRequestsContainingElement =
      this.dataElements?.length === 1
        ? this.sourceTargetIntersections.sourceTargetIntersections
            .filter((sti) => sti.intersects.includes(element!.id)) // eslint-disable-line @typescript-eslint/no-non-null-assertion
            .map((sti) => sti.targetDataModelId)
        : this.sourceTargetIntersections.sourceTargetIntersections
            .filter((sti) =>
              this.dataElements?.every((de) => sti.intersects.includes(de.id))
            ) // eslint-disable-line @typescript-eslint/no-non-null-assertion
            .map((sti) => sti.targetDataModelId);

    this.dataRequestMenuItems = this.sourceTargetIntersections.dataAccessRequests
      .map((req) => {
        return {
          dataModel: req,
          containsElement: idsOfRequestsContainingElement.includes(req.id ?? ''),
        };
      })
      .sort((a, b) => this.sortService.ascString(a.dataModel.label, b.dataModel.label));

    this.elementLinkedToRequest =
      this.dataRequestMenuItems.filter((obj) => obj.containsElement).length > 0;

    const menuList = this.dataRequestMenuItems
      .filter((obj) => obj.containsElement)
      .map((menuItem) => {
        return menuItem.dataModel.label;
      })
      .join('\n');

    this.tooltipText = menuList
      ? 'Referenced by request(s):\n' + (menuList as TooltipHelpTextOption)
      : this.tooltipText;
  }

  onClickCreateRequest() {
    if (!this.dataElements || this.dataElements?.length === 0) return;

    const event: CreateRequestEvent = {
      item: this.dataElements[0], // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };
    this.createRequest(event);
  }

  createRequest(event: CreateRequestEvent) {
    if (!this.user) {
      this.toastr.error('You must be signed in in order to create data requests.');
      return;
    }

    const getDataElements = (): Observable<DataElementInstance[]> => {
      return this.explorer.getRootDataModel().pipe(
        switchMap((rootModel: DataModelDetail) => {
          return this.dataModelService.elementsInAnotherModel(
            rootModel,
            this.dataElementSearchResultsToDataElementDTOs(
              this.dataElements ?? ([] as DataElementSearchResult[])
            )
          );
        }),
        switchMap((dataElements: DataElement[]) => {
          return of(
            dataElements.map((dataElement) => {
              return dataElement as DataElementInstance;
            })
          );
        })
      );
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

  private dataElementSearchResultsToDataElementDTOs(
    dataElements: DataElementSearchResult[]
  ): DataElementDto[] {
    return dataElements.map((element) => {
      return (
        element
          ? {
              // ...element
              key: element.key,
              id: element.id,
              domainType: element.domainType,
              label: element.label,
              breadcrumbs: element.breadcrumbs,
            }
          : null
      ) as DataElementDto;
    });
  }

  private dataElementDTOsToDataElementSearchResults(
    dataElements: (DataElementDto | null)[]
  ): DataElementSearchResult[] {
    return dataElements.map((element) => {
      return (
        element
          ? {
              ...element,
              isSelected: false,
              isBookmarked: false,
            }
          : null
      ) as DataElementSearchResult;
    });
  }
}
