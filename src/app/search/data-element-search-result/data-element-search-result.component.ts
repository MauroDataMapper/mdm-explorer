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
import { Component, EventEmitter, Input, Output, ViewChild, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Bookmark } from 'src/app/core/bookmark.service';
import {
  DataElementBookmarkEvent,
  DataElementCheckedEvent,
  DataElementSearchResult,
  DataElementSearchResultSet,
} from '../search.types';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  CreateRequestComponent,
  NewRequestDialogResult,
} from 'src/app/shared/create-request/create-request.component';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { UserDetails, UserDetailsService } from 'src/app/security/user-details.service';
import {
  MdmShowErrorComponent,
  ShowErrorData,
} from 'src/app/shared/mdm-show-error/mdm-show-error.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConfirmComponent, ConfirmData } from 'src/app/shared/confirm/confirm.component';
import { filter, map, mergeMap, Observable, OperatorFunction, tap } from 'rxjs';
import { DataModel } from '@maurodatamapper/mdm-resources';
import { MdmShowErrorService } from 'src/app/core/mdm-show-error.service';
import { ConfirmService } from 'src/app/core/confirm-service';

@Component({
  selector: 'mdm-data-element-search-result',
  templateUrl: './data-element-search-result.component.html',
  styleUrls: ['./data-element-search-result.component.scss'],
})
export class DataElementSearchResultComponent {
  @Input() item?: DataElementSearchResult;

  @Input() showBreadcrumb = false;

  @Input() bookmarks: Bookmark[] = [];

  @Output() checked = new EventEmitter<DataElementCheckedEvent>();

  @Output() bookmark = new EventEmitter<DataElementBookmarkEvent>();
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;

  public showLoadingWheel = false;
  private user: UserDetails | null;

  constructor(
    private userRequestsService: UserRequestsService,
    private createRequestDialog: MatDialog,
    private userDetailsService: UserDetailsService,
    private confirmationDialog: MatDialog,
    private showErrorService: MdmShowErrorService,
    private confirmationService: ConfirmService
  ) {
    this.user = userDetailsService.get();
  }

  itemChecked(event: MatCheckboxChange) {
    if (!this.item) {
      return;
    }

    this.checked.emit({ item: this.item, checked: event.checked });
  }

  toggleBookmark(selected: boolean) {
    if (!this.item) {
      return;
    }

    this.bookmark.emit({ item: this.item, selected });
  }

  createRequest() {
    const dialogProps = new MatDialogConfig();
    dialogProps.height = 'fit-content';
    dialogProps.width = '343px';
    const dialogRef = this.createRequestDialog.open(CreateRequestComponent, dialogProps);

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

  /**
   * Is this.item bookmarked?
   *
   * @returns boolean true if this.item is stored in this.bookmarks
   */
  isBookmarked(): boolean {
    let found: boolean;
    found = false;

    this.bookmarks.forEach((bookmark: Bookmark) => {
      if (this.item && this.item.id === bookmark.id) found = true;
    });

    return found;
  }

  private showErrorDialog(requestName: string, resultErrors: string[]) {
    let errorData: ShowErrorData = {
      heading: 'Request creation error',
      subheading: `The following error occurred while trying to add Data Element '${
        this.item!.label // eslint-disable-line @typescript-eslint/no-non-null-assertion
      }' to new request '${requestName}'.`,
      message: resultErrors[0],
      buttonLabel: 'Continue searching',
    };
    const errorRef = this.showErrorService.open(errorData, 400);
    // Restore focus to item that was originally clicked on
    errorRef.afterClosed().subscribe(() => this.menuTrigger.focus());
  }

  private showConfirmation(requestName: string) {
    let confirmationData: ConfirmData = {
      heading: 'New request created',
      subheading: `Data Element added to new request: '${requestName}'`,
      content: [this.item!.label],
      buttonActionCaption: 'View Requests',
      buttonCloseCaption: 'Continue Browsing',
      buttonActionCallback: () => true, //This will ultimately open the "Browse Requests" page
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
        //side-effect: show the loading wheel
        tap(() => (this.showLoadingWheel = true)),
        //if the user didn't enter a name or clicked cancel, then bail
        filter((result) => result.Name !== '' && this.user != null),
        //Do the doings
        mergeMap((result) => {
          const fakeSearchResult: DataElementSearchResultSet = {
            totalResults: 1,
            pageSize: 0,
            page: 0,
            items: new Array(this.item!), // eslint-disable-line @typescript-eslint/no-non-null-assertion
          };
          return this.userRequestsService.createNewUserRequestFromSearchResults(
            result.Name,
            result.Description,
            this.user!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            fakeSearchResult
          );
        }),
        //retain just the label, which is the only interesting bit (at the moment)
        map(([dataModel, errors]) => [dataModel.label, errors])
      );
    };
  }
}
