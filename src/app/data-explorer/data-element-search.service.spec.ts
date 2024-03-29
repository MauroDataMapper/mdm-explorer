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
import {
  CatalogueItemDomainType,
  DataModelDetail,
  MultiFacetAwareDomainType,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { DataExplorerService } from './data-explorer.service';
import { DataElementSearchService } from './data-element-search.service';
import {
  DataElementSearchParameters,
  DataElementSearchResultSet,
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from './data-explorer.types';
import { createProfileServiceStub } from '../testing/stubs/profile.stub';
import { ProfileService } from '../mauro/profile.service';

describe('DataElementSearchService', () => {
  let service: DataElementSearchService;
  const profilesStub = createProfileServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();

  const explorerConfig: DataExplorerConfiguration = {
    profileNamespace: 'test.namespace',
    profileServiceName: 'testProfile',
  };

  beforeEach(() => {
    service = setupTestModuleForService(DataElementSearchService, {
      providers: [
        {
          provide: ProfileService,
          useValue: profilesStub,
        },
        {
          provide: DataExplorerService,
          useValue: dataExplorerStub,
        },
        {
          provide: DATA_EXPLORER_CONFIGURATION,
          useValue: explorerConfig,
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
        totalResults: 2,
        pageSize: 10,
        page: 1,
        items: [
          {
            id: '1',
            label: 'result 1',
            breadcrumbs: [],
            dataClass: '',
            model: '',
            isSelected: false,
            isBookmarked: false,
          },
          {
            id: '2',
            label: 'result 2',
            breadcrumbs: [],
            dataClass: '',
            model: '',
            isSelected: false,
            isBookmarked: false,
          },
        ],
      };

      profilesStub.searchCatalogueItem.mockImplementationOnce(
        (domainType, id, profileNamespace, profileName) => {
          expect(domainType).toBe(MultiFacetAwareDomainType.DataClasses);
          expect(id).toBe(params.dataClass?.dataClassId);
          expect(profileNamespace).toBe(explorerConfig.profileNamespace);
          expect(profileName).toBe(explorerConfig.profileServiceName);
          return cold('--a|', {
            a: {
              count: expectedResultSet.items.length,
              items: expectedResultSet.items.map((res) => {
                return {
                  ...res,
                  profileFields: [],
                };
              }),
            },
          });
        }
      );

      const expected$ = cold('--a|', { a: expectedResultSet });
      const actual$ = service.listing(params);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('search', () => {
    it('should throw an error if no root Data Model exists', () => {
      const expectedError = new Error('fail');
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
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
        totalResults: 2,
        pageSize: 10,
        page: 1,
        items: [
          {
            id: '1',
            label: 'result 1',
            breadcrumbs: [],
            dataClass: '',
            model: '',
            isSelected: false,
            isBookmarked: false,
          },
          {
            id: '2',
            label: 'result 2',
            breadcrumbs: [],
            dataClass: '',
            model: '',
            isSelected: false,
            isBookmarked: false,
          },
        ],
      };

      dataExplorerStub.getRootDataModel.mockImplementationOnce(() => {
        return cold('--a|', {
          a: expectedRootModel,
        });
      });

      profilesStub.searchCatalogueItem.mockImplementationOnce(
        (domainType, id, profileNamespace, profileName, params) => {
          expect(domainType).toBe(MultiFacetAwareDomainType.DataModels);
          expect(id).toBe(expectedRootModel.id);
          expect(profileNamespace).toBe(explorerConfig.profileNamespace);
          expect(profileName).toBe(explorerConfig.profileServiceName);
          expect(params.searchTerm).toBe(parameters.search);
          return cold('--a|', {
            a: {
              count: expectedResultSet.items.length,
              items: expectedResultSet.items.map((res) => {
                return {
                  ...res,
                  profileFields: [],
                };
              }),
            },
          });
        }
      );

      const expected$ = cold('----a|', { a: expectedResultSet });
      const actual$ = service.search(parameters);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
