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
  SimpleModelVersionTree,
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
import { BroadcastService } from '../../core/broadcast.service';
import {
  DataClassWithElements,
  DataElementMultipleOperationResult,
  DataElementOperationResult,
  DataElementSearchResult,
  DataItemDeleteEvent,
  DataSpecification,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  DataSchema,
  mapToDataSpecification,
  QueryCondition,
} from '../../data-explorer/data-explorer.types';
import {
  DataSpecificationSourceTargetIntersections,
  DataSpecificationService,
} from '../../data-explorer/data-specification.service';
import { DialogService } from '../../data-explorer/dialog.service';
import {
  OkCancelDialogData,
  OkCancelDialogResponse,
} from '../../data-explorer/ok-cancel-dialog/ok-cancel-dialog.component';
import { DataSchemaService } from '../../data-explorer/data-schema.service';
import { ResearchPluginService } from '../../mauro/research-plugin.service';
import { DataSpecificationElementAddDeleteEvent } from '../../shared/data-element-in-data-specification/data-element-in-data-specification.component';
import { ShareDataSpecificationDialogInputOutput } from 'src/app/data-explorer/share-data-specification-dialog/share-data-specification-dialog.component';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { SecurityService } from '../../security/security.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { FolderService } from 'src/app/mauro/folder.service';
import { VersionTreeSortingService } from 'src/app/data-explorer/version-tree-sorting.service';
import { SpecificationSubmissionService } from 'src/app/data-explorer/specification-submission/specification-submission.service';
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
  selector: 'mdm-my-data-specification-detail',
  templateUrl: './my-data-specification-detail.component.html',
  styleUrls: ['./my-data-specification-detail.component.scss'],
})
export class MyDataSpecificationDetailComponent implements OnInit, OnDestroy {
  dataSpecification?: DataSpecification;
  state: 'idle' | 'loading' = 'idle';
  sourceTargetIntersections: DataSpecificationSourceTargetIntersections;
  emptyQueryCondition: QueryCondition = {
    condition: 'and',
    entity: '',
    rules: [],
  };
  cohortQueryType: DataSpecificationQueryType = 'cohort';
  cohortQuery = this.emptyQueryCondition;
  dataQueryType: DataSpecificationQueryType = 'data';
  dataQuery = this.emptyQueryCondition;
  dataSchemas: DataSchema[] = [];
  isEmpty = false;

  // To store all dataElements of this data specification.
  allElements?: DataElementSearchResult[];

  // Binds to the checked property of the "select all" checkbox
  allElementsSelected = false;

  // When no element is selected (!anyElementSelected) the
  // remove selected button is disabled.
  anyElementSelected = false;

  // Whether the creator of the data spec
  // is the current user or not.
  // A user that is not the owner cannot edit
  currentUserOwnsDataSpec = false;

  version = '';

  newerVersionExists = false;
  currentVersionIsLatest = false;

  /**
   * Signal to attach to subscriptions to trigger when they should be unsubscribed.
   */
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private stateRouter: StateRouterService,
    private dataSpecificationService: DataSpecificationService,
    private toastr: ToastrService,
    private researchPlugin: ResearchPluginService,
    private dialogs: DialogService,
    private broadcastService: BroadcastService,
    private dataSchemaService: DataSchemaService,
    private dataModels: DataModelService,
    private securityService: SecurityService,
    private folderService: FolderService,
    private versionSorter: VersionTreeSortingService,
    private specificationSubmissionService: SpecificationSubmissionService
  ) {
    this.sourceTargetIntersections = {
      dataSpecifications: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    this.initialiseDataSpecification();
    this.subscribeDataSpecificationChanges();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSelectAll() {
    if (this.allElementsSelected) {
      this.selectOrUnselectAllDataElements(false);
    } else {
      this.selectOrUnselectAllDataElements(true);
    }

    this.updateAllOrSomeChildrenSelectedHandler();
  }

  submitDataSpecification(): void {
    const specificationId = this.dataSpecification?.id;

    if (!specificationId) {
      return;
    }
    this.specificationSubmissionService.submit(specificationId).subscribe((result: boolean) => {
      console.log('Specification submission: ', result);
    });
  }

  finaliseDataSpecification() {
    if (
      !this.dataSpecification ||
      !this.dataSpecification.id ||
      this.dataSpecification.status !== 'unsent'
    ) {
      return;
    }

    this.confirmFinaliseDataSpecification()
      .afterClosed()
      .pipe(
        filter((response) => response?.result ?? false),
        switchMap(() => {
          if (!this.dataSpecification || !this.dataSpecification.id) {
            return EMPTY;
          }

          this.broadcastService.loading({
            isLoading: true,
            caption: 'Finalising your data specification...',
          });
          return this.researchPlugin.finaliseDataSpecification(this.dataSpecification.id);
        }),
        switchMap((dataModel) => {
          // Refresh the current state of the data specification in view
          return this.setDataSpecification(mapToDataSpecification(dataModel));
        }),
        switchMap(([dataSchemas, intersections, versionTree]) => {
          if (dataSchemas && intersections && versionTree) {
            this.setDataSchemasIntersectionsAndVersionTree(
              dataSchemas,
              intersections,
              versionTree
            );
          }

          // Refresh finalised state in the backend (equivalent to click the refresh)
          // button in mdm-ui
          return this.folderService.treeList();
        }),
        catchError(() => {
          this.toastr.error(
            'There was a problem finalising your data specification. Please try again or contact us for support.',
            'Finalising error',
          );
          return EMPTY;
        }),
        finalize(() => this.broadcastService.loading({ isLoading: false })),
      )
      .subscribe(() => {
        this.broadcastService.dispatch('data-specification-finalised');

        this.dialogs.openSuccess({
          heading: 'Data specification finalised.',
          message: `Your data specification "${this.dataSpecification?.label}" has been successfully finalised.`,
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

  // Listens for external update to the data specification and refreshes if so.
  handleDataSpecificationElementsChange(event: DataSpecificationElementAddDeleteEvent) {
    if (event.dataModel?.id === this.dataSpecification?.id) {
      this.setDataSpecification(this.dataSpecification).subscribe(
        ([dataSchemas, intersections, versionTree]) => {
          if (dataSchemas && intersections && versionTree) {
            this.setDataSchemasIntersectionsAndVersionTree(
              dataSchemas,
              intersections,
              versionTree
            );
          }
        }
      );
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
        }),
        switchMap(({ deletedElements, deletedClasses, deletedSchemas, dataQuery, cohortQuery }) => {
          this.refreshQueries(dataQuery, cohortQuery);

          const success = deletedElements.failures.length === 0;
          let message = `${deletedElements.successes.length} Data element${deletedElements.successes.length === 1 ? '' : 's'
            } removed from data specification "${this.dataSpecification?.label}".`;
          if (!success) {
            message += `\r\n${deletedElements.failures.length} Data element${deletedElements.failures.length === 1 ? '' : 's'
              } caused an error.`;
            deletedElements.failures.forEach((item: DataElementOperationResult) =>
              console.log(item.message)
            );
          }

          const classSuccess = deletedClasses.failures.length === 0;
          if (!classSuccess) {
            message += `\r\n${deletedClasses.failures.length} Data class${deletedClasses.failures.length === 1 ? '' : 'es'
              } caused an error.`;
            deletedClasses.failures.forEach((item: DataElementOperationResult) =>
              console.log(item.message)
            );
          }

          const schemaSuccess = deletedSchemas.failures.length === 0;
          if (!schemaSuccess) {
            message += `\r\n${deletedSchemas.failures.length} Data schema${deletedSchemas.failures.length === 1 ? '' : 's'
              } caused an error.`;
            deletedSchemas.failures.forEach((item: DataElementOperationResult) =>
              console.log(item.message)
            );
          }

          this.processRemoveDataElementResponse(success, message);

          return this.setDataSpecification(this.dataSpecification);
        })
      )
      .subscribe(([dataSchemas, intersections, versionTree]) => {
        if (dataSchemas && intersections && versionTree) {
          this.setDataSchemasIntersectionsAndVersionTree(dataSchemas, intersections, versionTree);
        }

        this.broadcastService.loading({ isLoading: false });
      });
  }

  copyDataSpecification() {
    if (
      !this.dataSpecification ||
      !this.dataSpecification.id ||
      !this.dataSpecification.modelVersion ||
      this.dataSpecification.status !== 'finalised'
    ) {
      return;
    }

    this.dataSpecificationService
      .getDataSpecificationFolder()
      .pipe(
        switchMap((dataSpecificationFolder) => {
          if (!this.dataSpecification) {
            return EMPTY;
          }

          return this.dataSpecificationService.forkWithDialogs(this.dataSpecification, {
            targetFolder: dataSpecificationFolder,
          });
        })
      )
      .subscribe();
  }

  /**
   * Opens a dialog for the user to update the data specification.
   * Then, updates {@link dataSpecification}.
   *
   * @returns void
   */
  editDataSpecification() {
    if (!this.dataSpecification || !this.dataSpecification.id) {
      return;
    }

    this.dataSpecificationService
      .updateWithDialog(
        this.dataSpecification.id,
        this.dataSpecification.label,
        this.dataSpecification.description
      )
      .subscribe((response: DataModelDetail) => {
        if (!response || !this.dataSpecification) {
          return;
        }

        this.dataSpecification.description = response.description;
        this.dataSpecification.label = response.label;
      });
  }

  shareDataSpecification() {
    if (!this.dataSpecification || !this.dataSpecification.id) {
      return;
    }
    const id: string = this.dataSpecification.id;

    this.dataSpecificationService
      .shareWithDialog(this.dataSpecification.readableByAuthenticatedUsers as boolean)
      .pipe(
        filter(
          (dialogResponse) =>
            dialogResponse &&
            this.dataSpecification?.readableByAuthenticatedUsers !==
              dialogResponse.sharedWithCommunity
        ),
        switchMap(
          (
            response: ShareDataSpecificationDialogInputOutput
          ): Observable<DataModelDetail> => {
            if (response.sharedWithCommunity) {
              return this.dataModels.updateReadByAuthenticated(id);
            } else {
              return this.dataModels.removeReadByAuthenticated(id);
            }
          }
        )
      )
      .subscribe((updatedDataSpec) => {
        if (!updatedDataSpec || !this.dataSpecification || !this.dataSpecification.id) {
          return;
        }

        this.dataSpecification.readableByAuthenticatedUsers =
          updatedDataSpec.readableByAuthenticatedUsers;

        if (updatedDataSpec.readableByAuthenticatedUsers) {
          this.toastr.success('Data specification shared with the community');
        } else {
          this.toastr.success('Data specification not shared anymore');
        }
      });
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

  /** Handling of versions */
  handleViewDifferentVersion(dataSpecId: string) {
    this.stateRouter.navigateTo(['/dataSpecifications', dataSpecId]);
  }

  handleNewVersionClick() {
    this.okCancel(
      'Create New Version',
      'Do you want to create a new version of this data Specification? You will be redirected to the new version details page'
    )
      .afterClosed()
      .pipe(
        switchMap(
          (
            okCancelDialogResponse?: OkCancelDialogResponse
          ): Observable<DataModelDetail> => {
            if (!okCancelDialogResponse || !this.dataSpecification) {
              return EMPTY;
            }

            this.broadcastService.loading({
              isLoading: true,
              caption: 'Creating new version...',
            });

            return this.dataModels.createNextVersion(this.dataSpecification);
          }
        ),
        catchError(() => {
          this.toastr.error(
            'There was a problem creating a new version of your data specification.' +
              ' Please try again or contact us for support.',
            'New version error'
          );
          return EMPTY;
        }),
        finalize(() => this.broadcastService.loading({ isLoading: false }))
      )
      .subscribe((newVersion?) => {
        this.stateRouter.navigateTo(['/dataSpecifications', newVersion.id]);
      });
  }

  // Can mark all the children (schema, dataClass and dataElements)
  // of this data specification as either selected or not.
  private selectOrUnselectAllDataElements(valueToSet: boolean) {
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

  private initialiseDataSpecification(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const dataSpecificationId: Uuid = params.dataSpecificationId;
          this.state = 'loading';
          return this.dataSpecificationService.get(dataSpecificationId);
        }),
        switchMap((dataSpecification) => {
          return this.setDataSpecification(dataSpecification);
        }),
        catchError((error) => {
          this.toastr.error(`Invalid Data Specification Id. ${error}`);
          this.state = 'idle';
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe(([dataSchemas, intersections, versionTree]) => {
        if (dataSchemas && intersections && versionTree) {
          this.setDataSchemasIntersectionsAndVersionTree(
            dataSchemas,
            intersections,
            versionTree
          );
        }
      });
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
    this.toastr.error('There was a problem locating your data specification details.');
    return EMPTY;
  }

  /**
   * Methods for loading/reloading data specification data.
   */
  private setDataSpecification(
    dataSpecification?: DataSpecification
  ): Observable<
    [
      DataSchema[]?,
      DataSpecificationSourceTargetIntersections?,
      SimpleModelVersionTree[]?
    ]
  > {
    this.dataSpecification = dataSpecification;
    if (!this.dataSpecification || !this.dataSpecification.id) {
      return of([]);
    }
    this.state = 'loading';
    const dataSpecId: string = dataSpecification?.id as string;

    const currentUser = this.securityService.getSignedInUser();

    if (!currentUser) {
      return of([]);
    }

    const currentUserFullName = currentUser.firstName + ' ' + currentUser.lastName;

    // For some reason, the whitespace in the
    // author property is not the same as here in code
    // so we have to remove the spaces and then compare
    this.currentUserOwnsDataSpec =
      this.dataSpecification.author.replace('\\s', '') ===
      currentUserFullName.replace('\\s', '');

    // Set queries
    if (!this.dataSpecification?.id) {
      return of([]);
    }

    this.dataSpecificationService
      .getQuery(this.dataSpecification.id, this.cohortQueryType)
      .subscribe((query) => {
        if (!query) {
          this.cohortQuery = this.emptyQueryCondition;
        } else {
          this.cohortQuery = query.condition;
        }
      });

    this.dataSpecificationService
      .getQuery(this.dataSpecification.id, this.dataQueryType)
      .subscribe((query) => {
        if (!query) {
          this.dataQuery = this.emptyQueryCondition;
        } else {
          this.dataQuery = query.condition;
        }
      });

    return this.dataSchemaService.loadDataSchemas(this.dataSpecification).pipe(
      defaultIfEmpty(undefined),
      switchMap((dataSchemas: DataSchema[] | undefined) => {
        return forkJoin([
          of(dataSchemas ?? []),
          this.loadIntersections(dataSchemas ?? []),
          this.dataModels.simpleModelVersionTree(dataSpecId, false),
        ]) as Observable<
          [
            DataSchema[],
            DataSpecificationSourceTargetIntersections,
            SimpleModelVersionTree[]
          ]
        >;
      }),
      catchError(() => {
        return this.loadError();
      }),
      finalize(() => (this.state = 'idle'))
    );
    //
  }

  private setDataSchemasIntersectionsAndVersionTree(
    dataSchemas: DataSchema[],
    intersections: DataSpecificationSourceTargetIntersections,
    versionTree: SimpleModelVersionTree[]
  ) {
    this.dataSchemas = dataSchemas;
    this.isEmpty =
      this.dataSchemaService.reduceDataElementsFromSchemas(this.dataSchemas).length === 0;
    this.sourceTargetIntersections = intersections;

    // A newer draft version already exists
    this.newerVersionExists =
      versionTree.findIndex((node) => node.branch === 'main') >= 0;

    // When all versions are submitted, there will be no main version, in that case
    // If the current version is not the latest version, disable the new version button.

    // Sort order versions, but those are strings of dot separate numbers, so we need sorting function
    // When a data specification is not submitted the model version is undefined and the sorting
    // will ignore it. That is ok, since when data spec is not submitted the button will be hidden
    const orderedTree = versionTree.sort(this.versionSorter.compareModelVersion());
    this.currentVersionIsLatest =
      orderedTree.slice(-1)[0]?.id === this.dataSpecification?.id;
  }

  // intersections are data elements that are part of the data specification
  private loadIntersections(
    dataSchemas: DataSchema[]
  ): Observable<DataSpecificationSourceTargetIntersections> {
    const dataElementIds: Uuid[] = this.dataSchemaService
      .reduceDataElementsFromSchemas(dataSchemas)
      .map((element) => element.id);

    return of(this.dataSpecification).pipe(
      switchMap((dataSpecification) => {
        if (dataSpecification?.id) {
          return this.dataSpecificationService.getDataSpecificationIntersections(
            dataSpecification.id,
            dataElementIds
          );
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
    // Refresh the data specification.
    this.setDataSpecification(this.dataSpecification).subscribe(
      ([dataSchemas, intersections, versionTree]) => {
        if (dataSchemas && intersections && versionTree) {
          this.setDataSchemasIntersectionsAndVersionTree(
            dataSchemas,
            intersections,
            versionTree
          );
        }
      }
    );
  }

  private subscribeDataSpecificationChanges() {
    this.broadcastService
      .on('data-specification-added')
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.loadIntersections(this.dataSchemas))
      )
      .subscribe((intersections) => {
        this.sourceTargetIntersections = intersections;
        this.broadcastService.dispatch('data-intersections-refreshed', intersections);
      });
  }

  /**
   * Methods for managing the okCancel dialogs.
   */
  private confirmFinaliseDataSpecification(): MatDialogRef<OkCancelDialogData> {
    return this.okCancel(
      'Finalise data specification',
      `You are about to finalise your data specification "${this.dataSpecification?.label}" for review. You will not be able to change it further from this point. Do you want to continue?`
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
      `Are you sure you want to remove these ${itemList.length} selected data elements from data specification ${this.dataSpecification?.label}?`
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
        } from data specification ${this.dataSpecification?.label} ...`,
      });
      const dataModel: DataModelDetail = {
        domainType: CatalogueItemDomainType.DataModel,
        label: this.dataSpecification?.label ?? '',
        availableActions: [],
        finalised: false,
        id: this.dataSpecification?.id ?? '',
      };
      return forkJoin([
        of(okCancelDialogResponse),
        this.dataSpecificationService.deleteDataElementMultiple(itemList, dataModel),
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
        this.dataSpecificationService.deleteDataClassMultiple(classList),
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
        this.dataSpecificationService.deleteDataSchemaMultiple(schemaList),
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
    queryType: DataSpecificationQueryType
  ): Observable<DataSpecificationQueryPayload | undefined> {
    if (!this.dataSpecification?.id) {
      return EMPTY;
    }

    return this.dataSpecificationService.deleteDataElementsFromQuery(
      this.dataSpecification.id,
      queryType,
      dataElementLabels
    );
  }

  private refreshQueries(
    dataQuery?: DataSpecificationQueryPayload,
    cohortQuery?: DataSpecificationQueryPayload
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
          confirmationMessage: `Are you sure you want to remove all the data elements belonging to data schema "${event.dataSchema?.schema.label}" from data specification "${this.dataSpecification?.label}" and all their related queries?`,
          loadingMessage: `Removing data elements belonging to schema ${
            event.dataSchema?.schema.label ?? ''
          } from data specification ${this.dataSpecification?.label} ...`,
          successMessage: `Data elements belonging to schema ${event.dataSchema?.schema.label} removed from data specification "${this.dataSpecification?.label}".`,
          failureMessage: `Removal of data elements belonging to schema ${event.dataSchema?.schema.label} failed. The error message is: `,
        };
      case 'dataClass': {
        const dataClassName = event.dataClassWithElements?.dataClass.label;
        return {
          confirmationHeading: 'Remove data class',
          confirmationMessage: `Are you sure you want to remove all the data elements belonging to data class "${dataClassName}" from data specification "${this.dataSpecification?.label}" and all their related queries?`,
          loadingMessage: `Removing data elements belonging to class ${dataClassName} from data specification ${this.dataSpecification?.label} ...`,
          successMessage: `Data elements belonging to class ${dataClassName} removed from data specification "${this.dataSpecification?.label}".`,
          failureMessage: `Removal of data elements belonging to class ${dataClassName} failed. The error message is: `,
        };
      }
      case 'dataElement':
        return {
          confirmationHeading: 'Remove data element',
          confirmationMessage: `Are you sure you want to remove data element "${event.dataElement?.label}" from data specification "${this.dataSpecification?.label}" and all its related queries?`,
          loadingMessage: `Removing data element ${event.dataElement?.label} from data specification ${this.dataSpecification?.label} ...`,
          successMessage: `Data element "${event.dataElement?.label}" removed from data specification "${this.dataSpecification?.label}".`,
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
      return this.dataSpecificationService.deleteDataSchema(dataSchema.schema);
    } else if (dataClass) {
      return this.dataSpecificationService.deleteDataClass(dataClass);
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
      if (this.dataSpecification) {
        const dataModel: DataModelDetail = {
          domainType: CatalogueItemDomainType.DataModel,
          label: this.dataSpecification.label,
          availableActions: [],
          finalised: false,
          id: this.dataSpecification.id,
        };
        return this.dataSpecificationService
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
      return this.dataSpecificationService.deleteDataSchema(event.dataSchema.schema);
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

    // Remove data element from data specification queries.
    return forkJoin({
      dataQuery: this.removeDataElementFromQuery(labels, this.dataQueryType),
      cohortQuery: this.removeDataElementFromQuery(labels, this.cohortQueryType),
      result: of(result),
    });
  }
}
