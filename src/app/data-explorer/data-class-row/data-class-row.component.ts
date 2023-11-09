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
import { DataSpecificationElementAddDeleteEvent } from '../../shared/data-element-in-data-specification/data-element-in-data-specification.component';
import {
  DataClassWithElements,
  DataElementSearchResult,
  DataItemDeleteEvent,
} from '../data-explorer.types';
import { DataSpecificationSourceTargetIntersections } from '../data-specification.service';

@Component({
  selector: 'mdm-data-class-row',
  templateUrl: './data-class-row.component.html',
  styleUrls: ['./data-class-row.component.scss'],
})
export class DataClassRowComponent implements OnInit {
  @Input() dataClassWithElements?: DataClassWithElements;
  @Input() suppressViewDataSpecificationsDialogButton = false;
  @Input() canDelete = true;
  @Input() sourceTargetIntersections: DataSpecificationSourceTargetIntersections;

  @Output() deleteItemEvent = new EventEmitter<DataItemDeleteEvent>();
  @Output() dataSpecificationAddDelete =
    new EventEmitter<DataSpecificationElementAddDeleteEvent>();
  @Output() updateAllChildrenSelected = new EventEmitter();

  expanded = true;

  classElements: DataElementSearchResult[] = [];

  allChildrenSelected = false;

  constructor() {
    this.sourceTargetIntersections = {
      dataSpecifications: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    if (this.dataClassWithElements) {
      this.classElements = this.dataClassWithElements.dataElements;
    }
  }

  /**
   * When any of the children component
   * changes states, we need to update
   * our state accordingly.  Also, after
   * changing our state we should comunicate
   * that to our ancestors for them to update
   * their state.
   */
  updateAllChildrenSelectedHandler() {
    if (!this.dataClassWithElements) {
      return;
    }
    this.dataClassWithElements.dataClass.isSelected = this.classElements.every(
      (dataElement) => dataElement.isSelected,
    );

    this.updateAllChildrenSelected.emit();
  }

  toggleExpanded(): void {
    this.expanded = !this.expanded;
  }

  handleDataSpecificationAddDelete(event: DataSpecificationElementAddDeleteEvent) {
    this.dataSpecificationAddDelete.emit(event);
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

  /**
   * When the class checkbox is clicked
   * we need to select or deselect all our
   * children, and also emit the event
   * for my ancestor to update its state.
   */
  ngModelOnChange() {
    if (!this.dataClassWithElements?.dataClass) {
      return;
    }

    if (this.dataClassWithElements?.dataClass?.isSelected) {
      this.checkAllChildDataElements();
    } else {
      this.uncheckAllChildDataElements();
    }

    this.updateAllChildrenSelected.emit();
  }

  private checkAllChildDataElements() {
    if (!this.classElements) {
      return;
    }

    this.classElements.forEach((element) => {
      element.isSelected = true;
    });
  }

  private uncheckAllChildDataElements() {
    if (!this.classElements) {
      return;
    }

    this.classElements.forEach((element) => {
      element.isSelected = false;
    });
  }
}
