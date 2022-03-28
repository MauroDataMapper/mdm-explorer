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
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import {
  DataClass,
  DataModelDetailResponse,
  DataModelSubsetPayload,
  FolderDetail,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  iif,
  map,
  Observable,
  Observer,
  OperatorFunction,
  Subscriber,
  switchMap,
} from 'rxjs';
import { CatalogueService } from 'src/app/catalogue/catalogue.service';
import { DataModelService } from 'src/app/catalogue/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  CreateRequestComponent,
  NewRequestDialogResult,
} from 'src/app/shared/create-request/create-request.component';
import {
  DataElementSearchParameters,
  mapSearchParametersToParams,
} from 'src/app/search/search.types';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { UserDetails, UserDetailsService } from 'src/app/security/user-details.service';
import {
  CatalogueConfiguration,
  CATALOGUE_CONFIGURATION,
} from 'src/app/catalogue/catalogue.types';
import { ConfirmRequestComponent } from 'src/app/shared/confirm-request/confirm-request.component';
import { MdmShowErrorComponent } from 'src/app/shared/mdm-show-error/mdm-show-error.component';
import { LoadingSpinnerComponent } from 'src/app/shared/loading-spinner/loading-spinner.component';
import { ArrowDirection, ArrowDirective } from '../../shared/directives/arrow.directive';

@Component({
  selector: 'mdm-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  parentDataClasses: DataClass[] = [];
  childDataClasses: DataClass[] = [];
  selected?: DataClass;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @ViewChild('parentList') parentDataClassList!: MatSelectionList;
  showLoadingWheel: boolean = false;
  private user: UserDetails | null;
  private newRequestName: string = '';
  private newRequestDescription: string = '';

  constructor(
    private catalogue: CatalogueService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    private userRequestsService: UserRequestsService,
    private createRequestDialog: MatDialog,
    private userDetailsService: UserDetailsService,
    private confirmationDialog: MatDialog,
    private newRequestErrorDialog: MatDialog,
    @Inject(CATALOGUE_CONFIGURATION) private config: CatalogueConfiguration
  ) {
    this.user = userDetailsService.get();
  }

  get isChildDataClassSelected() {
    return this.selected && this.selected.parentDataClass;
  }

  ngOnInit(): void {
    this.loadParentDataClasses();
  }

  createRequest(event: MouseEvent) {
    let dialogProps = new MatDialogConfig();
    dialogProps.height = 'fit-content';
    dialogProps.width = '343px';
    let dialogRef = this.createRequestDialog.open(CreateRequestComponent, dialogProps);

    dialogRef
      .afterClosed()
      .pipe(this.createNewRequestOrBail())
      .subscribe({
        next: (resultErrors: string[]) => {
          if (resultErrors.length == 0) {
            this.showConfirmation(dialogProps);
          } else {
            this.showErrorDialog(dialogProps, resultErrors);
          }
        },
        complete: () => (this.showLoadingWheel = false),
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

  reselectParentDataClass(event: MouseEvent) {
    this.selected = this.parentDataClassList.selectedOptions.selected[0].value;
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

  private showErrorDialog(dialogProps: MatDialogConfig, resultErrors: string[]) {
    dialogProps.data = {
      heading: 'Request creation error',
      subHeading: `The following error occurred while trying to add Data Class '${
        this.selected!.label
      }' to new request '${this.newRequestName}'.`,
      message: resultErrors[0],
      buttonLabel: 'Continue browsing',
    };
    dialogProps.height = 'fit-content';
    dialogProps.width = '400px';
    let errorRef = this.confirmationDialog.open(MdmShowErrorComponent, dialogProps);
    //Restore focus to item that was originally clicked on
    errorRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }

  private showConfirmation(dialogProps: MatDialogConfig) {
    dialogProps.data = {
      itemName: this.selected!.label,
      itemType: 'Data Class',
      requestName: this.newRequestName,
    };
    let confirmationRef = this.confirmationDialog.open(
      ConfirmRequestComponent,
      dialogProps
    );
    //Restore focus to item that was originally clicked on
    confirmationRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }

  private createNewRequestOrBail(): OperatorFunction<any, string[]> {
    return (source: Observable<any>): Observable<string[]> => {
      let x = new Observable<string[]>((subscriber) => {
        source.subscribe((result: NewRequestDialogResult) => {
          this.showLoadingWheel = true;
          this.newRequestName = result.Name;
          this.newRequestDescription = result.Description;
          if (this.newRequestName !== '' && this.user != null) {
            this.userRequestsService
              .createNewUserRequestFromDataClass(
                this.newRequestName,
                this.newRequestDescription,
                this.user!,
                this.selected!
              )
              .subscribe({
                next: (errors: string[]) => {
                  subscriber.next(errors);
                },
                complete: () => subscriber.complete(),
                error: (err) => subscriber.error(err),
              });
          } else {
            subscriber.next([]);
          }
        });
      });
      return x;
    };
  }

  private loadParentDataClasses() {
    this.catalogue
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
