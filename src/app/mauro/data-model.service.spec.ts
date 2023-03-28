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
  CatalogueItemSearchResult,
  DataClass,
  DataClassDetail,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelFull,
  DataModelSubsetPayload,
  ModelUpdatePayload,
  SearchQueryParameters,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { assert } from 'console';
import { cold } from 'jest-marbles';
import { DataElementDto } from '../data-explorer/data-explorer.types';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { DataModelService } from './data-model.service';
import { DataClassIdentifier } from './mauro.types';

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

  it('should return a data model by id', () => {
    const expectedModel: DataModelDetail = {
      id: '1',
      label: 'test model',
      domainType: CatalogueItemDomainType.DataModel,
      availableActions: ['show'],
      finalised: true,
    };

    endpointsStub.dataModel.get.mockImplementationOnce((id) => {
      expect(id).toBe(expectedModel.id);
      return cold('--a|', {
        a: {
          body: expectedModel,
        },
      });
    });

    const expected$ = cold('--a|', { a: expectedModel });
    const actual$ = service.getDataModelById(expectedModel.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
    expect(actual$).toBeObservable(expected$);
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

      const expectedElements: DataElementDto[] = [
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

  describe('list dataModels in folder', () => {
    it('should return an observable containing a list of dataModel objects', () => {
      const dms = ['label-1', 'label-2', 'label-3'].map((label: string) => {
        return { label } as DataModel;
      });

      const expected$ = cold('-a|', {
        a: dms,
      });

      endpointsStub.dataModel.listInFolder.mockImplementationOnce(() => {
        return cold('-a|', {
          a: { body: { items: dms } },
        });
      });

      const actual$ = service.listInFolder('folderId');

      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('data model hierarchies', () => {
    it('should return a data model hierarchy', () => {
      const hierarchy: DataModelFull = {
        id: '123',
        label: 'test model',
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
        dataTypes: [
          {
            label: 'test type',
            domainType: CatalogueItemDomainType.ModelDataType,
            availableActions: ['show'],
          },
        ],
        childDataClasses: [
          {
            label: 'test class',
            domainType: CatalogueItemDomainType.DataClass,
            availableActions: ['show'],
            dataElements: [
              {
                label: 'test element',
                domainType: CatalogueItemDomainType.DataElement,
                availableActions: ['show'],
              },
            ],
          },
        ],
      };

      endpointsStub.dataModel.hierarchy.mockImplementationOnce((id) => {
        expect(id).toBe(hierarchy.id);
        return cold('--a|', {
          a: {
            body: hierarchy,
          },
        });
      });

      const expected$ = cold('--a|', { a: hierarchy });
      const actual$ = service.getDataModelHierarchy('123');
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('add to folder', () => {
    it('should return a new data model', () => {
      const folderId = '1';
      const payload: DataModelCreatePayload = {
        folder: folderId,
        type: 'Data Asset',
        label: 'test',
        author: 'tester',
        organisation: 'test org',
      };

      const dataModel: DataModelDetail = {
        id: '2',
        label: payload.label,
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
      };

      endpointsStub.dataModel.addToFolder.mockImplementationOnce((fId, pl) => {
        expect(fId).toBe(folderId);
        expect(pl).toBe(payload);
        return cold('--a|', { a: { body: dataModel } });
      });

      const expected$ = cold('--a|', { a: dataModel });
      const actual$ = service.addToFolder(folderId, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('move to folder', () => {
    it('should return a data model', () => {
      const folderId: Uuid = '1';
      const dataModel: DataModelDetail = {
        id: '2',
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
      };

      endpointsStub.dataModel.moveDataModelToFolder.mockImplementationOnce((mId, fId) => {
        expect(mId).toBe(dataModel.id);
        expect(fId).toBe(folderId);
        return cold('--a|', { a: { body: dataModel } });
      });

      const expected$ = cold('--a|', { a: dataModel });
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const actual$ = service.moveToFolder(dataModel.id!, folderId);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('copy subset', () => {
    it('should copy a subset to a target model', () => {
      const sourceId = '123';
      const targetId = '456';
      const payload: DataModelSubsetPayload = {
        additions: ['1', '2', '3'],
        deletions: ['4', '5'],
      };

      const targetDataModel: DataModelDetail = {
        id: targetId,
        label: 'target',
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
      };

      endpointsStub.dataModel.copySubset.mockImplementation((sId, tId, pl) => {
        expect(sId).toBe(sourceId);
        expect(tId).toBe(targetId);
        expect(pl).toBe(payload);
        return cold('--a|', { a: { body: targetDataModel } });
      });

      const expected$ = cold('--a|', { a: targetDataModel });
      const actual$ = service.copySubset(sourceId, targetId, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('get data elements for data class', () => {
    const dataClass: DataClass = {
      id: '1',
      label: 'class 1',
      domainType: CatalogueItemDomainType.DataClass,
      model: '2',
    };

    const mockImplementReturnChildDataClasses = (dataClasses: DataClass[]) => {
      endpointsStub.dataClass.listChildDataClasses.mockImplementationOnce(() =>
        cold('-a|', {
          a: {
            body: {
              count: dataClasses.length,
              items: dataClasses,
            },
          },
        })
      );
    };

    const mockImplementReturnDataElements = (dataElements: DataElementDto[]) => {
      endpointsStub.dataElement.list.mockImplementationOnce(() => {
        return cold('-a|', {
          a: {
            body: {
              count: dataElements.length,
              items: dataElements,
            },
          },
        });
      });
    };

    it('should return data elements for a single child data class', () => {
      const dataElements: DataElementDto[] = [
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

      mockImplementReturnChildDataClasses([]);
      mockImplementReturnDataElements(dataElements);

      const expected$ = cold('---(a|)', {
        a: dataElements,
      });
      const actual$ = service.getDataElementsForDataClass(dataClass);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return data elements for a parent class and all child data classes', () => {
      const childDataClass: DataClass = {
        id: '2',
        label: 'class 2',
        domainType: CatalogueItemDomainType.DataClass,
        model: '2',
      };

      mockImplementReturnChildDataClasses([childDataClass]);

      const dataElementsForClass1: DataElementDto[] = [
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

      const dataElementsForClass2: DataElementDto[] = [
        {
          id: '3',
          label: 'element 3',
          domainType: CatalogueItemDomainType.DataElement,
        },
        {
          id: '4',
          label: 'element 4',
          domainType: CatalogueItemDomainType.DataElement,
        },
      ];

      mockImplementReturnDataElements(dataElementsForClass1);
      mockImplementReturnDataElements(dataElementsForClass2);

      const expected$ = cold('---(a|)', {
        a: dataElementsForClass1.concat(dataElementsForClass2),
      });
      const actual$ = service.getDataElementsForDataClass(dataClass);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('create next version', () => {
    it('should throw an error if no model id is provided', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.createNextVersion({
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
      });
      expect(actual$).toBeObservable(expected$);
    });

    it('should throw an error if the model is not finalised', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.createNextVersion({
        id: '123',
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
      });
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a new draft model', () => {
      const currentModel: DataModel = {
        id: '123',
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
        modelVersion: '1.0.0',
      };

      const nextModel: DataModel = {
        ...currentModel,
        id: '456',
        modelVersion: undefined,
      };

      endpointsStub.dataModel.newBranchModelVersion.mockImplementationOnce(
        (id, payload) => {
          expect(id).toBe(currentModel.id);
          expect(payload).toStrictEqual({});
          return cold('--a|', {
            a: {
              body: nextModel,
            },
          });
        }
      );

      const expected$ = cold('--a|', {
        a: nextModel,
      });

      const actual$ = service.createNextVersion({
        id: '123',
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
        modelVersion: '1.0.0',
      });
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('create fork', () => {
    it('should throw an error if no model id is provided', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.createFork(
        {
          label: 'test',
          domainType: CatalogueItemDomainType.DataModel,
        },
        { label: 'next' }
      );
      expect(actual$).toBeObservable(expected$);
    });

    it('should throw an error if the model is not finalised', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.createFork(
        {
          id: '123',
          label: 'test',
          domainType: CatalogueItemDomainType.DataModel,
        },
        { label: 'next' }
      );
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a new draft model', () => {
      const currentModel: DataModel = {
        id: '123',
        label: 'test',
        domainType: CatalogueItemDomainType.DataModel,
        modelVersion: '1.0.0',
      };

      const nextModel: DataModel = {
        ...currentModel,
        id: '456',
        label: 'next',
        modelVersion: undefined,
      };

      endpointsStub.dataModel.newForkModel.mockImplementationOnce((id, payload) => {
        expect(id).toBe(currentModel.id);
        expect(payload).toStrictEqual({ label: nextModel.label });
        return cold('--a|', {
          a: {
            body: nextModel,
          },
        });
      });

      const expected$ = cold('--a|', {
        a: nextModel,
      });

      const actual$ = service.createFork(
        {
          id: '123',
          label: 'test',
          domainType: CatalogueItemDomainType.DataModel,
          modelVersion: '1.0.0',
        },
        { label: nextModel.label }
      );
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('Update data model', () => {
    it('should update data model', () => {
      // Arrange
      const label = 'edited label';
      const description = 'edited description';

      const expectedModel: DataModelDetail = {
        id: '1',
        label,
        domainType: CatalogueItemDomainType.DataModel,
        description,
        availableActions: ['show'],
        finalised: true,
      };

      endpointsStub.dataModel.update.mockImplementationOnce((id) => {
        expect(id).toBe(expectedModel.id);
        return cold('--a|', {
          a: {
            body: expectedModel,
          },
        });
      });

      if (!expectedModel.id) {
        assert(expectedModel.id, 'expected model id is null');
        return;
      }
      const dataSpecification: ModelUpdatePayload = {
        domainType: CatalogueItemDomainType.DataModel,
        id: expectedModel.id,
        label,
        description,
      };

      const expected$ = cold('--a|', { a: expectedModel });

      // Act
      const actual$ = service.update(expectedModel.id, dataSpecification);

      // Assert
      expect(actual$).toBeObservable(expected$);
    });

    it('should throw an error if empty id passed as parameter', () => {
      // Arrange
      const expected$ = cold('#', null, new Error());

      const emptyId = '';

      const dataSpecification: ModelUpdatePayload = {
        domainType: CatalogueItemDomainType.DataModel,
        id: '1',
        label: 'label',
        description: 'description',
      };

      // Act
      const actual$ = service.update(emptyId, dataSpecification);

      // Assert
      expect(actual$).toBeObservable(expected$);
    });

    it('should throw an error if empty id passed in payload', () => {
      // Arrange
      const expected$ = cold('#', null, new Error());

      const emptyId = '';

      const dataSpecification: ModelUpdatePayload = {
        domainType: CatalogueItemDomainType.DataModel,
        id: emptyId,
        label: 'label',
        description: 'description',
      };

      // Act
      const actual$ = service.update('1', dataSpecification);

      // Assert
      expect(actual$).toBeObservable(expected$);
    });
  });
});
