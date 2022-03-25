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
import { Bookmark, BookmarkService } from 'src/app/core/bookmark.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'mdm-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss'],
})
export class BookmarkComponent implements OnInit {
  bookmarks: Bookmark[] = [];

  constructor(private bookmarkService: BookmarkService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.bookmarkService.index().subscribe((result) => {
      this.bookmarks = result;
    });
  }

  remove(bookmark: Bookmark): void {
    this.bookmarkService.remove(bookmark).subscribe((result) => {
      this.bookmarks = result;
      this.toastr.success(`${bookmark.label} removed from bookmarks`);
    });
  }
}
