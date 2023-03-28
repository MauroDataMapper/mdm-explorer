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
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  CreateDataSpecificationEvent,
  DataSpecificationElementAddDeleteEvent,
} from '../../shared/data-element-in-data-specification/data-element-in-data-specification.component';
import { DataElementSearchResultComponent } from '../data-element-search-result/data-element-search-result.component';
import { DataItemDeleteEvent } from '../data-explorer.types';

@Component({
  selector: 'mdm-data-element-row',
  templateUrl: './data-element-row.component.html',
  styleUrls: ['./data-element-row.component.scss'],
})
export class DataElementRowComponent
  extends DataElementSearchResultComponent
  implements OnInit
{
  @Input() suppressViewDataSpecificationsDialogButton = false;
  @Input() canDelete = true;
  @Input() nestedPadding = false;

  @Output() deleteItemEvent = new EventEmitter<DataItemDeleteEvent>();
  @Output() dataSpecificationAddDelete =
    new EventEmitter<DataSpecificationElementAddDeleteEvent>();
  @Output() dataSpecificationCreated = new EventEmitter<CreateDataSpecificationEvent>();
  @Output() setRemoveSelectedButtonDisabledEvent = new EventEmitter();
  @Output() updateAllChildrenSelected = new EventEmitter();

  padding: 'default' | 'nested' = 'default';

  ngOnInit(): void {
    this.padding = this.nestedPadding ? 'nested' : 'default';
  }

  /**
   * When the selection changes
   * we emit this event for the
   * ancestor components to refresh
   * some of their variables.
   */
  onNgModelChange() {
    if (!this.item) {
      return;
    }

    this.updateAllChildrenSelected.emit();
  }

  handleDataSpecificationAddDelete(event: DataSpecificationElementAddDeleteEvent) {
    this.dataSpecificationAddDelete.emit(event);
  }

  handleCreateDataSpecification(event: CreateDataSpecificationEvent) {
    this.dataSpecificationCreated.emit(event);
  }

  removeElement() {
    if (this.item) {
      this.deleteItemEvent.emit({ dataElement: this.item });
    }
  }
}
