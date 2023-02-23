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
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  DataElementSearchResult,
  DataItemDeleteEvent,
  DataRequestQueryType,
  DataSchema,
  SelectionChange,
} from '../data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from '../data-requests.service';
import { DataSchemaService } from 'src/app/mauro/data-schema-service';

@Component({
  selector: 'mdm-data-schema-row',
  templateUrl: './data-schema-row.component.html',
  styleUrls: ['./data-schema-row.component.scss'],
})
export class DataSchemaRowComponent implements OnInit {
  @Input() dataSchema?: DataSchema;
  @Input() requestName = '';
  @Input() requestId = '';
  @Input() suppressViewRequestsDialogButton = false;
  @Input() canDelete = true;
  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;

  @Output() deleteItemEvent = new EventEmitter<DataItemDeleteEvent>();
  @Output() requestAddDelete = new EventEmitter<RequestElementAddDeleteEvent>();
  @Output() updateAllOrSomeChildrenSelected = new EventEmitter();

  visible = true;

  schemaSelected: SelectionChange = {
    changedBy: { instigator: 'parent' },
    isSelected: false,
  };
  schemaElements: DataElementSearchResult[] = [];

  cohortQueryType: DataRequestQueryType = 'cohort';
  dataQueryType: DataRequestQueryType = 'data';

  constructor(private dataSchemaService: DataSchemaService) {
    this.sourceTargetIntersections = {
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    };
  }

  ngOnInit(): void {
    if (this.dataSchema) {
      this.schemaElements = this.dataSchemaService.getDataSchemaElements(this.dataSchema);
    }
  }

  toggleCollapse(): void {
    this.visible = !this.visible;
  }

  handleRequestAddDelete(event: RequestElementAddDeleteEvent) {
    this.requestAddDelete.emit(event);
  }

  handleDeleteItemEvent(event: DataItemDeleteEvent) {
    event.dataSchema = this.dataSchema;
    this.deleteItemEvent.emit(event);
  }

  removeSchema() {
    if (this.dataSchema) {
      this.deleteItemEvent.emit({
        dataSchema: this.dataSchema,
      });
    }
  }

  /**
   * When the schema checkbox is clicked
   * we need to select or deselect all our
   * descendents, and also emit the event
   * for my ancestor to update its state.
   */
  onNgModelChange() {
    if (!this.dataSchema) {
      return;
    }

    if (this.dataSchema.schema.isSelected) {
      this.selectOrUnselectAllChildDataClassesAndItsChildren(true);
    } else {
      this.selectOrUnselectAllChildDataClassesAndItsChildren(false);
    }

    this.updateAllOrSomeChildrenSelected.emit();
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
    if (!this.dataSchema) {
      return;
    }
    this.dataSchema.schema.isSelected = this.schemaElements.every(
      (dataElement) => dataElement.isSelected
    );

    this.updateAllOrSomeChildrenSelected.emit();
  }

  private selectOrUnselectAllChildDataClassesAndItsChildren(valueToSet: boolean) {
    if (!this.dataSchema?.dataClasses) {
      return;
    }

    this.dataSchema?.dataClasses.forEach((dataClass) => {
      dataClass.dataClass.isSelected = valueToSet;
      dataClass.dataElements.forEach((dataElement) => {
        dataElement.isSelected = valueToSet;
      });
    });
  }
}
