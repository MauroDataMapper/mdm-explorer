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
import { ToastrService } from 'ngx-toastr';
import { Bookmark, BookmarkService } from 'src/app/data-explorer/bookmark.service';

@Component({
  selector: 'mdm-my-bookmarks',
  templateUrl: './my-bookmarks.component.html',
  styleUrls: ['./my-bookmarks.component.scss'],
})
export class MyBookmarksComponent implements OnInit {
  allBookmarks: Bookmark[] = [];

  constructor(private bookmarks: BookmarkService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.bookmarks.index().subscribe((result) => {
      this.allBookmarks = result;
    });
  }

  remove(bookmark: Bookmark): void {
    this.bookmarks.remove(bookmark).subscribe((result) => {
      this.allBookmarks = result;
      this.toastr.success(`${bookmark.label} removed from bookmarks`);
    });
  }
}
