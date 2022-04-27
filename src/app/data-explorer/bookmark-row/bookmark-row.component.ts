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
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import { Bookmark } from '../bookmark.service';
import {
  BookMarkCheckedEvent,
  AddToRequestEvent,
  RemoveBookmarkEvent,
  DataRequest,
} from '../data-explorer.types';

@Component({
  selector: 'mdm-bookmark-row',
  templateUrl: './bookmark-row.component.html',
  styleUrls: ['./bookmark-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkRowComponent {
  @Input() bookmark?: Bookmark;
  @Input() openRequests: DataRequest[] = [];
  @Input() isChecked = false;

  @Output() checked = new EventEmitter<BookMarkCheckedEvent>();
  @Output() remove = new EventEmitter<RemoveBookmarkEvent>();
  @Output() addToRequest = new EventEmitter<AddToRequestEvent>();

  handleChecked(event: MatCheckboxChange) {
    if (!this.bookmark) return;
    this.checked.emit({ item: this.bookmark, checked: event.checked });
  }

  handleRemove() {
    if (!this.bookmark) return;
    this.remove.emit({ item: this.bookmark });
  }

  handleAddToRequest(dataRequest: DataRequest) {
    if (!this.bookmark || !dataRequest.id) return;
    this.addToRequest.emit({ item: this.bookmark, requestId: dataRequest.id });
  }
}
