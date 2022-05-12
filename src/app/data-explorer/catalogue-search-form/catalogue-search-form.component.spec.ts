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
import { ProfileField } from '@maurodatamapper/mdm-resources';
import { MockComponent } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementSearchParameters } from '../data-explorer.types';

import { CatalogueSearchFormComponent } from './catalogue-search-form.component';

describe('CatalogueSearchFormComponent', () => {
  let harness: ComponentHarness<CatalogueSearchFormComponent>;

  const profileFields: ProfileField[] = [
    {
      fieldName: 'field1',
      metadataPropertyName: 'field1',
      dataType: 'enumeration',
      allowedValues: ['val1', 'val2'],
    },
    {
      fieldName: 'field2',
      metadataPropertyName: 'field2',
      dataType: 'enumeration',
      allowedValues: ['val3', 'val4'],
    },
  ];

  const initForm = () => {
    harness.component.profileFields = profileFields;

    harness.component.ngOnChanges({
      profileFields: new SimpleChange(null, profileFields, false),
    });
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CatalogueSearchFormComponent, {
      declarations: [MockComponent(MatFormField), MockComponent(MatLabel)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.formGroup).toBeDefined();
    expect(harness.component.searchTerms?.value).toBeUndefined();
  });

  it('should set form fields when profileFields is changed', () => {
    initForm();

    expect(harness.component.searchTerms?.value).toBe('');
    expect(harness.component.formGroup.get('field1')?.value).toBe('');
    expect(harness.component.formGroup.get('field2')?.value).toBe('');
  });

  it('should emit search event with payload', () => {
    initForm();

    const spy = jest.spyOn(harness.component.searchClicked, 'emit');

    const changes: DataElementSearchParameters = {
      search: 'test search',
      filters: {
        field1: 'hello',
        field2: 'world',
      },
    };

    harness.component.searchTerms?.setValue(changes.search);
    harness.component.formGroup.get('field1')?.setValue(changes.filters?.field1);
    harness.component.formGroup.get('field2')?.setValue(changes.filters?.field2);
    harness.component.search();

    expect(spy).toHaveBeenCalledWith(changes);
  });

  it('should clear all fields', () => {
    initForm();

    const formFields = [
      harness.component.searchTerms,
      harness.component.formGroup.get('field1'),
      harness.component.formGroup.get('field2'),
    ];

    formFields.forEach((field) => field?.setValue('test'));
    expect(formFields.map((field) => field?.value)).toContain('test');

    harness.component.clear();
    expect(formFields.map((field) => field?.value)).toContain('');
  });
});
