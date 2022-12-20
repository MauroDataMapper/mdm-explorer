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
  DataElementDetail,
  DataModelFull,
  SourceTargetIntersection,
  MdmIndexBody,
  DataModelDetail,
  Uuid,
  Rule,
  RuleRepresentation,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { DataModelService } from '../mauro/data-model.service';
import {
  DataElementDto,
  DataElementInstance,
  DataRequest,
  DataRequestQuery,
  dataRequestQueryLanguage,
  DataRequestQueryPayload,
  DataRequestQueryType,
  QueryCondition,
} from '../data-explorer/data-explorer.types';
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
import { of } from 'rxjs';
import { CreateRequestDialogResponse } from './create-request-dialog/create-request-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BroadcastService } from '../core/broadcast.service';
import { ToastrService } from 'ngx-toastr';
import { createMatDialogStub } from '../testing/stubs/mat-dialog.stub';
import { createBroadcastServiceStub } from '../testing/stubs/broadcast.stub';
import { createToastrServiceStub } from '../testing/stubs/toastr.stub';
import { createRulesServiceStub } from '../testing/stubs/rules.stub';
import { RulesService } from '../mauro/rules.service';

describe('DataRequestsService', () => {
  let service: DataRequestsService;
  const dataModelsStub = createDataModelServiceStub();
  const catalogueUserStub = createCatalogueUserServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();
  const securityStub = createSecurityServiceStub();
  const researchPluginStub = createResearchPluginServiceStub();
  const dialogStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const toastrStub = createToastrServiceStub();
  const rulesStub = createRulesServiceStub();

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
        {
          provide: MatDialog,
          useValue: dialogStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: RulesService,
          useValue: rulesStub,
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

  describe('get', () => {
    it('should get a data request', () => {
      const expectedModel: DataModelDetail = {
        id: '1',
        label: 'test model',
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
      };

      dataModelsStub.getDataModelById.mockImplementationOnce((id) => {
        expect(id).toBe(expectedModel.id);
        return cold('--a|', {
          a: expectedModel,
        });
      });

      const expected$ = cold('--a|', { a: { ...expectedModel, status: 'unsent' } });
      const actual$ = service.get(expectedModel.id!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
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
      ] as DataElementDto[];

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
      const elements: DataElementInstance[] = [
        {
          id: '1',
          model: '999',
          dataClass: '888',
          label: 'element 1',
          isBookmarked: false,
        },
        {
          id: '2',
          model: '999',
          dataClass: '888',
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

  describe('createWithDialogs', () => {
    const dataElement1: DataElementInstance = {
      id: '1',
      dataClass: '2',
      model: '3',
      label: 'element 1',
      isBookmarked: false,
    };

    const dataElementsToAdd = [dataElement1];
    const getDataElements = () => of(dataElementsToAdd);

    const user: UserDetails = {
      id: 'test',
      firstName: 'test',
      lastName: 'user',
      email: 'test@test.com',
    };
    securityStub.getSignedInUser.mockImplementation(() => user);

    const name = 'test request';
    const description = 'test description';
    const requestCreation: CreateRequestDialogResponse = { name, description };

    dialogStub.usage.afterClosed.mockImplementation(() => of(requestCreation));

    beforeEach(() => {
      securityStub.getSignedInUser.mockClear();
    });

    it('should return a complete notification if no user signed in', () => {
      // arrange
      securityStub.getSignedInUser.mockImplementationOnce(() => null);
      const expected$ = cold('|');

      // act
      const actual$ = service.createWithDialogs(getDataElements);

      // assert
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a complete notification if response is undefined', () => {
      // arrange
      dialogStub.usage.afterClosed.mockImplementationOnce(() => of(undefined));
      const expected$ = cold('|');

      // act
      const actual$ = service.createWithDialogs(getDataElements);

      // assert
      expect(actual$).toBeObservable(expected$);
    });

    it('should fire a loading broadcast if dialog response retrieved', () => {
      // arrange
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      // act
      const actual$ = service.createWithDialogs(getDataElements);

      // assert
      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({
          isLoading: true,
          caption: 'Creating new request ...',
        });
      });
    });

    it('should display a toastr error and return a complete notification if createFromDataElements fails', () => {
      // arrange
      const toastrSpy = jest.spyOn(toastrStub, 'error');
      const expected$ = cold('|');

      // simulate a failure of createFromDataRequests. We are mocking this here because it's already
      // been tested above.
      service.createFromDataElements = jest.fn().mockReturnValueOnce(cold('#'));

      // act
      const actual$ = service.createWithDialogs(getDataElements);

      // assert
      expect(actual$).toBeObservable(expected$);

      expect(actual$).toSatisfyOnFlush(() => {
        expect(toastrSpy).toHaveBeenCalled();
      });
    });

    it('should broadcast data-request-added if createFromDataElements succeeds', () => {
      // arrange
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      dialogStub.usage.afterClosed.mockImplementationOnce(() => of('continue'));
      service.createFromDataElements = jest
        .fn()
        .mockReturnValueOnce(cold('a', { a: { id: '456' } as DataRequest }));

      // act
      const actual$ = service.createWithDialogs(getDataElements);

      // assert
      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({ isLoading: false });
      });
    });
  });

  describe('getQuery', () => {
    const requestId: Uuid = '1234';
    const queryTypes: DataRequestQueryType[] = ['cohort', 'data'];

    it('should return nothing when no rules exist', () => {
      rulesStub.list.mockImplementationOnce((dt, id) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(requestId);
        return cold('--a|', { a: [] });
      });

      const expected$ = cold('--a|', { a: undefined });
      const actual$ = service.getQuery(requestId, 'cohort');
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)(
      'should return nothing when no matching %p rule found',
      (type) => {
        rulesStub.list.mockImplementationOnce((dt, id) => {
          expect(dt).toBe('dataModels');
          expect(id).toBe(requestId);
          return cold('--a|', {
            a: [
              {
                name: 'test',
              },
            ],
          });
        });

        const expected$ = cold('--a|', { a: undefined });
        const actual$ = service.getQuery(requestId, type);
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(queryTypes)(
      'should return nothing when no representation found for %p rule',
      (type) => {
        rulesStub.list.mockImplementationOnce((dt, id) => {
          expect(dt).toBe('dataModels');
          expect(id).toBe(requestId);
          return cold('--a|', {
            a: [
              {
                name: type,
                ruleRepresentations: [],
              },
            ],
          });
        });

        const expected$ = cold('--a|', { a: undefined });
        const actual$ = service.getQuery(requestId, type);
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(queryTypes)('should return query for %p rule', (type) => {
      const condition = [1, 2, 3];
      const rule: Rule = {
        id: '456',
        name: type,
        ruleRepresentations: [
          {
            id: '789',
            language: dataRequestQueryLanguage,
            representation: JSON.stringify(condition),
          },
        ],
      };

      rulesStub.list.mockImplementationOnce((dt, id) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(requestId);
        return cold('--a|', {
          a: [rule],
        });
      });

      const expected$ = cold('--a|', {
        a: {
          ruleId: rule.id,
          representationId: rule.ruleRepresentations[0].id,
          type,
          condition,
        },
      });
      const actual$ = service.getQuery(requestId, type);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('createOrUpdateQuery', () => {
    const requestId: Uuid = '1234';
    const queryTypes: DataRequestQueryType[] = ['cohort', 'data'];
    const condition: QueryCondition = { condition: 'and', rules: [] };

    const representation: RuleRepresentation = {
      id: '789',
      language: dataRequestQueryLanguage,
      representation: JSON.stringify(condition, null, 2),
    };
    const rule: Rule = {
      id: '456',
      name: 'temp',
      ruleRepresentations: [representation],
    };

    it.each(queryTypes)('should create a %p rule when it is missing', (type) => {
      const payload: DataRequestQueryPayload = {
        type,
        condition,
      };

      const expected: DataRequestQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };

      rulesStub.create.mockImplementationOnce((dt, id, rpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(requestId);
        expect(rpl.name).toBe(type);
        return cold('-a|', { a: rule });
      });

      rulesStub.createRepresentation.mockImplementationOnce((dt, id, rid, rrpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(requestId);
        expect(rid).toBe(rule.id);
        expect(rrpl.language).toBe(dataRequestQueryLanguage);
        expect(rrpl.representation).toBe(representation.representation);
        return cold('-a|', { a: representation });
      });

      const expected$ = cold('---(a|)', { a: expected });
      const actual$ = service.createOrUpdateQuery(requestId, payload);
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)(
      'should use an existing %p rule and create a representation',
      (type) => {
        const payload: DataRequestQueryPayload = {
          ruleId: rule.id,
          type,
          condition,
        };

        const expected: DataRequestQuery = {
          ruleId: rule.id,
          representationId: representation.id,
          ...payload,
        };

        rulesStub.get.mockImplementationOnce((dt, id, rid) => {
          expect(dt).toBe('dataModels');
          expect(id).toBe(requestId);
          expect(rid).toBe(rid);
          return cold('-a|', { a: rule });
        });

        rulesStub.createRepresentation.mockImplementationOnce((dt, id, rid, rrpl) => {
          expect(dt).toBe('dataModels');
          expect(id).toBe(requestId);
          expect(rid).toBe(rule.id);
          expect(rrpl.language).toBe(dataRequestQueryLanguage);
          expect(rrpl.representation).toBe(representation.representation);
          return cold('-a|', { a: representation });
        });

        const expected$ = cold('---(a|)', { a: expected });
        const actual$ = service.createOrUpdateQuery(requestId, payload);
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(queryTypes)('should update a representation for a %p rule', (type) => {
      const payload: DataRequestQueryPayload = {
        ruleId: rule.id,
        representationId: representation.id,
        type,
        condition,
      };

      const expected: DataRequestQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };

      rulesStub.get.mockImplementationOnce((dt, id, rid) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(requestId);
        expect(rid).toBe(rid);
        return cold('-a|', { a: rule });
      });

      rulesStub.updateRepresentation.mockImplementationOnce((dt, id, rid, rrid, rrpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(requestId);
        expect(rid).toBe(rule.id);
        expect(rrid).toBe(representation.id);
        expect(rrpl.language).toBe(dataRequestQueryLanguage);
        expect(rrpl.representation).toBe(representation.representation);
        return cold('-a|', { a: representation });
      });

      const expected$ = cold('---(a|)', { a: expected });
      const actual$ = service.createOrUpdateQuery(requestId, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
