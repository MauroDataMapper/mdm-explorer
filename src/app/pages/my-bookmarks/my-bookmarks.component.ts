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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of, switchMap, throwError } from 'rxjs';
import {
  BookmarkService,
  SelectableBookmark,
} from 'src/app/data-explorer/bookmark.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  AddToRequestEvent,
  BookMarkCheckedEvent as BookmarkCheckedEvent,
  DataRequest,
  RemoveBookmarkEvent,
} from 'src/app/data-explorer/data-explorer.types';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.scss'],
})
export class MyBookmarksComponent implements OnInit {
  userBookmarks: SelectableBookmark[] = [];
  openDataRequests: DataRequest[] = [];
  sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  constructor(
    private bookmarks: BookmarkService,
    private security: SecurityService,
    private dataRequests: DataRequestsService,
    private explorer: DataExplorerService,
    private toastr: ToastrService
  ) {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user) {
      this.dataRequests.list(user.email).subscribe((requests: DataRequest[]) => {
        this.openDataRequests = [...requests.filter((req) => req.status === 'unsent')];
      });
    }

    this.bookmarks
      .index()
      .pipe(
        switchMap((bookmarks) => {
          const selectableBookmarks: SelectableBookmark[] = [];
          bookmarks.forEach((bookmark) => {
            selectableBookmarks.push({ ...bookmark, isSelected: false });
          });

          return of(selectableBookmarks);
        }),
        switchMap((bookmarks: SelectableBookmark[]) => {
          return forkJoin([this.loadIntersections(bookmarks), of(bookmarks)]);
        })
      )
      .subscribe(([intersections, bookmarks]) => {
        this.sourceTargetIntersections = intersections;
        // userBookmarks must be the last property set as this triggers rendering of the
        // bookmarks list.
        this.userBookmarks = bookmarks;
      });
  }

  onChecked(event: BookmarkCheckedEvent) {
    const toUpdate = this.userBookmarks.find((bm) => bm.id === event.item.id);
    if (toUpdate) toUpdate.isSelected = event.checked;
  }

  onAddToRequest(event: AddToRequestEvent) {
    alert(`Add bookmark: ${event.item} to request with Id: ${event.requestId}`);
  }

  onRemove(event: RemoveBookmarkEvent): void {
    this.bookmarks.remove(event.item).subscribe(() => {
      this.toastr.success(`${event.item.label} removed from bookmarks`);
    });

    this.userBookmarks = this.userBookmarks.filter(
      (bookmark) => bookmark.id !== event.item.id
    );
  }

  onSelectAll(event: MatCheckboxChange) {
    this.userBookmarks = this.userBookmarks.map((bookmark) => {
      return { ...bookmark, isSelected: event.checked };
    });
  }

  private loadIntersections(dataElements: SelectableBookmark[] | undefined) {
    const dataElementIds: Uuid[] = [];

    if (dataElements) {
      dataElements.forEach((item: SelectableBookmark) => {
        dataElementIds.push(item.id);
      });
    }

    return this.explorer.getRootDataModel().pipe(
      switchMap((dataModel) => {
        if (!dataModel.id) {
          return throwError(() => new Error('Root Data Model has no id.'));
        }

        return this.dataRequests.getRequestsIntersections(dataModel.id, dataElementIds);
      })
    );
  }
}
