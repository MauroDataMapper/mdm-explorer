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
import { ToastrService } from 'ngx-toastr';
import { Bookmark, BookmarkService } from 'src/app/data-explorer/bookmark.service';
import {
  AddToRequestEvent,
  BookMarkCheckedEvent as BookmarkCheckedEvent,
  DataRequest,
  RemoveBookmarkEvent,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.scss'],
})
export class MyBookmarksComponent implements OnInit {
  // A list of the users bookmarks and whether they're selected.
  bookmarksTracker: Map<Bookmark, boolean> = new Map();
  openDataRequests: DataRequest[] = [];

  constructor(
    private bookmarks: BookmarkService,
    private security: SecurityService,
    private dataRequests: DataRequestsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user) {
      this.dataRequests.list(user.email).subscribe((requests: DataRequest[]) => {
        this.openDataRequests = [...requests.filter((req) => req.status === 'unsent')];
      });
    }

    this.bookmarks.index().subscribe((result) => {
      result.forEach((bookmark) => {
        this.bookmarksTracker.set(bookmark, false);
      });
    });
  }

  onChecked(event: BookmarkCheckedEvent) {
    this.bookmarksTracker.set(event.item, event.checked);
  }

  onAddToRequest(event: AddToRequestEvent) {
    alert(`Add bookmark: ${event.item} to request with Id: ${event.requestId}`);
  }

  onRemove(event: RemoveBookmarkEvent): void {
    this.bookmarks.remove(event.item).subscribe(() => {
      this.bookmarksTracker.delete(event.item);
      this.toastr.success(`${event.item.label} removed from bookmarks`);
    });
  }

  onSelectAll(event: MatCheckboxChange) {
    this.bookmarksTracker.forEach((val, key) => {
      this.bookmarksTracker.set(key, event.checked);
    });
  }
}
