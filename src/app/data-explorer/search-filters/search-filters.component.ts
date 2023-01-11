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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { MatSelectChange } from '@angular/material/select';

export interface SearchFilterField {
  name: string;
  label: string;
  dataType: 'enumeration';
  allowedValues?: string[];
  currentValue?: string;
}

export interface SearchFilterChange {
  name: string;
  value?: string;
}

@Component({
  selector: 'mdm-search-filters',
  templateUrl: './search-filters.component.html',
  styleUrls: ['./search-filters.component.scss'],
})
export class SearchFiltersComponent {
  @Input() fields: SearchFilterField[] = [];

  @Input() appearance: MatFormFieldAppearance = 'outline';

  @Output() filterChange = new EventEmitter<SearchFilterChange>();

  @Output() filterReset = new EventEmitter<void>();

  get hasValues() {
    return this.fields.some((field) => field.currentValue);
  }

  selectionChanged(name: string, event: MatSelectChange) {
    this.filterChange.emit({ name, value: event.value });
  }

  clearSelection(name: string) {
    this.filterChange.emit({ name });
  }

  clearAll() {
    this.filterReset.emit();
  }
}
