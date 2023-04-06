/*
Copyright 2022-2023 University of Oxford
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
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  DataElementBookmarkEvent,
  SelectableDataElementSearchResultCheckedEvent,
  DataElementSearchResult,
} from '../data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from '../data-requests.service';

@Component({
  selector: 'mdm-data-element-search-result',
  templateUrl: './data-element-search-result.component.html',
  styleUrls: ['./data-element-search-result.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataElementSearchResultComponent {
  @Input() item?: DataElementSearchResult;

  @Input() showBreadcrumb = false;

  @Input() isBookmarked = false;

  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  @Output() checked = new EventEmitter<SelectableDataElementSearchResultCheckedEvent>();

  @Output() bookmark = new EventEmitter<DataElementBookmarkEvent>();

  bookmarked = false;

  constructor() {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  itemChecked(event: MatCheckboxChange) {
    this.selectItem(event.checked);
  }

  toggleBookmark(selected: boolean) {
    if (!this.item) {
      return;
    }

    this.bookmark.emit({ item: this.item, selected });
  }

  protected selectItem(selected: boolean) {
    if (!this.item) {
      return;
    }

    this.item.isSelected = selected;
    this.checked.emit({ item: this.item, checked: selected });
  }
}
