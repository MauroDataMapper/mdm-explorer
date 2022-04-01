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
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Bookmark, BookmarkService } from 'src/app/core/bookmark.service';
import { ActivatedRoute } from '@angular/router';
import { DataElementDetail, Uuid } from '@maurodatamapper/mdm-resources';
import { DataModelService } from 'src/app/catalogue/data-model.service';
import { DataElementBookmarkEvent } from 'src/app/search/search.types';

@Component({
  selector: 'mdm-data-element',
  templateUrl: './data-element.component.html',
  styleUrls: ['./data-element.component.scss'],
})
export class DataElementComponent implements OnInit {
  @Output() bookmark = new EventEmitter<DataElementBookmarkEvent>();

  dataModelId: Uuid = '';
  dataClassId: Uuid = '';
  dataElementId: Uuid = '';
  dataElement?: DataElementDetail;

  bookmarks: Bookmark[] = [];

  constructor(
    private route: ActivatedRoute,
    private dataModels: DataModelService,
    private bookmarkService: BookmarkService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((parameter) => {
      this.dataModelId = parameter.dataModelId;
      this.dataClassId = parameter.dataClassId;
      this.dataElementId = parameter.dataElementId;

      this.dataModels
        .getDataElement(this.dataModelId, this.dataClassId, this.dataElementId)
        .subscribe((dataElementDetail) => {
          this.dataElement = dataElementDetail;
        });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  toggleBookmark(selected: boolean) {
    if (!this.dataElement) {
      return;
    }

    // this.bookmark.emit({ item: this.dataElement, selected });
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
      if (this.dataElement && this.dataElement.id === bookmark.id) found = true;
    });

    return found;
  }
}
