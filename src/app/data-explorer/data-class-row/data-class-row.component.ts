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
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  DataClassWithElements,
  DataElementSearchResult,
  DataItemDeleteEvent,
  // RefreshRequestEvent,
  SelectableDataElementSearchResultCheckedEvent,
  SelectionChange,
  SelectionChangedBy,
} from '../data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from '../data-requests.service';

@Component({
  selector: 'mdm-data-class-row',
  templateUrl: './data-class-row.component.html',
  styleUrls: ['./data-class-row.component.scss'],
})
export class DataClassRowComponent implements OnInit, OnChanges {
  @Input() dataClassWithElements?: DataClassWithElements;
  @Input() suppressViewRequestsDialogButton = false;
  @Input() canDelete = true;
  @Input() requestName = '';
  @Input() requestId = '';
  @Input() schemaSelected?: SelectionChange;
  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  @Output() deleteItemEvent = new EventEmitter<DataItemDeleteEvent>();
  @Output() requestAddDelete = new EventEmitter<RequestElementAddDeleteEvent>();
  @Output() classCheckedEvent = new EventEmitter();
  @Output() setRemoveSelectedButtonDisabledEvent = new EventEmitter();

  state: 'idle' | 'loading' = 'idle';

  visible = true;

  classSelected: SelectionChange = {
    changedBy: { instigator: 'parent' },
    isSelected: false,
  };
  classElements: DataElementSearchResult[] = [];

  constructor() {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    if (this.dataClassWithElements) {
      this.classElements = this.dataClassWithElements.dataElements;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.schemaSelected) {
      if (
        this.dataClassWithElements &&
        this.schemaSelected?.changedBy?.instigator === 'parent'
      ) {
        this.selectClass(this.schemaSelected.isSelected, { instigator: 'parent' });
      }
    }
  }

  toggleCollapse(): void {
    this.visible = !this.visible;
  }

  handleRequestAddDelete(event: RequestElementAddDeleteEvent) {
    this.requestAddDelete.emit(event);
  }

  handleSetRemoveSelectedButtonDisable() {
    this.setRemoveSelectedButtonDisabled();
  }

  handleDeleteItemEvent(event: DataItemDeleteEvent) {
    event.dataClassWithElements = this.dataClassWithElements;
    this.deleteItemEvent.emit(event);
  }

  removeClass() {
    if (this.dataClassWithElements) {
      this.deleteItemEvent.emit({
        dataClassWithElements: this.dataClassWithElements,
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  classChecked(event: MatCheckboxChange) {
    if (!this.dataClassWithElements) {
      return;
    }

    this.selectClass(!this.dataClassWithElements?.dataClass?.isSelected ?? false, {
      instigator: 'parent',
    });

    this.classCheckedEvent.emit();
  }

  onSelectElement(event: SelectableDataElementSearchResultCheckedEvent) {
    event.item.isSelected = event.checked;
    const selectedItemList = this.classElements.filter((item) => item.isSelected);
    this.setClassSelected(selectedItemList);
    this.setRemoveSelectedButtonDisabled();
  }

  /**
   * Disable the 'Remove Selected' button unless some elements are selected in the current request
   */
  private setRemoveSelectedButtonDisabled() {
    this.setRemoveSelectedButtonDisabledEvent.emit();
  }

  /**
   * If all the elements are selected, select the parent class. If a single element is not
   * selected, deselect the parent class.
   */
  private setClassSelected(selectedItemList: DataElementSearchResult[]) {
    if (this.dataClassWithElements) {
      this.selectClass(this.classElements.length === selectedItemList.length, {
        instigator: 'child',
      });
      this.classCheckedEvent.emit(this.dataClassWithElements.dataClass.isSelected);
    }
  }

  private selectClass(value: boolean, changedBy: SelectionChangedBy) {
    if (this.dataClassWithElements) {
      this.dataClassWithElements.dataClass.isSelected = value;
    }

    if (this.classSelected) {
      const classSelected: SelectionChange = {
        changedBy,
        isSelected: value,
      };
      this.classSelected = classSelected;
    }
  }
}
