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
import {
  CatalogueItemDomainType,
  DataClassDetail,
  DataModelDetail,
  ProfileField,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { DataClassIdentifier } from 'src/app/mauro/mauro.types';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataElementSearchService } from 'src/app/data-explorer/data-element-search.service';
import {
  DataElementSearchParameters,
  DataElementSearchResult,
  DataElementSearchResultSet,
  mapSearchParametersToParams,
} from 'src/app/data-explorer/data-explorer.types';
import { createBookmarkServiceStub } from 'src/app/testing/stubs/bookmark.stub';
import { createDataElementSearchServiceStub } from 'src/app/testing/stubs/data-element-search.stub';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { SearchListingComponent, SearchListingSource } from './search-listing.component';
import { DataElementBookmarkEvent } from 'src/app/data-explorer/data-explorer.types';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import {
  DataRequestsService,
  DataAccessRequestsSourceTargetIntersections,
} from 'src/app/data-explorer/data-requests.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';

describe('SearchListingComponent', () => {
  let harness: ComponentHarness<SearchListingComponent>;

  const bookmarkStub = createBookmarkServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const dataElementSearchStub = createDataElementSearchServiceStub();
  const toastrStub = createToastrServiceStub();
  const stateRouterStub = createStateRouterStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();

  const mockedRootDataModel: DataModelDetail = {
    id: '123',
    label: 'model',
    domainType: CatalogueItemDomainType.DataModel,
    finalised: true,
    availableActions: ['show'],
  };

  const mockedSourceTargetIntersections: DataAccessRequestsSourceTargetIntersections = {
    dataAccessRequests: [],
    sourceTargetIntersections: [],
  };

  const mockedIntersections: DataAccessRequestsSourceTargetIntersections =
    mockedSourceTargetIntersections;

  const profileFieldsForFilters: ProfileField[] = [
    {
      fieldName: 'filter1',
      metadataPropertyName: 'filter1',
      dataType: 'enumeration',
      allowedValues: ['val1', 'val2'],
    },
  ];

  const implementProfileFieldsForFilters = () => {
    dataExplorerStub.getProfileFieldsForFilters.mockImplementationOnce(() =>
      of(profileFieldsForFilters)
    );
  };

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
        {
          provide: BookmarkService,
          useValue: bookmarkStub,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
        },
        {
          provide: DataExplorerService,
          useValue: dataExplorerStub,
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
      expect(harness.component.sortBy).toBeUndefined();
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
      totalResults: 3,
      pageSize: 10,
      page: 1,
      items: [
        {
          id: '1',
          label: 'result one',
          breadcrumbs: [],
          dataClassId: '2',
          dataModelId: '3',
          isSelected: false,
        },
        {
          id: '2',
          label: 'test result',
          breadcrumbs: [],
          dataClassId: '2',
          dataModelId: '3',
          isSelected: false,
        },
        {
          id: '3',
          label: 'result the third',
          breadcrumbs: [],
          dataClassId: '2',
          dataModelId: '3',
          isSelected: false,
        },
      ],
    };

    const sortedSearchResultsByLabelAsc: DataElementSearchResultSet = {
      ...searchResults,
      items: [searchResults.items[0], searchResults.items[2], searchResults.items[1]],
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
        return of(sortedSearchResultsByLabelAsc);
      });
    };

    const implementListingThrowsError = () => {
      dataElementSearchStub.listing.mockImplementationOnce(() => {
        return throwError(() => new Error('fail'));
      });
    };

    it('should be in ready state once initialised with results sorted by the default sortBy option', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementProfileFieldsForFilters();
      implementDataClassReturns(parameters.dataClass!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      implementListingReturns();

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
        of(mockedRootDataModel)
      );
      dataRequestsStub.getRequestsIntersections.mockImplementationOnce(() =>
        of(mockedIntersections)
      );
      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('browse');
      expect(harness.component.status).toBe('ready');
      expect(harness.component.root).toBe(dataClass);
      expect(harness.component.sortBy).toBe(harness.component.sortByDefaultOption);
      expect(harness.component.resultSet).toBe(sortedSearchResultsByLabelAsc);
      expect(spy).not.toHaveBeenCalled();
    }));

    it('should raise an error if there is no data class', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementProfileFieldsForFilters();
      implementDataClassThrowsError();
      implementListingReturns();

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
        of(mockedRootDataModel)
      );
      dataRequestsStub.getRequestsIntersections.mockImplementationOnce(() =>
        of(mockedIntersections)
      );
      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('browse');
      expect(harness.component.root).toBeUndefined();
      expect(spy).toHaveBeenCalled();
      expect(harness.component.resultSet).toBeUndefined();
    }));

    it('should raise an error if failed to get search results', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementProfileFieldsForFilters();
      implementDataClassReturns(parameters.dataClass!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      implementListingThrowsError();

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
        of(mockedRootDataModel)
      );
      dataRequestsStub.getRequestsIntersections.mockImplementationOnce(() =>
        of(mockedIntersections)
      );
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
      totalResults: 3,
      pageSize: 10,
      page: 1,
      items: [
        {
          id: '1',
          label: 'result one',
          breadcrumbs: [],
          dataClassId: '2',
          dataModelId: '3',
          isSelected: false,
        },
        {
          id: '2',
          label: 'test result',
          breadcrumbs: [],
          dataClassId: '2',
          dataModelId: '3',
          isSelected: false,
        },
        {
          id: '3',
          label: 'result the third',
          breadcrumbs: [],
          dataClassId: '2',
          dataModelId: '3',
          isSelected: false,
        },
      ],
    };

    const sortedSearchResultsByLabelAsc: DataElementSearchResultSet = {
      ...searchResults,
      items: [searchResults.items[0], searchResults.items[2], searchResults.items[1]],
    };

    const implementSearchReturns = () => {
      dataElementSearchStub.search.mockImplementationOnce((params) => {
        expect(params.search).toBe(parameters.search);
        return of(sortedSearchResultsByLabelAsc);
      });
    };

    const implementSearchThrowsError = () => {
      dataElementSearchStub.search.mockImplementationOnce(() => {
        return throwError(() => new Error('fail'));
      });
    };

    it('should be in ready state once initialised with results sorted by the default sortBy option', fakeAsync(() => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementProfileFieldsForFilters();
      implementSearchReturns();

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
        of(mockedRootDataModel)
      );
      dataRequestsStub.getRequestsIntersections.mockImplementationOnce(() =>
        of(mockedIntersections)
      );
      harness.component.ngOnInit();
      tick();

      expect(harness.component.source).toBe('search');
      expect(harness.component.status).toBe('ready');
      expect(harness.component.root).toBeUndefined();
      expect(harness.component.sortBy).toBe(harness.component.sortByDefaultOption);
      expect(harness.component.resultSet).toBe(sortedSearchResultsByLabelAsc);
      expect(spy).not.toHaveBeenCalled();
    }));

    it('should raise an error if failed to get search results', () => {
      const spy = jest.spyOn(toastrStub, 'error');

      implementProfileFieldsForFilters();
      implementSearchThrowsError();

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
        of(mockedRootDataModel)
      );
      dataRequestsStub.getRequestsIntersections.mockImplementationOnce(() =>
        of(mockedIntersections)
      );
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

  describe('add and remove bookmark', () => {
    const dataElementSearchResult: DataElementSearchResult = {
      id: '414afd2d-9b05-4a18-a08e-37b5c39fc957',
      label: 'Test Data Element',
      description: 'Test Data Element Description',
      breadcrumbs: [],
      dataClassId: '2',
      dataModelId: '3',
    };

    const dataElementBookmarkAddEvent: DataElementBookmarkEvent = {
      item: {
        id: dataElementSearchResult.id,
        dataModelId: dataElementSearchResult.dataModelId,
        dataClassId: dataElementSearchResult.dataClassId,
        label: dataElementSearchResult.label,
      },
      // item: dataElementSearchResult,
      selected: true,
    };

    const dataElementBookmarkRemoveEvent: DataElementBookmarkEvent = {
      // item: dataElementSearchResult,
      item: {
        id: dataElementSearchResult.id,
        dataModelId: dataElementSearchResult.dataModelId,
        dataClassId: dataElementSearchResult.dataClassId,
        label: dataElementSearchResult.label,
      },
      selected: false,
    };

    beforeEach(async () => {
      toastrStub.error.mockClear();
      toastrStub.success.mockClear();

      harness = await setupComponentTest({});
    });

    it('should raise a success toast when a bookmark is added', () => {
      const spy = jest.spyOn(toastrStub, 'success');

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      harness.component.ngOnInit();
      bookmarkStub.add.mockImplementationOnce(() => of({}));
      harness.component.bookmarkElement(dataElementBookmarkAddEvent);
      expect(spy).toHaveBeenCalled();
    });

    it('should raise a success toast when a bookmark is removed', () => {
      const spy = jest.spyOn(toastrStub, 'success');

      bookmarkStub.index.mockImplementationOnce(() => of([]));
      harness.component.ngOnInit();
      bookmarkStub.remove.mockImplementationOnce(() => of({}));
      harness.component.bookmarkElement(dataElementBookmarkRemoveEvent);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('selecting a new sortBy option', () => {
    it('should fire off a state reload upon selection of a new sortBy option', () => {
      const selectedSortByOption = { value: 'label-asc', displayName: 'name' };

      harness.component.selectSortBy(selectedSortByOption);

      // This simultaneously tests the private getSort and getOrder from sortByOptions methods.
      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith(
        '/search/listing',
        {
          sort: 'label',
          order: 'asc',
        }
      );
    });
  });

  describe('changing filters', () => {
    beforeEach(() => {
      stateRouterStub.navigateToKnownPath.mockClear();
    });

    it('should fire off a state reload when a new filter value is set', () => {
      const name = 'message';
      const value = 'hello';

      harness.component.filterChanged({ name, value });

      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith(
        '/search/listing',
        {
          page: 1,
          [name]: value,
        }
      );
    });

    it('should fire off a state reload when all filters are reset', () => {
      harness.component.filterReset();

      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith(
        '/search/listing',
        {
          page: 1,
        }
      );
    });
  });
});
