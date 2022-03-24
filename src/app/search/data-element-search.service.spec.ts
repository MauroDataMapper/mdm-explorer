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
import { CatalogueItemDomainType, DataModelDetail } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { CatalogueService } from '../catalogue/catalogue.service';
import { DataModelService } from '../catalogue/data-model.service';
import { createCatalogueServiceStub } from '../testing/stubs/catalogue.stub';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { DataElementSearchService } from './data-element-search.service';
import { DataElementSearchParameters, DataElementSearchResultSet } from './search.types';

describe('DataElementSearchService', () => {
  let service: DataElementSearchService;
  const dataModelsStub = createDataModelServiceStub();
  const catalogueStub = createCatalogueServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(DataElementSearchService, {
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: CatalogueService,
          useValue: catalogueStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('listing', () => {
    it('should throw an error if no root Data Class is provided', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.listing({});
      expect(actual$).toBeObservable(expected$);
    });

    it('should return Data Element results when a root Data Class is provided', () => {
      const params: DataElementSearchParameters = {
        dataClass: {
          dataClassId: '1',
          dataModelId: '2',
        },
      };

      const expectedResultSet: DataElementSearchResultSet = {
        count: 2,
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
        ],
      };

      dataModelsStub.getDataElements.mockImplementationOnce((id) => {
        expect(id).toBe(params.dataClass);
        return cold('--a|', { a: expectedResultSet });
      });

      const expected$ = cold('--a|', { a: expectedResultSet });
      const actual$ = service.listing(params);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('search', () => {
    it('should throw an error if no root Data Model exists', () => {
      const expectedError = new Error('fail');
      catalogueStub.getRootDataModel.mockImplementationOnce(() =>
        cold('#', null, expectedError)
      );

      const expected$ = cold('#', null, expectedError);
      const actual$ = service.search({ search: 'test' });
      expect(actual$).toBeObservable(expected$);
    });

    it('should return Data Element results when search parameters are provided', () => {
      const parameters: DataElementSearchParameters = {
        search: 'test',
      };

      const expectedRootModel: DataModelDetail = {
        id: '123',
        label: 'model',
        domainType: CatalogueItemDomainType.DataModel,
        finalised: true,
        availableActions: ['show'],
      };

      const expectedResultSet: DataElementSearchResultSet = {
        count: 2,
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
        ],
      };

      catalogueStub.getRootDataModel.mockImplementationOnce(() => {
        return cold('--a|', {
          a: expectedRootModel,
        });
      });

      dataModelsStub.searchDataModel.mockImplementationOnce((id, params) => {
        expect(id).toBe(expectedRootModel.id);
        expect(params.searchTerm).toBe(parameters.search);
        return cold('--a|', { a: expectedResultSet });
      });

      const expected$ = cold('----a|', { a: expectedResultSet });
      const actual$ = service.search(parameters);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
