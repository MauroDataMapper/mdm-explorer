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
import { fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { CatalogueItemDomainType, DataClassDetail } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { DataClassIdentifier } from 'src/app/catalogue/catalogue.types';
import { DataModelService } from 'src/app/catalogue/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataElementSearchService } from 'src/app/search/data-element-search.service';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
  mapSearchParametersToParams,
} from 'src/app/search/search.types';
import { createDataElementSearchServiceStub } from 'src/app/testing/stubs/data-element-search.stub';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { SearchListingComponent, SearchListingSource } from './search-listing.component';

describe('SearchListingComponent', () => {
  let harness: ComponentHarness<SearchListingComponent>;

  const dataModelsStub = createDataModelServiceStub();
  const dataElementSearchStub = createDataElementSearchServiceStub();
  const toastrStub = createToastrServiceStub();
  const stateRouterStub = createStateRouterStub();

  const setupComponentTest = async (parameters: DataElementSearchParameters) => {
    const params = mapSearchParametersToParams(parameters);
    const paramMap: ParamMap = convertToParamMap(params);

    const activatedRoute: ActivatedRoute = {
      queryParamMap: of(paramMap),
    } as ActivatedRoute;

    return await setupTestModuleForComponent(SearchListingComponent, {
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: DataElementSearchService,
          useValue: dataElementSearchStub,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
      ],
    });
  };

  describe('creation', () => {
    beforeEach(async () => {
      harness = await setupComponentTest({});
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.source).toBe('unknown');
      expect(harness.component.status).toBe('init');
      expect(harness.component.parameters).toStrictEqual({});
      expect(harness.component.root).toBeUndefined();
      expect(harness.component.resultSet).toBeUndefined();
    });
  });

  describe('back label', () => {
    beforeEach(async () => {
      harness = await setupComponentTest({});
    });

    const backRoutesCases: [SearchListingSource, string][] = [
      ['browse', '/browse'],
      ['search', '/search'],
    ];

    const backLabelCases: [SearchListingSource, string][] = [
      ['browse', 'Back to browsing compartments'],
      ['search', 'Back to search fields'],
    ];

    it.each(backRoutesCases)(
      'should return correct back route for source %p - expecting %p',
      (source, route) => {
        harness.component.source = source;
        expect(harness.component.backRouterLink).toBe(route);
      }
    );

    it.each(backLabelCases)(
      'should return correct back label for source %p - expected %p',
      (source, label) => {
        harness.component.source = source;
        expect(harness.component.backLabel).toBe(label);
      }
    );
  });

  describe('initialisation from browsing', () => {
    const parameters: DataElementSearchParameters = {
      dataClass: {
        dataClassId: '1',
        dataModelId: '2',
      },
    };

    beforeEach(async () => {
      toastrStub.error.mockClear();

      harness = await setupComponentTest(parameters);
    });

    const dataClass: DataClassDetail = {
      id: '1',
      label: 'test class',
      domainType: CatalogueItemDomainType.DataClass,
      availableActions: ['show'],
    };

    const searchResults: DataElementSearchResultSet = {
      count: 3,
      items: [
        {
          id: '1',
          label: 'result 1',
          breadcrumbs: [],
        },
        {
          id: '2',
          label: 'result 2',
          breadcrumbs: [],
        },
        {
          id: '3',
          label: 'result 3',
          breadcrumbs: [],
        },
      ],
    };

    const implementDataClassReturns = (expectedId: DataClassIdentifier) => {
      dataModelsStub.getDataClass.mockImplementationOnce((id) => {
        expect(id.dataClassId).toBe(expectedId.dataClassId);
        expect(id.dataModelId).toBe(expectedId.dataModelId);
        return of(dataClass);
      });
    };

    const implementDataClassThrowsError = () => {
      dataModelsStub.getDataClass.mockImplementationOnce(() => {
        return throwError(() => new Error('fail'));
      });
    };

    const implementListingReturns = () => {
      dataElementSearchStub.listing.mockImplementationOnce((params) => {
        expect(params.dataClass?.dataClassId).toBe(parameters.dataClass?.dataClassId);
        expect(params.dataClass?.dataModelId).toBe(parameters.dataClass?.dataModelId);
        return of(searchResults);
      });
    };

    const implementListingThrowsError = () => {
      dataElementSearchStub.listing.mockImplementationOnce(() => {
        return throwError(() => new Error('fail'));
      });
    };

    it('should be in ready state once initialised', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementDataClassReturns(parameters.dataClass!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      implementListingReturns();

      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('browse');
      expect(harness.component.status).toBe('ready');
      expect(harness.component.root).toBe(dataClass);
      expect(harness.component.resultSet).toBe(searchResults);
      expect(spy).not.toHaveBeenCalled();
    }));

    it('should raise an error if there is no data class', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementDataClassThrowsError();
      implementListingReturns();

      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('browse');
      expect(harness.component.root).toBeUndefined();
      expect(spy).toHaveBeenCalled();
      expect(harness.component.resultSet).toBeUndefined();
    }));

    it('should raise an error if failed to get search results', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementDataClassReturns(parameters.dataClass!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      implementListingThrowsError();

      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('browse');
      expect(harness.component.status).toBe('error');
      expect(harness.component.root).toBeUndefined();
      expect(harness.component.resultSet).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    }));
  });

  describe('initialisation from search', () => {
    const parameters: DataElementSearchParameters = {
      search: 'test',
    };

    beforeEach(async () => {
      toastrStub.error.mockClear();

      harness = await setupComponentTest(parameters);
    });

    const searchResults: DataElementSearchResultSet = {
      count: 3,
      items: [
        {
          id: '1',
          label: 'result 1',
          breadcrumbs: [],
        },
        {
          id: '2',
          label: 'result 2',
          breadcrumbs: [],
        },
        {
          id: '3',
          label: 'result 3',
          breadcrumbs: [],
        },
      ],
    };

    const implementSearchReturns = () => {
      dataElementSearchStub.search.mockImplementationOnce((params) => {
        expect(params.search).toBe(parameters.search);
        return of(searchResults);
      });
    };

    const implementSearchThrowsError = () => {
      dataElementSearchStub.search.mockImplementationOnce(() => {
        return throwError(() => new Error('fail'));
      });
    };

    it('should be in ready state once initialised', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementSearchReturns();

      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('search');
      expect(harness.component.status).toBe('ready');
      expect(harness.component.root).toBeUndefined();
      expect(harness.component.resultSet).toBe(searchResults);
      expect(spy).not.toHaveBeenCalled();
    }));

    it('should raise an error if failed to get search results', () => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementSearchThrowsError();

      harness.component.ngOnInit();
      expect(harness.component.source).toBe('search');
      expect(harness.component.status).toBe('error');
      expect(harness.component.root).toBeUndefined();
      expect(harness.component.resultSet).toBeUndefined();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('update search', () => {
    const searchTerms = ['test', 'hello world', 'new search'];

    it.each(searchTerms)('should start a new search for %p', (searchTerm) => {
      harness.component.searchTerms = searchTerm;
      harness.component.updateSearch();
      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith(
        '/search/listing',
        {
          search: searchTerm,
        }
      );
    });
  });
});
