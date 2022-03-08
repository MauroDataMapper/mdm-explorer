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
import { Bookmark } from 'src/app/model/bookmark';
import { BookmarkService } from 'src/app/core/bookmark.service';

@Component({
  selector: 'mdm-bookmark',
  templateUrl: './bookmark.component.html',
  styleUrls: ['./bookmark.component.scss']
})
export class BookmarkComponent implements OnInit {

  bookmarks: Bookmark[] = [];

  constructor(
    private bookmarkService: BookmarkService
  ) {  }

  ngOnInit(): void {
    // A bootstrapped bookmark for testing
    // Delete when there is a way to add a bookmark
    const bookmark1: Bookmark = new Bookmark('Bookmarked item 1');
    this.bookmarkService.add(bookmark1);

    const bookmark2: Bookmark = new Bookmark('Bookmarked item 2');
    this.bookmarkService.add(bookmark2);
    // End of bootstrapping

    this.bookmarks = this.bookmarkService.index();
  }

}
