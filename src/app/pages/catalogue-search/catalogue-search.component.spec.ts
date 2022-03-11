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
import { MockComponent } from 'ng-mocks';
import { CatalogueSearchPayload } from 'src/app/catalogue/catalogue.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { CatalogueSearchFormComponent } from 'src/app/security/catalogue-search-form/catalogue-search-form.component';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityStub } from 'src/app/testing/stubs/mdm-resources/security-resource-stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { CatalogueSearchComponent } from './catalogue-search.component';

describe('CatalogueSearchComponent', () => {
  let harness: ComponentHarness<CatalogueSearchComponent>;

  const stateRouterStub = createStateRouterStub();
  const securityStub = createSecurityStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(CatalogueSearchComponent, {
      providers: [
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
      ],
      declarations: [MockComponent(CatalogueSearchFormComponent)],
    });
  });

  it('should be created', () => {
    expect(harness.component).toBeTruthy();
  });

  describe('search request', () => {
    const searchPayload = {
      searchTerms: 'searchTerms',
    } as CatalogueSearchPayload;

    it('should transition to search-results page with correct query string', () => {
      const spy = jest.spyOn(stateRouterStub, 'transitionTo');

      harness.component.search(searchPayload);

      expect(spy).toHaveBeenCalledWith('app.container.search-results', {
        searchTerms: searchPayload.searchTerms,
      });
    });
  });
});
