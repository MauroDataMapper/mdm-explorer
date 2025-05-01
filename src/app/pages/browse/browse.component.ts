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
import { Component, Input, OnInit } from "@angular/core";
import { MatSelectionListChange } from '@angular/material/list';
import { DataClass, DataModel, DataModelSubsetPayload  } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, of, switchMap } from "rxjs";
import { DataModelService } from 'src/app/mauro/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataElementDto,
  DataElementInstance,
  DataElementSearchParameters, DataElementSearchResult, DataSpecification,
  mapSearchParametersToParams,
} from "src/app/data-explorer/data-explorer.types";
import { UserDetails } from 'src/app/security/user-details.service';
import {
  DataSpecificationService,
} from "src/app/data-explorer/data-specification.service";
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import { SecurityService } from 'src/app/security/security.service';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { DialogService } from "../../data-explorer/dialog.service";

@Component({
  selector: 'mdm-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  static readonly ParentDataClassInitialLabel: string = 'Please select a schema &hellip;';
  static readonly ParentDataClassSelectedLabel: string = 'Schemas';
  static readonly ChildDataClassInitialLabel: string = '&nbsp;';
  static readonly ChildDataClassParentClassSelectedLabel: string =
    'Please select a data class &hellip;';
  static readonly ChildDataClassSelectedLabel: string = 'Data classes';
  readonly suppressViewDataSpecificationsDialogButton = false;
  parentDataClasses: DataClass[] = [];
  childDataClasses: DataClass[] = [];
  selected?: DataClass;
  openDataSpecifications: DataSpecification[] = [];
  ready = false;
  dataElements:  DataElementInstance[] = [];

  private user: UserDetails | null;

  constructor(
    private dataSpecification: DataSpecificationService,
    private dataExplorer: DataExplorerService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    security: SecurityService,
    private dialogs: DialogService
  ) {
    this.user = security.getSignedInUser();
  }

  get isChildDataClassSelected(): Uuid | undefined {
    return this.selected && this.selected.parentDataClass;
  }

  get isParentDataClassSelected(): Uuid | undefined {
    return this.selected && (this.selected.parentDataClass || this.selected.id);
  }

  get parentDataClassLabel(): string {
    return this.isParentDataClassSelected
      ? BrowseComponent.ParentDataClassSelectedLabel
      : BrowseComponent.ParentDataClassInitialLabel;
  }

  get childDataClassLabel(): string {
    return this.isChildDataClassSelected
      ? BrowseComponent.ChildDataClassSelectedLabel
      : this.isParentDataClassSelected
      ? BrowseComponent.ChildDataClassParentClassSelectedLabel
      : BrowseComponent.ChildDataClassInitialLabel;
  }

  ngOnInit(): void {
    this.loadParentDataClasses();

    if (this.user && this.dataSpecification) {
      const observableDataSpecification = this.dataSpecification.list();
      if(observableDataSpecification) {
        observableDataSpecification.subscribe((dataSpecifications: DataSpecification[]) => {
          this.openDataSpecifications = [
            ...dataSpecifications.filter((dataSpecification) => dataSpecification.status === "draft"),
          ];
          this.ready = true;
        });
      }
    }
  }

  createDataSpecification() {
    if (!this.user) {
      this.toastr.error('You must be signed in in order to create data specifications.');
      return;
    }

    if (!this.selected) {
      this.toastr.error('You must have selected an element to create a data specification with.');
      return;
    }

    const getDataElements = () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.dataModels.getDataElementsForDataClass(this.selected!).pipe(
        switchMap((dataElements: DataElementDto[]) => {
          const dataElementInstances = dataElements.map((de) => {
            return {
              ...de,
              isBookmarked: false,
            } as DataElementInstance;
          });
          return of(dataElementInstances);
        })
      );
    };

    this.dataSpecification
      .createWithDialogs(getDataElements, this.suppressViewDataSpecificationsDialogButton)
      .subscribe((response) => {
        if (response.action === 'view-data-specifications') {
          this.stateRouter.navigateToKnownPath('/dataSpecifications');
        } else if (response.action === 'view-data-specification-detail') {
          this.stateRouter.navigateTo(['/dataSpecifications', response.dataSpecification.id]);
        }
      });
  }

  selectParentDataClass(event: MatSelectionListChange) {
    const selected = event.options[0].value as DataClass;
    this.selected = selected;
    this.loadChildDataClasses(selected);
  }

  selectChildDataClass(event: MatSelectionListChange) {
    const selected = event.options[0].value as DataClass;
    this.selected = selected;
  }

  reselectDataClass(option: DataClass) {
    this.selected = option;
  }

  viewDetails() {
    if (!this.isChildDataClassSelected) {
      return;
    }

    if (!this.selected || !this.selected.model || !this.selected.id) {
      return;
    }

    const searchParameters: DataElementSearchParameters = {
      dataClass: {
        dataModelId: this.selected.model,
        dataClassId: this.selected.id,
        parentDataClassId: this.selected.parentDataClass,
      },
    };

    const params = mapSearchParametersToParams(searchParameters);
    this.stateRouter.navigateToKnownPath('/search/listing', params);
  }

  private loadParentDataClasses() {
    this.dataExplorer
      .getRootDataModel()
      .pipe(
        catchError(() => {
          this.toastr.error(
            'There was a problem getting the root data model required for browsing.'
          );
          return EMPTY;
        }),
        switchMap((parent) => this.dataModels.getDataClasses(parent)),
        catchError(() => {
          this.toastr.error('There was a problem getting the data classes required for browsing.');
          return EMPTY;
        })
      )
      .subscribe((dataClasses) => (this.parentDataClasses = dataClasses));
  }

  private loadChildDataClasses(parent: DataClass) {
    this.dataModels
      .getDataClasses(parent)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem getting the data classes required for browsing.');
          return EMPTY;
        })
      )
      .subscribe((dataClasses) => (this.childDataClasses = dataClasses));
  }

  onClickAddSelectedToDataSpecification(item: DataModel) {

    if (!this.user) {
      this.toastr.error('You must be signed in in order to create data specifications.');
      return;
    }

    if (!this.selected) {
      this.toastr.error('You must have selected an element to create a data specification with.');
      return;
    }

    const getDataElements = () => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return this.dataModels.getDataElementsForDataClass(this.selected!).pipe(
        switchMap((dataElements: DataElementDto[]) => {
          const dataElementInstances = dataElements.map((de) => {
            return {
              ...de,
              isBookmarked: false,
            } as DataElementInstance;
          });
          return of(dataElementInstances);
        })
      );
    };

    const addDataElementsToModel = (dataElementInstances: DataElementInstance[]) =>
    {
      this.dataElements=dataElementInstances;

      const sourceDataModelId = this.dataElements.length > 0 ? this.dataElements[0].model : null;

      const targetDataModelId = item.id;

      // A payload for subsetting. We only handle additions here, not deletions.
      const datamodelSubsetPayload: DataModelSubsetPayload = {
        additions: this.dataElements.map((de) => de.id),
        deletions: [],
      };

      if (sourceDataModelId && targetDataModelId && datamodelSubsetPayload.additions.length > 0)
      {

        this.dataModels
          .copySubset(sourceDataModelId, targetDataModelId, datamodelSubsetPayload)
          .subscribe(() => {
            // Really this is an update rather than add, but broadcasting data-specification-added has the effect we want
            // i.e. forcing intersections to be refreshed
            return this.dialogs
              .openDataSpecificationUpdated({
                dataSpecification: item,
                addedElements: this.dataElements,
              })
              .afterClosed()
              .subscribe((action :  'continue' | 'view-data-specifications' | 'view-data-specification-detail' | undefined) => {
                if (action === 'view-data-specifications') {
                  this.stateRouter.navigateToKnownPath('/dataSpecifications');
                } else if (action === 'view-data-specification-detail') {
                  this.stateRouter.navigateTo(['/dataSpecifications', item.id]);
                }
              });
          }); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      }
    };

    getDataElements().subscribe(addDataElementsToModel);
  }
}
