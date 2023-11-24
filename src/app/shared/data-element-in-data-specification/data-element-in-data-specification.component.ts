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
import { StateRouterService } from '../../core/state-router.service';
import {
  DataSpecificationSourceTargetIntersections,
  DataSpecificationService,
} from '../../data-explorer/data-specification.service';
import { SecurityService } from '../../security/security.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MdmEndpointsService } from '../../mauro/mdm-endpoints.service';
import {
  DataElementDto,
  DataElementInstance,
  DataElementSearchResult,
} from '../../data-explorer/data-explorer.types';
import { UserDetails } from '../../security/user-details.service';
import { ToastrService } from 'ngx-toastr';
import { BroadcastService } from '../../core/broadcast.service';
import { DialogService } from '../../data-explorer/dialog.service';
import { DataSpecificationUpdatedData } from '../../data-explorer/data-specification-updated-dialog/data-specification-updated-dialog.component';
import { DataExplorerService } from '../../data-explorer/data-explorer.service';
import { TooltipHelpTextOption } from '../bookmark-toggle/bookmark-toggle.component';
import { Sort } from '../../mauro/sort.type';
import { DataModelService } from '../../mauro/data-model.service';

export interface CreateDataSpecificationEvent {
  item: DataElementSearchResult;
}

export interface DataSpecificationElementAddDeleteEvent {
  adding: boolean;
  dataModel: DataModel;
  dataElement: DataElementInstance;
}

export interface DataSpecificationMenuItem {
  dataModel: DataModel;
  containsElement: boolean;
}
@Component({
  selector: 'mdm-data-element-in-data-specification',
  templateUrl: './data-element-in-data-specification.component.html',
  styleUrls: ['./data-element-in-data-specification.component.scss'],
})
export class DataElementInDataSpecificationComponent implements OnInit, OnDestroy {
  @Input() dataElements?: DataElementSearchResult[];
  @Input() caption = 'Add to data specification';

  @Input() sourceTargetIntersections: DataSpecificationSourceTargetIntersections;
  @Input() suppressViewDataSpecificationsDialogButton = false;

  @Output() createDataSpecificationClicked =
    new EventEmitter<CreateDataSpecificationEvent>();
  @Output() dataSpecificationAddDelete =
    new EventEmitter<DataSpecificationElementAddDeleteEvent>();

  ready = false;

  // The list of items in the createDataSpecification menu
  dataSpecificationMenuItems: DataSpecificationMenuItem[] = [];
  elementLinkedToDataSpecification = false;
  tooltipText = 'Assigned to Data Specification';
  processingChangedEvent = false;

  private user: UserDetails | null;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    security: SecurityService,
    private stateRouter: StateRouterService,
    private dataSpecification: DataSpecificationService,
    private endpoints: MdmEndpointsService,
    private dialogs: DialogService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    private explorer: DataExplorerService,
    private dataModelService: DataModelService,
  ) {
    this.user = security.getSignedInUser();
    this.sourceTargetIntersections = {
      dataSpecifications: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    if (this.user === null) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }

    this.subscribeIntersectionsRefreshed();
    this.refreshDataSpecificationMenuItems();

    this.ready = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Do a subset operation to add or remove this data element from the
   * data specification data model (target data model) whose ID is specified in event.source.value
   *
   * @param event
   */
  changed(event: MatCheckboxChange, item: DataModel) {
    this.processingChangedEvent = true;

    let dataElements: DataElementSearchResult[];
    if (this.dataElements && this.dataElements?.length !== 0) {
      const targetDataModelId = event.source.value;
      const datamodelSubsetPayload: DataModelSubsetPayload = {
        additions: [],
        deletions: [],
      };

      dataElements = this.dataElements;

      this.broadcast.loading({
        isLoading: true,
        caption: 'Updating your data specification...',
      });

      this.explorer
        .getRootDataModel()
        .pipe(
          switchMap((rootModel: DataModelDetail) => {
            return this.dataModelService.elementsInAnotherModel(
              rootModel,
              this.dataElementSearchResultsToDataElementDTOs(dataElements),
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
              // Do a subset add for this data element in the data specification
              datamodelSubsetPayload.additions = transposedDataElements.map(
                (de) => de.id,
              );
            } else {
              // Do a subset remove for this data element in the data
              // specification
              datamodelSubsetPayload.deletions = transposedDataElements.map(
                (de) => de.id,
              );
            }
            return this.endpoints.dataModel.copySubset(
              transposedDataElements[0].model,
              targetDataModelId,
              datamodelSubsetPayload,
            );
          }),
          finalize(() => {
            this.processingChangedEvent = false;
            this.broadcast.loading({ isLoading: false });
          }),
        )
        .subscribe(() => {
          // Communicate change to the outside world
          if (dataElements) {
            dataElements.forEach((dataElement) => {
              const addDeleteEventData: DataSpecificationElementAddDeleteEvent = {
                adding: event.checked,
                dataElement,
                dataModel: item,
              };
              this.dataSpecificationAddDelete.emit(addDeleteEventData);
            });
            // Really this is an update rather than add, but broadcasting data-specification-added has the effect we want
            // i.e. forcing intersections to be refreshed
            this.broadcast.dispatch('data-specification-added');
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

          const dataSpecificationUpdatedData: DataSpecificationUpdatedData = {
            dataSpecification: item,
            addedElements: event.checked ? dataElementInstances : [],
            removedElements: !event.checked ? dataElementInstances : [],
          };

          return this.dialogs
            .openDataSpecificationUpdated(dataSpecificationUpdatedData)
            .afterClosed()
            .subscribe((action) => {
              if (action === 'view-data-specifications') {
                this.stateRouter.navigateToKnownPath('/dataSpecifications');
              } else if (action === 'view-data-specification-detail') {
                this.stateRouter.navigateTo(['/dataSpecifications', item.id]);
              }
            });
        }); // eslint-disable-line @typescript-eslint/no-unsafe-argument
    }
  }

  refreshDataSpecificationMenuItems(): void {
    if (!this.dataElements || this.dataElements?.length === 0) return;

    const element = this.dataElements[0];

    const idsOfDataSpecificationsContainingElement =
      this.dataElements?.length === 1
        ? this.sourceTargetIntersections.sourceTargetIntersections
            .filter((sti) => sti.intersects.includes(element!.id)) // eslint-disable-line @typescript-eslint/no-non-null-assertion
            .map((sti) => sti.targetDataModelId)
        : this.sourceTargetIntersections.sourceTargetIntersections
            .filter(
              (sti) => this.dataElements?.every((de) => sti.intersects.includes(de.id)),
            ) // eslint-disable-line @typescript-eslint/no-non-null-assertion
            .map((sti) => sti.targetDataModelId);

    this.dataSpecificationMenuItems = this.sourceTargetIntersections.dataSpecifications
      .map((specification) => {
        return {
          dataModel: specification,
          containsElement: idsOfDataSpecificationsContainingElement.includes(
            specification.id ?? '',
          ),
        };
      })
      .sort((a, b) => Sort.ascString(a.dataModel.label, b.dataModel.label));

    this.elementLinkedToDataSpecification =
      this.dataSpecificationMenuItems.filter((obj) => obj.containsElement).length > 0;

    const menuList = this.dataSpecificationMenuItems
      .filter((obj) => obj.containsElement)
      .map((menuItem) => {
        return menuItem.dataModel.label;
      })
      .join('\n');

    this.tooltipText = menuList
      ? 'Referenced by data specifications(s):\n' + (menuList as TooltipHelpTextOption)
      : this.tooltipText;
  }

  onClickCreateDataSpecification() {
    if (!this.dataElements || this.dataElements?.length === 0) return;

    const event: CreateDataSpecificationEvent = {
      item: this.dataElements[0], // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };
    this.createDataSpecification(event);
  }

  createDataSpecification(event: CreateDataSpecificationEvent) {
    if (!this.user) {
      this.toastr.error('You must be signed in in order to create data specifications.');
      return;
    }

    const getDataElements = (): Observable<DataElementInstance[]> => {
      return this.explorer.getRootDataModel().pipe(
        switchMap((rootModel: DataModelDetail) => {
          return this.dataModelService.elementsInAnotherModel(
            rootModel,
            this.dataElementSearchResultsToDataElementDTOs(
              this.dataElements ?? ([] as DataElementSearchResult[]),
            ),
          );
        }),
        switchMap((dataElements: DataElement[]) => {
          return of(
            dataElements.map((dataElement) => {
              return dataElement as DataElementInstance;
            }),
          );
        }),
      );
    };

    this.dataSpecification
      .createWithDialogs(getDataElements, this.suppressViewDataSpecificationsDialogButton)
      .subscribe((response) => {
        if (response.action === 'view-data-specifications') {
          this.stateRouter.navigateToKnownPath('/dataSpecifications');
        } else if (response.action === 'view-data-specification-detail') {
          this.stateRouter.navigateTo([
            '/dataSpecifications',
            response.dataSpecification.id,
          ]);
        }
        this.createDataSpecificationClicked.emit(event);
      });
  }

  /**
   * When intersections are refreshed (which happens after a data specification has been added by another row) make a note for this row
   */
  private subscribeIntersectionsRefreshed(): void {
    this.broadcast
      .on('data-intersections-refreshed')
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((intersections) => {
        this.sourceTargetIntersections = intersections;
        this.refreshDataSpecificationMenuItems();
      });
  }

  private dataElementSearchResultsToDataElementDTOs(
    dataElements: DataElementSearchResult[],
  ): DataElementDto[] {
    return dataElements.map((element) => {
      return (
        element
          ? {
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
    dataElements: (DataElementDto | null)[],
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
