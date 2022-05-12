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
import { ProfileField } from '@maurodatamapper/mdm-resources';
import { MockComponent } from 'ng-mocks';
import { of } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { CatalogueSearchFormComponent } from 'src/app/data-explorer/catalogue-search-form/catalogue-search-form.component';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import { DataElementSearchParameters } from 'src/app/data-explorer/data-explorer.types';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let harness: ComponentHarness<SearchComponent>;

  const stateRouterStub = createStateRouterStub();
  const explorerStub = createDataExplorerServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SearchComponent, {
      providers: [
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: DataExplorerService,
          useValue: explorerStub,
        },
      ],
      declarations: [MockComponent(CatalogueSearchFormComponent)],
    });
  });

  it('should be created', () => {
    expect(harness.component).toBeTruthy();
  });

  it('should set profile fields to use for filters', () => {
    const fields: ProfileField[] = [
      {
        fieldName: 'field1',
        metadataPropertyName: 'field1',
        dataType: 'enumeration',
      },
      {
        fieldName: 'field2',
        metadataPropertyName: 'field2',
        dataType: 'enumeration',
      },
    ];

    explorerStub.getProfileFieldsForFilters.mockImplementationOnce(() => of(fields));

    harness.component.ngOnInit();

    expect(harness.component.profileFields).toBe(fields);
  });

  it('should navigate to search page with correct query string', () => {
    const spy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');
    const parameters: DataElementSearchParameters = {
      search: 'test search',
      filters: {
        filter1: 'value',
      },
    };

    harness.component.search(parameters);
    expect(spy).toHaveBeenCalledWith('/search/listing', {
      search: parameters.search,
      filter1: parameters.filters?.filter1,
    });
  });
});
