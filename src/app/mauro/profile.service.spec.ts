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
  CatalogueItemDomainType,
  MultiFacetAwareDomainType,
  Profile,
  ProfileDefinition,
  ProfileSearchResult,
  SearchQueryParameters,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(ProfileService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get profile', () => {
    it('should get a profile for a data element', () => {
      const expectedProfile: Profile = {
        id: '1',
        label: 'test profild',
        domainType: CatalogueItemDomainType.DataElement,
        sections: [],
      };

      endpointsStub.profile.profile.mockImplementationOnce(
        (domainType, id, namespace, name) => {
          expect(domainType).toBe(CatalogueItemDomainType.DataElement);
          expect(id).toBe('1');
          expect(namespace).toBe('namespace');
          expect(name).toBe('name');
          return cold('--a|', {
            a: {
              body: expectedProfile,
            },
          });
        }
      );

      const expected$ = cold('--a|', { a: expectedProfile });
      const actual$ = service.get(
        CatalogueItemDomainType.DataElement,
        '1',
        'namespace',
        'name'
      );
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('definitions', () => {
    it('should get the definition of a profile', () => {
      const definition: ProfileDefinition = {
        sections: [
          {
            name: 'section',
            fields: [
              {
                fieldName: 'field',
                metadataPropertyName: 'field',
                dataType: 'string',
              },
            ],
          },
        ],
      };

      const profileNamespace = 'test.namespace';
      const profileName = 'testProfile';

      endpointsStub.profile.definition.mockImplementationOnce((pns, pn) => {
        expect(pns).toBe(profileNamespace);
        expect(pn).toBe(profileName);
        return cold('--a|', {
          a: {
            body: definition,
          },
        });
      });

      const expected$ = cold('--a|', { a: definition });
      const actual$ = service.definition(profileNamespace, profileName);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('searching', () => {
    const profileNamespace = 'test.namespace';
    const profileName = 'testProfile';
    const query: SearchQueryParameters = { searchTerm: 'test' };

    const expectedResults: ProfileSearchResult[] = [
      {
        id: '1',
        label: 'result 1',
        breadcrumbs: [],
        profileFields: [],
      },
      {
        id: '2',
        label: 'result 2',
        breadcrumbs: [],
        profileFields: [],
      },
    ];

    it('should search across the catalogue', () => {
      endpointsStub.profile.search.mockImplementationOnce((pns, pn, q) => {
        expect(pns).toBe(profileNamespace);
        expect(pn).toBe(profileName);
        expect(q).toBe(query);
        return cold('--a|', {
          a: {
            body: {
              count: expectedResults.length,
              items: expectedResults,
            },
          },
        });
      });

      const expected$ = cold('--a|', {
        a: { count: expectedResults.length, items: expectedResults },
      });
      const actual$ = service.search(profileNamespace, profileName, query);
      expect(actual$).toBeObservable(expected$);
    });

    it('should search within a catalogue item', () => {
      const domainType = MultiFacetAwareDomainType.DataModels;
      const id = '123';

      endpointsStub.profile.searchCatalogueItem.mockImplementationOnce(
        (dt, i, pns, pn, q) => {
          expect(dt).toBe(domainType);
          expect(i).toBe(id);
          expect(pns).toBe(profileNamespace);
          expect(pn).toBe(profileName);
          expect(q).toBe(query);
          return cold('--a|', {
            a: {
              body: {
                count: expectedResults.length,
                items: expectedResults,
              },
            },
          });
        }
      );

      const expected$ = cold('--a|', {
        a: { count: expectedResults.length, items: expectedResults },
      });
      const actual$ = service.searchCatalogueItem(
        domainType,
        id,
        profileNamespace,
        profileName,
        query
      );
      expect(actual$).toBeObservable(expected$);
    });
  });
});
