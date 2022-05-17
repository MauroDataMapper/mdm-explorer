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
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatFormFieldAppearance } from '@angular/material/form-field';
import { ProfileField } from '@maurodatamapper/mdm-resources';
import {
  DataElementSearchFilters,
  DataElementSearchParameters,
} from 'src/app/data-explorer/data-explorer.types';

@Component({
  selector: 'mdm-catalogue-search-form',
  templateUrl: './catalogue-search-form.component.html',
  styleUrls: ['./catalogue-search-form.component.scss'],
})
export class CatalogueSearchFormComponent implements OnChanges {
  @Input() profileFields: ProfileField[] = [];
  @Input() appearance: MatFormFieldAppearance = 'outline';
  @Input() routeSearchTerm?: string = '';

  @Output() searchClicked = new EventEmitter<DataElementSearchParameters>();

  formGroup: FormGroup = new FormGroup({});

  get searchTerms() {
    return this.formGroup.get('searchTerms');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.profileFields || changes.routeSearchTerm) {
      this.formGroup = new FormGroup({
        searchTerms: new FormControl(this.routeSearchTerm),
      });
      this.profileFields.forEach((field) => {
        this.formGroup.addControl(field.metadataPropertyName, new FormControl(''));
      });
    }
  }

  search() {
    if (this.formGroup.invalid) {
      return;
    }

    const filters = this.profileFields.reduce((f, field) => {
      const key = field.metadataPropertyName;
      const formControl = this.formGroup.get(key);
      if (formControl) {
        f[key] = formControl.value;
      }
      return f;
    }, {} as DataElementSearchFilters);

    this.searchClicked.emit({
      search: this.searchTerms?.value,
      filters,
    });
  }

  clear() {
    this.searchTerms?.setValue('');
    this.profileFields.forEach((field) => {
      this.formGroup.get(field.metadataPropertyName)?.setValue('');
    });
  }
}
