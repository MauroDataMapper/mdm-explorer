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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  CreateRequestEvent,
  RequestElementAddDeleteEvent,
} from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  DataElementCheckedEvent,
  DataElementDeleteEvent,
  DataElementSearchResult,
} from '../data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from '../data-requests.service';

@Component({
  selector: 'mdm-data-element-row',
  templateUrl: './data-element-row.component.html',
  styleUrls: ['./data-element-row.component.scss'],
})
export class DataElementRowComponent {
  @Input() item?: DataElementSearchResult;
  @Input() suppressViewRequestsDialogButton = false;
  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  @Output() checked = new EventEmitter<DataElementCheckedEvent>();
  @Output() delete = new EventEmitter<DataElementDeleteEvent>();
  @Output() requestAddDelete = new EventEmitter<RequestElementAddDeleteEvent>();
  @Output() requestCreated = new EventEmitter<CreateRequestEvent>();

  constructor() {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  handleRequestAddDelete(event: RequestElementAddDeleteEvent) {
    this.requestAddDelete.emit(event);
  }

  handleCreateRequest(event: CreateRequestEvent) {
    this.requestCreated.emit(event);
  }

  itemChecked(event: MatCheckboxChange) {
    if (!this.item) {
      return;
    }

    this.item.isSelected = !this.item?.isSelected ?? false;
    this.checked.emit({ item: this.item, checked: event.checked });
  }

  removeElement() {
    if (this.item) {
      this.delete.emit({ item: this.item });
    }
  }
}
