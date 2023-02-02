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
  DataRequestQueryType,
  DataSchema,
  // RefreshRequestEvent,
  SelectionChange,
  SelectionChangedBy,
} from '../data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from '../data-requests.service';
import { DataSchemaService } from 'src/app/mauro/data-schema-service';

@Component({
  selector: 'mdm-data-schema-row',
  templateUrl: './data-schema-row.component.html',
  styleUrls: ['./data-schema-row.component.scss'],
})
export class DataSchemaRowComponent implements OnInit, OnChanges {
  @Input() dataSchema?: DataSchema;
  @Input() requestName = '';
  @Input() requestId = '';
  @Input() suppressViewRequestsDialogButton = false;
  @Input() canDelete = true;
  @Input() sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
  @Input() allSelected?: SelectionChange;

  @Output() deleteItemEvent = new EventEmitter<DataItemDeleteEvent>();
  @Output() requestAddDelete = new EventEmitter<RequestElementAddDeleteEvent>();
  // @Output() requestCreated = new EventEmitter<CreateRequestEvent>();
  @Output() schemaCheckedEvent = new EventEmitter();
  @Output() setRemoveSelectedButtonDisabledEvent = new EventEmitter();

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

  // Init, get the classes from the request. and list.
  ngOnInit(): void {
    if (this.dataSchema) {
      this.schemaElements = this.dataSchemaService.dataSchemaElements(this.dataSchema);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.allSelected) {
      if (this.allSelected?.changedBy?.instigator === 'parent') {
        this.selectSchema(this.allSelected.isSelected, { instigator: 'parent' });
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
    this.setRemoveSelectedButtonDisabledEvent.emit();
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

  schemaChecked(event: MatCheckboxChange) {
    if (!this.dataSchema) {
      return;
    }

    this.selectSchema(event.checked, {
      instigator: 'parent',
    });

    this.schemaCheckedEvent.emit();
    /*
    this.schemaCheckedEvent.emit({
      changedBy: { instigator: 'child' },
      isSelected: this.dataSchema.schema.isSelected,
    });
    */
  }

  onSelectClass(/* event: SelectionChange*/) {
    if (this.dataSchema) {
      const selectedItemList = this.dataSchema.dataClasses.filter(
        (item) => item.dataClass.isSelected
      );
      this.setSchemaSelected(selectedItemList);
    }
  }

  /**
   * If all the elements are selected, select the parent class. If a single element is not
   * selected, deselect the parent class.
   */
  private setSchemaSelected(selectedItemList: DataClassWithElements[]) {
    if (this.dataSchema) {
      this.selectSchema(this.dataSchema.dataClasses.length === selectedItemList.length, {
        instigator: 'child',
      });
      this.schemaCheckedEvent.emit(this.dataSchema.schema.isSelected);
    }
  }

  private selectSchema(value: boolean, changedBy: SelectionChangedBy) {
    if (this.dataSchema) {
      this.dataSchema.schema.isSelected = value;
    }
    const schemaSelected: SelectionChange = {
      changedBy,
      isSelected: value,
    };
    this.schemaSelected = schemaSelected;
  }
}
