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
import { ArrowDirection } from 'src/app/shared/directives/arrow.directive';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import {
  CreateRequestComponent,
  NewRequestDialogResult,
} from 'src/app/shared/create-request/create-request.component';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { UserDetails, UserDetailsService } from 'src/app/security/user-details.service';
import { MdmShowErrorComponent } from 'src/app/shared/mdm-show-error/mdm-show-error.component';
import { MatMenuTrigger } from '@angular/material/menu';
import { ConfirmRequestComponent } from 'src/app/shared/confirm-request/confirm-request.component';
import { Observable, OperatorFunction } from 'rxjs';
import { DataElement } from '@maurodatamapper/mdm-resources';

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

  constructor() {}

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

  private showErrorDialog(dialogProps: MatDialogConfig, resultErrors: string[]) {
    dialogProps.data = {
      heading: 'Request creation error',
      subHeading: `The following error occurred while trying to add Data Element '${
        this.item!.label
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
      itemName: this.item!.label,
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
      let resultObservable = new Observable<string[]>((subscriber) => {
        source.subscribe((result: NewRequestDialogResult) => {
          this.showLoadingWheel = true;
          this.newRequestName = result.Name;
          this.newRequestDescription = result.Description;
          if (this.newRequestName !== '' && this.user != null) {
            let fakeSearchResult: DataElementSearchResultSet = {
              count: 1,
              items: new Array(this.item!),
            };
            this.userRequestsService
              .createNewUserRequestFromSearchResults(
                this.newRequestName,
                this.newRequestDescription,
                this.user!,
                fakeSearchResult
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
      return resultObservable;
    };
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
}
