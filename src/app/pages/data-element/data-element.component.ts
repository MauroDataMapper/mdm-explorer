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
import { ActivatedRoute } from '@angular/router';
import { DataElementDetail, Uuid } from '@maurodatamapper/mdm-resources';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { ToastrService } from 'ngx-toastr';
import { Bookmark, BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataElementBookmarkEvent } from 'src/app/data-explorer/data-explorer.types';

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
    private bookmarkService: BookmarkService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.bookmarkService.index().subscribe((result) => {
      this.bookmarks = result;
    });

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

  toggleBookmark(selected: boolean) {
    if (!this.dataElement) {
      return;
    }

    const item: Bookmark = {
      id: this.dataElement.id ?? '',
      dataModelId: this.dataElement.model ?? '',
      dataClassId: this.dataElement.dataClass ?? '',
      label: this.dataElement.label,
    };

    if (selected) {
      this.bookmarkService.add(item).subscribe(() => {
        this.toastr.success(`${item.label} added to bookmarks`);
      });
    } else {
      this.bookmarkService.remove(item).subscribe(() => {
        this.toastr.success(`${item.label} removed from bookmarks`);
      });
    }
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
