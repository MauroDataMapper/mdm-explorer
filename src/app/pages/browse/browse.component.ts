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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSelectionListChange } from '@angular/material/list';
import { DataClass } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import {
  catchError,
  EMPTY,
  filter,
  map,
  mergeMap,
  Observable,
  OperatorFunction,
  switchMap,
  tap,
} from 'rxjs';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  CreateRequestComponent,
  NewRequestDialogResult,
} from 'src/app/shared/create-request/create-request.component';
import {
  DataElementSearchParameters,
  mapSearchParametersToParams,
} from 'src/app/data-explorer/data-explorer.types';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { UserDetails, UserDetailsService } from 'src/app/security/user-details.service';
import { ConfirmData } from 'src/app/data-explorer/confirm/confirm.component';
import { ShowErrorData } from 'src/app/shared/show-error/show-error.component';
import { ShowErrorService } from 'src/app/shared/show-error.service';
import { ConfirmService } from 'src/app/data-explorer/confirm.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';

@Component({
  selector: 'mdm-browse',
  templateUrl: './browse.component.html',
  styleUrls: ['./browse.component.scss'],
})
export class BrowseComponent implements OnInit {
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  parentDataClasses: DataClass[] = [];
  childDataClasses: DataClass[] = [];
  selected?: DataClass;
  showLoadingWheel = false;
  private user: UserDetails | null;

  constructor(
    private dataRequests: DataRequestsService,
    private dataExplorer: DataExplorerService,
    private dataModels: DataModelService,
    private toastr: ToastrService,
    private stateRouter: StateRouterService,
    private theMatDialog: MatDialog,
    private showErrorService: ShowErrorService,
    private confirmationService: ConfirmService,
    userDetailsService: UserDetailsService
  ) {
    this.user = userDetailsService.get();
  }

  get isChildDataClassSelected() {
    return this.selected && this.selected.parentDataClass;
  }

  ngOnInit(): void {
    this.loadParentDataClasses();
  }

  createRequest() {
    const dialogProps = new MatDialogConfig();
    dialogProps.height = 'fit-content';
    dialogProps.width = '343px';
    const dialogRef = this.theMatDialog.open(CreateRequestComponent, dialogProps);

    dialogRef
      .afterClosed()
      .pipe(this.createNewRequestOrBail())
      .subscribe({
        next: ([requestName, resultErrors]: [string, string[]]) => {
          if (resultErrors.length === 0) {
            this.showConfirmation(requestName);
          } else {
            this.showErrorDialog(requestName, resultErrors);
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

  private showErrorDialog(requestName: string, resultErrors: string[]) {
    // Restore focus to item that was originally clicked on
    const errorData: ShowErrorData = {
      heading: 'Request creation error',
      subheading: `The following error occurred while trying to add Data Class '${
        this.selected!.label // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }' to new request '${requestName}'.`,
      message: resultErrors[0],
      buttonLabel: 'Continue browsing',
    };
    const errorRef = this.showErrorService.open(errorData, 400);
    errorRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }

  private showConfirmation(requestName: string) {
    const confirmationData: ConfirmData = {
      heading: 'New request created',
      subheading: `Data Class added to new request: '${requestName}'`,
      content: [this.selected!.label], // eslint-disable-line @typescript-eslint/no-non-null-assertion
      buttonActionCaption: 'View Requests',
      buttonCloseCaption: 'Continue Browsing',
      buttonActionCallback: () => true, // This will ultimately open the "Browse Requests" page
    };
    const confirmationRef = this.confirmationService.open(confirmationData, 343);
    // Restore focus to item that was originally clicked on
    confirmationRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }

  private createNewRequestOrBail(): OperatorFunction<
    NewRequestDialogResult,
    [string, string[]]
  > {
    return (source: Observable<NewRequestDialogResult>) => {
      return source.pipe(
        // side-effect: show the loading wheel
        tap(() => (this.showLoadingWheel = true)),
        // if the user didn't enter a name or clicked cancel, then bail
        filter((result) => result.Name !== '' && this.user != null),
        // Do the doings
        mergeMap((result) => {
          return this.dataRequests.createNewUserRequestFromDataClass(
            result.Name,
            result.Description,
            this.user!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            this.selected! // eslint-disable-line @typescript-eslint/no-non-null-assertion
          );
        }),
        // retain just the label, which is the only interesting bit (at the moment)
        map(([dataModel, errors]) => [dataModel.label, errors])
      );
    };
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
