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
import { Component, EventEmitter, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CatalogueSearchPayload } from 'src/app/catalogue/catalogue.service';

@Component({
  selector: 'mdm-catalogue-search-form',
  templateUrl: './catalogue-search-form.component.html',
  styleUrls: ['./catalogue-search-form.component.scss'],
})
export class CatalogueSearchFormComponent implements OnChanges {
  @Output() searchClicked = new EventEmitter<CatalogueSearchPayload>();

  formGroup: FormGroup;
  searchPayload: CatalogueSearchPayload = {
    searchTerms: '',
    publication: '',
    years: '',
    authors: '',
    authorAffiliation: '',
    volumes: '',
    issues: '',
    pages: '',
  };

  constructor() {
    this.formGroup = new FormGroup({
      searchTerms: new FormControl(''),
      publication: new FormControl(''),
      years: new FormControl(''),
      authors: new FormControl(''),
      authorAffiliations: new FormControl(''),
      volumes: new FormControl(''),
      issues: new FormControl(''),
      pages: new FormControl(''),
    });
  }

  get searchTerms() {
    return this.formGroup.get('searchTerms');
  }

  get publication() {
    return this.formGroup.get('publication');
  }

  get years() {
    return this.formGroup.get('years');
  }

  get authors() {
    return this.formGroup.get('authors');
  }

  get authorAffiliations() {
    return this.formGroup.get('authorAffiliations');
  }

  get volumes() {
    return this.formGroup.get('volumes');
  }

  get issues() {
    return this.formGroup.get('issues');
  }

  get pages() {
    return this.formGroup.get('pages');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.searchPayload) {
      this.setFormValues(this.searchPayload);
    }
  }

  search() {
    if (this.formGroup.invalid) {
      return;
    }

    this.searchClicked.emit({
      searchTerms: this.searchTerms?.value,
      publication: '',
      years: '',
      authors: '',
      authorAffiliation: '',
      volumes: '',
      issues: '',
      pages: '',
    });
  }

  private setFormValues(searchPayload?: CatalogueSearchPayload) {
    this.searchTerms?.setValue(searchPayload?.searchTerms ?? '');
    this.publication?.setValue(searchPayload?.publication ?? '');
    this.years?.setValue(searchPayload?.years ?? '');
    this.authors?.setValue(searchPayload?.authors ?? '');
    this.authorAffiliations?.setValue(searchPayload?.authorAffiliation ?? '');
    this.volumes?.setValue(searchPayload?.volumes ?? '');
    this.issues?.setValue(searchPayload?.issues ?? '');
    this.pages?.setValue(searchPayload?.pages ?? '');
  }
}
