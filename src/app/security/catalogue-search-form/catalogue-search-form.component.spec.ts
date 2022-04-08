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
import { SimpleChange } from '@angular/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MockComponent } from 'ng-mocks';
import { CatalogueSearchPayload } from 'src/app/data-explorer/data-explorer.types';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { CatalogueSearchFormComponent } from './catalogue-search-form.component';

describe('CatalogueSearchFormComponent', () => {
  let harness: ComponentHarness<CatalogueSearchFormComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CatalogueSearchFormComponent, {
      declarations: [MockComponent(MatFormField), MockComponent(MatLabel)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.formGroup).toBeDefined();
    expect(harness.component.searchTerms?.value).toBe('');
  });

  it('should set form fields when searchTerms is changed', () => {
    const searchPayload = { searchTerms: 'test-term' } as CatalogueSearchPayload;
    harness.component.searchPayload = searchPayload;

    harness.component.ngOnChanges({
      searchPayload: new SimpleChange(null, searchPayload, false),
    });

    expect(harness.component.searchTerms?.value).toBe(searchPayload.searchTerms);
  });

  it('should emit search event with payload', () => {
    const spy = jest.spyOn(harness.component.searchClicked, 'emit');
    const payload: CatalogueSearchPayload = {
      searchTerms: 'test-term',
      publication: '',
      years: '',
      authors: '',
      authorAffiliation: '',
      volumes: '',
      issues: '',
      pages: '',
    };
    harness.component.searchTerms?.setValue(payload.searchTerms);

    harness.component.search();

    expect(spy).toHaveBeenCalledWith(payload);
  });
});
