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
  DataModel,
  FolderDetail,
  CatalogueItemDomainType,
  DataElement,
  DataElementDetail,
  DataModelFull,
  SourceTargetIntersection,
  MdmIndexBody,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { DataModelService } from '../mauro/data-model.service';
import { DataElementBasic, DataRequest } from '../data-explorer/data-explorer.types';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { createSecurityServiceStub } from '../testing/stubs/security.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from './data-requests.service';
import { UserDetails } from '../security/user-details.service';
import { CatalogueUserService } from '../mauro/catalogue-user.service';
import { createCatalogueUserServiceStub } from '../testing/stubs/catalogue-user.stub';
import { createDataExplorerServiceStub } from '../testing/stubs/data-explorer.stub';
import { DataExplorerService } from './data-explorer.service';
import { SecurityService } from '../security/security.service';
import { ResearchPluginService } from '../mauro/research-plugin.service';
import { createResearchPluginServiceStub } from '../testing/stubs/research-plugin.stub';

describe('DataRequestsService', () => {
  let service: DataRequestsService;
  const dataModelsStub = createDataModelServiceStub();
  const catalogueUserStub = createCatalogueUserServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();
  const securityStub = createSecurityServiceStub();
  const researchPluginStub = createResearchPluginServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(DataRequestsService, {
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: ResearchPluginService,
          useValue: researchPluginStub,
        },
        {
          provide: CatalogueUserService,
          useValue: catalogueUserStub,
        },
        {
          provide: DataExplorerService,
          useValue: dataExplorerStub,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get requests folder', () => {
    it('should get the user folder with the expected name', () => {
      const expectedFolder: FolderDetail = {
        id: '9987',
        label: 'expected[at]email.com',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      const expectedUser: UserDetails = {
        id: '456',
        firstName: 'first',
        lastName: 'last',
        email: 'test@test.com',
        needsToResetPassword: false,
        role: '',
        token: undefined,
        requestFolder: expectedFolder,
      };

      securityStub.getSignedInUser.mockClear();
      securityStub.getSignedInUser.mockImplementationOnce(() => expectedUser);

      // Act
      const actual$ = service.getRequestsFolder();

      const expected$ = cold('(a|)', {
        a: expectedFolder,
      });

      // Assert
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('list', () => {
    it('should return a list of dms under the user folder', () => {
      // Arrange
      const expectedFolder: FolderDetail = {
        id: '9987',
        label: 'expected[at]email.com',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      const expectedUser: UserDetails = {
        id: '456',
        firstName: 'first',
        lastName: 'last',
        email: 'test@test.com',
        needsToResetPassword: false,
        role: '',
        token: undefined,
        requestFolder: expectedFolder,
      };

      securityStub.getSignedInUser.mockClear();
      securityStub.getSignedInUser.mockImplementationOnce(() => expectedUser);

      const dms = ['label-1', 'label-2', 'label-3'].map((label: string) => {
        return { label } as DataModel;
      });

      dataModelsStub.listInFolder.mockImplementationOnce(() => {
        return cold('-a|', {
          a: dms,
        });
      });

      const expected$ = cold('-a|', {
        a: dms.map((dm) => {
          return { ...dm, status: 'unsent' };
        }),
      });

      // Act
      const actual$ = service.list();

      // Assert
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('list data elements', () => {
    it('should return a flattened list of data elements from a data model', () => {
      const request = { id: '123' } as DataRequest;
      const dataElements = [
        { id: '1' },
        { id: '2' },
        { id: '3' },
        { id: '4' },
        { id: '5' },
        { id: '6' },
      ] as DataElement[];

      const expectedDataElements: DataElementDetail[] = dataElements.map((de) => {
        return {
          id: de.id,
          label: `element ${de.id}`,
          domainType: CatalogueItemDomainType.DataElement,
          availableActions: ['show'],
        };
      });

      // Test with a hierarchy that includes Data Elements in single and parent/child Data Classes
      const hierarchy: DataModelFull = {
        label: 'test model',
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
        childDataClasses: [
          {
            label: 'class 1',
            domainType: CatalogueItemDomainType.DataClass,
            availableActions: ['show'],
            dataElements: expectedDataElements.slice(0, 2),
          },
          {
            label: 'class 2',
            domainType: CatalogueItemDomainType.DataClass,
            availableActions: ['show'],
            dataElements: expectedDataElements.slice(2, 4),
            dataClasses: [
              {
                label: 'class 3',
                domainType: CatalogueItemDomainType.DataClass,
                availableActions: ['show'],
                dataElements: expectedDataElements.slice(4, 6),
              },
            ],
          },
        ],
      };

      dataModelsStub.getDataModelHierarchy.mockImplementationOnce((req) => {
        expect(req).toBe(request.id);
        return cold('--a|', {
          a: hierarchy,
        });
      });

      const expected$ = cold('--a|', { a: expectedDataElements });
      const actual$ = service.listDataElements(request);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('create requests', () => {
    const user: UserDetails = {
      id: '123',
      firstName: 'test',
      lastName: 'user',
      email: 'test@test.com',
    };

    const name = 'test request';
    const description = 'test description';

    const dataRequest: DataRequest = {
      id: '456',
      label: name,
      description,
      domainType: CatalogueItemDomainType.DataModel,
      status: 'unsent',
    };

    beforeEach(() => {
      // Mock a folder for the user's requests
      const expectedFolder: FolderDetail = {
        id: '9987',
        label: 'test[at]gmail.com',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      // Mock a signed in user
      const expectedUser: UserDetails = {
        id: '456',
        firstName: 'first',
        lastName: 'last',
        email: 'test@test.com',
        needsToResetPassword: false,
        role: '',
        token: undefined,
        requestFolder: expectedFolder,
      };

      securityStub.getSignedInUser.mockClear();
      securityStub.getSignedInUser.mockImplementation(() => expectedUser);

      catalogueUserStub.get.mockImplementationOnce(() => {
        return cold('-a|', {
          a: {
            organisation: 'test org',
          },
        });
      });

      dataModelsStub.addToFolder.mockImplementationOnce(() => {
        return cold('-a|', { a: dataRequest });
      });
    });

    it('should create a new data request', () => {
      const expected$ = cold('---a|', {
        a: dataRequest,
      });
      const actual$ = service.create(user, name, description);
      expect(actual$).toBeObservable(expected$);
    });

    it('should create a new request and copy elements to it', () => {
      const rootDataModelId = '789';
      const elements: DataElementBasic[] = [
        {
          id: '1',
          dataModelId: '999',
          dataClassId: '888',
          label: 'element 1',
          isBookmarked: false,
        },
        {
          id: '2',
          dataModelId: '999',
          dataClassId: '888',
          label: 'element 2',
          isBookmarked: false,
        },
      ];

      dataExplorerStub.getRootDataModel.mockImplementationOnce(() => {
        return cold('-a|', { a: { id: rootDataModelId } });
      });

      dataModelsStub.copySubset.mockImplementationOnce((sourceId, targetId, payload) => {
        expect(sourceId).toBe(rootDataModelId);
        expect(targetId).toBe(dataRequest.id);
        expect(payload.additions).toStrictEqual(elements.map((e) => e.id));
        return cold('-a|', { a: dataRequest });
      });

      const expected$ = cold('-----a|', {
        a: dataRequest,
      });
      const actual$ = service.createFromDataElements(elements, user, name, description);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('getRequestsIntersections', () => {
    it('should get some results', () => {
      // Arrange
      const sourceDataModelId = 'sourceId';
      const dataElementIds = ['element1Id', 'element2Id', 'element3Id'];

      const expectedDataAccessRequest: DataRequest = {
        id: 'targetId',
        label: 'Request 1',
        status: 'unsent',
        domainType: CatalogueItemDomainType.DataModel,
      };

      // Expected results
      const expectedSourceTargetIntersection: SourceTargetIntersection = {
        sourceDataModelId: 'sourceId',
        targetDataModelId: 'targetId',
        intersects: ['element1Id', 'element3Id'],
      };

      const expectedDataAccessRequestSourceTargetIntersection: DataAccessRequestsSourceTargetIntersections =
        {
          dataAccessRequests: [expectedDataAccessRequest],
          sourceTargetIntersections: [expectedSourceTargetIntersection],
        };

      const expected$ = cold('-----a|', {
        a: expectedDataAccessRequestSourceTargetIntersection,
      });

      // Mock a folder for the user's requests
      const expectedFolder: FolderDetail = {
        id: '9987',
        label: 'test[at]gmail.com',
        domainType: CatalogueItemDomainType.Folder,
        availableActions: [],
      };

      // Mock a signed in user
      const expectedUser: UserDetails = {
        id: '456',
        firstName: 'first',
        lastName: 'last',
        email: 'test@test.com',
        needsToResetPassword: false,
        role: '',
        token: undefined,
        requestFolder: expectedFolder,
      };

      securityStub.getSignedInUser.mockClear();
      securityStub.getSignedInUser.mockImplementation(() => expectedUser);

      // Mock one target model
      const target: DataModel = {
        id: 'targetId',
        label: 'Request 1',
        domainType: CatalogueItemDomainType.DataModel,
      };

      dataModelsStub.listInFolder.mockImplementationOnce(() => {
        return cold('-a|', {
          a: [target],
        });
      });

      // Mock a return from getIntersectionMany
      const many: MdmIndexBody<SourceTargetIntersection> = {
        count: 1,
        items: [expectedSourceTargetIntersection],
      };

      dataModelsStub.getIntersectionMany.mockImplementationOnce(() => {
        return cold('----a|', {
          a: many,
        });
      });

      // Actual
      const actual$ = service.getRequestsIntersections(sourceDataModelId, dataElementIds);

      // Assert
      expect(actual$).toBeObservable(expected$);

      securityStub.getSignedInUser.mockClear();
    });
  });
});
