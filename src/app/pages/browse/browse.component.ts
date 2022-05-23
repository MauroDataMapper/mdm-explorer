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
import { MatSelectionListChange } from '@angular/material/list';
import { DataClass, DataElement } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, filter, finalize, forkJoin, of, switchMap } from 'rxjs';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataElementBasic,
  DataElementSearchParameters,
  mapSearchParametersToParams,
} from 'src/app/data-explorer/data-explorer.types';
import { UserDetails } from 'src/app/security/user-details.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { SecurityService } from 'src/app/security/security.service';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { __createBinding } from 'tslib';

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

  parentDataClasses: DataClass[] = [];
  childDataClasses: DataClass[] = [];
  selected?: DataClass;
  private user: UserDetails | null;

  constructor(
    private dataRequests: DataRequestsService,
    private dataExplorer: DataExplorerService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    private dialogs: DialogService,
    security: SecurityService,
    private broadcast: BroadcastService
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
  }

  createRequest() {
    if (!this.user) {
      this.toastr.error('You must be signed in in order to create data requests.');
      return;
    }

    if (!this.selected) {
      this.toastr.error('You must have selected an element to create a request with.');
      return;
    }

    const getDataElements = () => {
      return this.dataModels.getDataElementsForDataClass(this.selected!).pipe(
        switchMap((dataElements: DataElement[]) => {
          const dataElementBasics = dataElements.map((de) => {
            return {
              id: de.id ?? '',
              label: de.label,
              dataModelId: de.model ?? '',
              dataClassId: de.dataClass ?? '',
              isBookmarked: false,
            } as DataElementBasic;
          });
          return of(dataElementBasics);
        })
      );
    };

    this.dataRequests.createWithDialogs(getDataElements).subscribe((action) => {
      if (action === 'view-requests') {
        this.stateRouter.navigateToKnownPath('/requests');
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
          this.toastr.error(
            'There was a problem getting the data classes required for browsing.'
          );
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
          this.toastr.error(
            'There was a problem getting the data classes required for browsing.'
          );
          return EMPTY;
        })
      )
      .subscribe((dataClasses) => (this.childDataClasses = dataClasses));
  }
}
