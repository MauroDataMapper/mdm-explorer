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
  CatalogueItemSearchResult,
  DataClass,
  DataClassDetail,
  DataElement,
  DataModel,
  DataModelDetail,
  SearchQueryParameters,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { DataClassIdentifier } from './catalogue.types';
import { DataModelService } from './data-model.service';

describe('DataModelService', () => {
  let service: DataModelService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(DataModelService, {
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

  it('should return a data model by path', () => {
    const expectedModel: DataModelDetail = {
      id: '1',
      label: 'test model',
      domainType: CatalogueItemDomainType.DataModel,
      availableActions: ['show'],
      finalised: true,
    };

    const path = `fo:Folder|dm:${expectedModel.label}`;

    endpointsStub.catalogueItem.getPath.mockImplementationOnce((domain, _) => {
      expect(domain).toBe('folders');
      return cold('--a|', {
        a: {
          body: expectedModel,
        },
      });
    });

    const expected$ = cold('--a|', { a: expectedModel });
    const actual$ = service.getDataModel(path);
    expect(actual$).toBeObservable(expected$);
  });

  describe('get data classes', () => {
    it.each([undefined, null])(
      'should return an empty list if %p parent provided',
      (parent) => {
        const expected$ = cold('(a|)', { a: [] });
        const actual$ = service.getDataClasses(parent!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
        expect(actual$).toBeObservable(expected$);
      }
    );

    it('should return an empty list if no parent id provided', () => {
      const parent: DataModel = {
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
      };

      const expected$ = cold('(a|)', { a: [] });
      const actual$ = service.getDataClasses(parent);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return an empty list if no data model id provided for parent data class', () => {
      const parent: DataClass = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
      };

      const expected$ = cold('(a|)', { a: [] });
      const actual$ = service.getDataClasses(parent);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a list of data classes from a parent data model', () => {
      const parent: DataModel = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
      };

      const expectedClasses: DataClass[] = [
        {
          id: '1',
          label: 'class1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '2',
          label: 'class2',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      endpointsStub.dataClass.list.mockImplementationOnce(() =>
        cold('--a|', {
          a: {
            body: {
              count: expectedClasses.length,
              items: expectedClasses,
            },
          },
        })
      );

      const expected$ = cold('--a|', { a: expectedClasses });
      const actual$ = service.getDataClasses(parent);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a list of data classes from a parent data class', () => {
      const parent: DataClass = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
        model: '2',
      };

      const expectedClasses: DataClass[] = [
        {
          id: '1',
          label: 'class1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '2',
          label: 'class2',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      endpointsStub.dataClass.listChildDataClasses.mockImplementationOnce(() =>
        cold('--a|', {
          a: {
            body: {
              count: expectedClasses.length,
              items: expectedClasses,
            },
          },
        })
      );

      const expected$ = cold('--a|', { a: expectedClasses });
      const actual$ = service.getDataClasses(parent);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('get data class', () => {
    it('should get a data class with no parent', () => {
      const id: DataClassIdentifier = {
        dataModelId: '1',
        dataClassId: '2',
      };

      const expectedDataClass: DataClassDetail = {
        id: id.dataClassId,
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
        availableActions: ['show'],
      };

      endpointsStub.dataClass.get.mockImplementationOnce((dmId, dcId) => {
        expect(dmId).toBe(id.dataModelId);
        expect(dcId).toBe(id.dataClassId);
        return cold('--a|', {
          a: {
            body: expectedDataClass,
          },
        });
      });

      const expected$ = cold('--a|', { a: expectedDataClass });
      const actual$ = service.getDataClass(id);
      expect(actual$).toBeObservable(expected$);
    });

    it('should get a data class from its parent', () => {
      const id: DataClassIdentifier = {
        dataModelId: '1',
        dataClassId: '2',
        parentDataClassId: '3',
      };

      const expectedDataClass: DataClassDetail = {
        id: id.dataClassId,
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
        availableActions: ['show'],
      };

      endpointsStub.dataClass.getChildDataClass.mockImplementationOnce(
        (dmId, dcId, cDcId) => {
          expect(dmId).toBe(id.dataModelId);
          expect(dcId).toBe(id.parentDataClassId);
          expect(cDcId).toBe(id.dataClassId);
          return cold('--a|', {
            a: {
              body: expectedDataClass,
            },
          });
        }
      );

      const expected$ = cold('--a|', { a: expectedDataClass });
      const actual$ = service.getDataClass(id);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('get data elements', () => {
    it('should return a list of data elements', () => {
      const id: DataClassIdentifier = {
        dataModelId: '1',
        dataClassId: '2',
      };

      const expectedElements: DataElement[] = [
        {
          id: '1',
          label: 'element 1',
          domainType: CatalogueItemDomainType.DataElement,
        },
        {
          id: '2',
          label: 'element 2',
          domainType: CatalogueItemDomainType.DataElement,
        },
      ];

      endpointsStub.dataElement.list.mockImplementationOnce((dmId, dcId) => {
        expect(dmId).toBe(id.dataModelId);
        expect(dcId).toBe(id.dataClassId);
        return cold('--a|', {
          a: {
            body: {
              count: expectedElements.length,
              items: expectedElements,
            },
          },
        });
      });

      const expected$ = cold('--a|', {
        a: {
          count: expectedElements.length,
          items: expectedElements,
        },
      });
      const actual$ = service.getDataElements(id);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('search data model', () => {
    it('should return search results', () => {
      const dataModelId = '123';
      const parameters: SearchQueryParameters = {
        searchTerm: 'test',
      };

      const expectedResults: CatalogueItemSearchResult[] = [
        {
          id: '1',
          label: 'result 1',
          domainType: CatalogueItemDomainType.DataElement,
          breadcrumbs: [],
        },
        {
          id: '2',
          label: 'result 2',
          domainType: CatalogueItemDomainType.DataElement,
          breadcrumbs: [],
        },
      ];

      endpointsStub.dataModel.search.mockImplementationOnce((id, params) => {
        expect(id).toBe(dataModelId);
        expect(params).toBe(parameters);
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
        a: {
          count: expectedResults.length,
          items: expectedResults,
        },
      });
      const actual$ = service.searchDataModel(dataModelId, parameters);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
