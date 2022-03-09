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
  DataClass,
  DataModel,
  DataModelDetail,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';

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
});
