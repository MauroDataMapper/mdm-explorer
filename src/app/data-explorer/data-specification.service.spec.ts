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
  Folder,
  ModelUpdatePayload,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { DataModelService } from '../mauro/data-model.service';
import {
  DataElementDto,
  DataElementInstance,
  DataSpecification,
  DataSpecificationQuery,
  dataSpecificationQueryLanguage,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  ForkDataSpecificationOptions,
  QueryCondition,
  QueryExpression,
} from './data-explorer.types';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { createSecurityServiceStub } from '../testing/stubs/security.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import {
  DataSpecificationSourceTargetIntersections,
  DataSpecificationService,
} from './data-specification.service';
import { UserDetails } from '../security/user-details.service';
import { CatalogueUserService } from '../mauro/catalogue-user.service';
import { createCatalogueUserServiceStub } from '../testing/stubs/catalogue-user.stub';
import { createDataExplorerServiceStub } from '../testing/stubs/data-explorer.stub';
import { DataExplorerService } from './data-explorer.service';
import { SecurityService } from '../security/security.service';
import { ResearchPluginService } from '../mauro/research-plugin.service';
import { createResearchPluginServiceStub } from '../testing/stubs/research-plugin.stub';
import { EMPTY, of } from 'rxjs';
import { CreateDataSpecificationDialogResponse } from './create-data-specification-dialog/create-data-specification-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { BroadcastService } from '../core/broadcast.service';
import { ToastrService } from 'ngx-toastr';
import { createMatDialogStub } from '../testing/stubs/mat-dialog.stub';
import { createBroadcastServiceStub } from '../testing/stubs/broadcast.stub';
import { createToastrServiceStub } from '../testing/stubs/toastr.stub';
import { createRulesServiceStub } from '../testing/stubs/rules.stub';
import { RulesService } from '../mauro/rules.service';
import { EditDataSpecificationDialogResponse } from './edit-data-specification-dialog/edit-data-specification-dialog.component';
import { CoreTableProfileService } from './core-table-profile.service';
import { createCoreTableProfileStub } from '../testing/stubs/core-table-profile.stub';
import { SubmissionSDEService } from './specification-submission/services/submission.sde.service';
import { createSubmissionSDEServiceStub } from '../testing/stubs/data-specification-submission/submission-sde-service.stub';

describe('DataSpecificationService', () => {
  let service: DataSpecificationService;
  const dataModelsStub = createDataModelServiceStub();
  const catalogueUserStub = createCatalogueUserServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();
  const securityStub = createSecurityServiceStub();
  const researchPluginStub = createResearchPluginServiceStub();
  const dialogStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const toastrStub = createToastrServiceStub();
  const rulesStub = createRulesServiceStub();
  const coreTableProfileStub = createCoreTableProfileStub();
  const submissionSDEServiceStub = createSubmissionSDEServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(DataSpecificationService, {
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
        {
          provide: CoreTableProfileService,
          useValue: coreTableProfileStub,
        },
        {
          provide: SubmissionSDEService,
          useValue: submissionSDEServiceStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get data specification folder', () => {
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
        dataSpecificationFolder: expectedFolder,
      };

      securityStub.getSignedInUser.mockClear();
      securityStub.getSignedInUser.mockImplementationOnce(() => expectedUser);

      // Act
      const actual$ = service.getDataSpecificationFolder();

      const expected$ = cold('(a|)', {
        a: expectedFolder,
      });

      // Assert
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('get', () => {
    it('should get a data specification', () => {
      const expectedModel: DataSpecification = {
        id: '1',
        label: 'test model',
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
        status: 'draft',
      };

      dataModelsStub.getDataModelById.mockImplementationOnce((id) => {
        expect(id).toBe(expectedModel.id);
        return cold('--a|', {
          a: expectedModel,
        });
      });

      submissionSDEServiceStub.mapToDataSpecificationWithSDEStatusCheck.mockImplementationOnce(
        (dataModel) => {
          expect(dataModel.id).toBe(expectedModel.id);
          return cold('----a|', {
            a: expectedModel as DataSpecification,
          });
        }
      );

      const expected$ = cold('------a|', { a: { ...expectedModel, status: 'draft' } });
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
        dataSpecificationFolder: expectedFolder,
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

      submissionSDEServiceStub.mapToDataSpecificationWithSDEStatusCheck.mockImplementation(
        (dataModel) => {
          return cold('(a|)', {
            a: { ...dataModel, status: 'draft' } as DataSpecification,
          });
        }
      );

      const expected$ = cold('-a|', {
        a: dms.map((dm) => {
          return { ...dm, status: 'draft' };
        }),
      });

      // Act
      const actual$ = service.list();

      // Assert
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('list templates', () => {
    it('should return a list of template data specifications', () => {
      const templates: DataSpecification[] = [
        {
          id: '1',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'template 1',
          status: 'draft',
        },
        {
          id: '2',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'template 2',
          status: 'draft',
        },
      ];

      const folder: FolderDetail = {
        id: '123',
        domainType: CatalogueItemDomainType.Folder,
        label: 'folder',
        availableActions: [],
      };

      researchPluginStub.templateFolder.mockImplementationOnce(() => {
        return cold('-a|', { a: folder });
      });

      dataModelsStub.listInFolder.mockImplementationOnce((fId) => {
        expect(fId).toBe(folder.id);
        return cold('-a|', { a: templates });
      });

      submissionSDEServiceStub.mapToDataSpecification.mockImplementation((dataModel) => {
        return { ...dataModel, status: 'draft' } as DataSpecification;
      });

      const expected$ = cold('--a|', { a: templates });
      const actual$ = service.listTemplates();
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('list data elements', () => {
    it('should return a flattened list of data elements from a data model', () => {
      const dataSpecification = { id: '123' } as DataSpecification;
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

      dataModelsStub.getDataModelHierarchy.mockImplementationOnce((specification) => {
        expect(specification).toBe(dataSpecification.id);
        return cold('--a|', {
          a: hierarchy,
        });
      });

      const expected$ = cold('--a|', { a: expectedDataElements });
      const actual$ = service.listDataElements(dataSpecification);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('create data specifications', () => {
    const user: UserDetails = {
      id: '123',
      firstName: 'test',
      lastName: 'user',
      email: 'test@test.com',
    };

    const name = 'test data specification';
    const description = 'test description';

    const dataSpecification: DataSpecification = {
      id: '456',
      label: name,
      description,
      domainType: CatalogueItemDomainType.DataModel,
      status: 'draft',
    };

    beforeEach(() => {
      // Mock a folder for the user's data specifications
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
        dataSpecificationFolder: expectedFolder,
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
        return cold('-a|', { a: dataSpecification });
      });
    });

    it('should create a new data specification', () => {
      const expected$ = cold('---a|', {
        a: dataSpecification,
      });

      submissionSDEServiceStub.mapToDataSpecification.mockImplementationOnce((dataModel) => {
        expect(dataModel.id).toBe(dataSpecification.id);
        return dataSpecification;
      });

      const actual$ = service.create(user, name, description);
      expect(actual$).toBeObservable(expected$);
    });

    it('should create a new specification and copy elements to it', () => {
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
        expect(targetId).toBe(dataSpecification.id);
        expect(payload.additions).toStrictEqual(elements.map((e) => e.id));
        return cold('-a|', { a: dataSpecification });
      });

      coreTableProfileStub.getQueryBuilderCoreTableProfile.mockImplementation((_) => {
        return cold('-a|', { a: undefined });
      });

      coreTableProfileStub.saveQueryBuilderCoreTableProfile.mockImplementation((_) => {
        return cold('-a|', { a: undefined });
      });

      submissionSDEServiceStub.mapToDataSpecification.mockImplementation((dataModel) => {
        expect(dataModel.id).toBe(dataSpecification.id);
        return dataSpecification;
      });

      const expected$ = cold('--------(a|)', {
        a: dataSpecification,
      });
      const actual$ = service.createFromDataElements(elements, user, name, description);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('getDataSpecificationIntersections', () => {
    it('should get some results', () => {
      // Arrange
      const sourceDataModelId = 'sourceId';
      const dataElementIds = ['element1Id', 'element2Id', 'element3Id'];

      const expectedDataSpecification: DataSpecification = {
        id: 'targetId',
        label: 'Data Specification 1',
        status: 'draft',
        domainType: CatalogueItemDomainType.DataModel,
      };

      // Expected results
      const expectedSourceTargetIntersection: SourceTargetIntersection = {
        sourceDataModelId: 'sourceId',
        targetDataModelId: 'targetId',
        intersects: ['element1Id', 'element3Id'],
      };

      const expectedDataSpecificationSourceTargetIntersection: DataSpecificationSourceTargetIntersections =
        {
          dataSpecifications: [expectedDataSpecification],
          sourceTargetIntersections: [expectedSourceTargetIntersection],
        };

      const expected$ = cold('-----a|', {
        a: expectedDataSpecificationSourceTargetIntersection,
      });

      // Mock a folder for the user's data specifications
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
        dataSpecificationFolder: expectedFolder,
      };

      securityStub.getSignedInUser.mockClear();
      securityStub.getSignedInUser.mockImplementation(() => expectedUser);

      // Mock one target model
      const target: DataModel = {
        id: 'targetId',
        label: 'Data Specification 1',
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
        return cold('---a|', {
          a: many,
        });
      });

      submissionSDEServiceStub.mapToDataSpecificationWithSDEStatusCheck.mockImplementationOnce(
        (dataModel) => {
          expect(dataModel.id).toBe(expectedDataSpecification.id);
          return cold('a|', { a: expectedDataSpecification });
        }
      );

      // Actual
      const actual$ = service.getDataSpecificationIntersections(sourceDataModelId, dataElementIds);

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

    const name = 'test data specification';
    const description = 'test description';
    const dataSpecificationCreation: CreateDataSpecificationDialogResponse = {
      name,
      description,
    };

    dialogStub.usage.afterClosed.mockImplementation(() => of(dataSpecificationCreation));

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
          caption: 'Creating new data specification ...',
        });
      });
    });

    it('should display a toastr error and return a complete notification if createFromDataElements fails', () => {
      // arrange
      const toastrSpy = jest.spyOn(toastrStub, 'error');
      const expected$ = cold('|');

      // simulate a failure of createFromDataSpecifications. We are mocking this here because it's already
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

    it('should broadcast data-specification-added if createFromDataElements succeeds', () => {
      // arrange
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      dialogStub.usage.afterClosed.mockImplementationOnce(() => of('continue'));
      service.createFromDataElements = jest
        .fn()
        .mockReturnValueOnce(cold('a', { a: { id: '456' } as DataSpecification }));

      // act
      const actual$ = service.createWithDialogs(getDataElements);

      // assert
      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({ isLoading: false });
      });
    });
  });

  describe('updateWithDialog', () => {
    const newDescription = 'new description';
    const newLabel = 'new label';
    const modelId = '1';

    const expectedModel: DataModelDetail = {
      id: modelId,
      label: newLabel,
      description: newDescription,
      domainType: CatalogueItemDomainType.DataModel,
      availableActions: ['show'],
      finalised: false,
    };

    const expectedPayload: ModelUpdatePayload = {
      description: newDescription,
      label: newLabel,
      id: modelId,
      domainType: CatalogueItemDomainType.DataModel,
    };

    const user: UserDetails = {
      id: 'test',
      firstName: 'test',
      lastName: 'user',
      email: 'test@test.com',
    };
    securityStub.getSignedInUser.mockImplementation(() => user);

    const dataSpecificationEdit: EditDataSpecificationDialogResponse = {
      name: newLabel,
      description: newDescription,
    };

    dialogStub.usage.afterClosed.mockImplementation(() => of(dataSpecificationEdit));

    beforeEach(() => {
      securityStub.getSignedInUser.mockClear();
      dataModelsStub.update.mockClear();
      broadcastStub.loading.mockClear();
    });

    it('should return a complete notification if no user signed in', () => {
      // arrange
      securityStub.getSignedInUser.mockImplementationOnce(() => null);
      const expected$ = cold('|');

      // act
      if (!expectedPayload.label) {
        fail('expected payload is null or empty, that should not happen.');
      }
      const actual$ = service.updateWithDialog(
        expectedPayload.id,
        expectedPayload.label,
        expectedPayload.description
      );

      // assert
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a complete notification if response is undefined', () => {
      // arrange
      dialogStub.usage.afterClosed.mockImplementationOnce(() => of(undefined));
      const expected$ = cold('|');

      // act
      if (!expectedPayload.label) {
        fail('expected payload is null or empty, that should not happen.');
      }
      const actual$ = service.updateWithDialog(
        expectedPayload.id,
        expectedPayload.label,
        expectedPayload.description
      );

      // assert
      expect(actual$).toBeObservable(expected$);
    });

    it('should fire a loading broadcast if dialog response retrieved', () => {
      // arrange
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      // act
      if (!expectedPayload.label) {
        fail('expected payload is null or empty, that should not happen.');
      }
      const actual$ = service.updateWithDialog(
        expectedPayload.id,
        expectedPayload.label,
        expectedPayload.description
      );

      // assert
      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({
          isLoading: true,
          caption: 'Updating data specification ...',
        });
      });
    });

    it('should display a toastr error and return a complete notification if update fails', () => {
      // arrange
      const toastrSpy = jest.spyOn(toastrStub, 'error');
      const expected$ = cold('|');

      // simulate a failure of dataModelService update.
      dataModelsStub.update = jest.fn().mockReturnValueOnce(cold('#'));

      // act
      if (!expectedPayload.label) {
        fail('expected payload is null or empty, that should not happen.');
      }
      const actual$ = service.updateWithDialog(
        expectedPayload.id,
        expectedPayload.label,
        expectedPayload.description
      );

      // assert
      expect(actual$).toBeObservable(expected$);

      expect(actual$).toSatisfyOnFlush(() => {
        expect(toastrSpy).toHaveBeenCalled();
      });
    });

    it('should attempt to edit only the label and description with data from the dialog', () => {
      // arrange
      const updateDataModelSpy = jest.spyOn(dataModelsStub, 'update');
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      // act
      if (!expectedPayload.label) {
        fail('expected payload is null or empty, that should not happen.');
      }
      const actual$ = service.updateWithDialog(
        expectedPayload.id,
        expectedPayload.label,
        expectedPayload.description
      );

      // assert
      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({ isLoading: false });
        expect(updateDataModelSpy).toHaveBeenCalledWith(modelId, { ...expectedPayload });
      });
    });

    it('should return the updated model after successful update', () => {
      // arrange
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');
      dataModelsStub.update.mockImplementationOnce(() => {
        return cold('a|', {
          a: expectedModel,
        });
      });

      const expected$ = cold('a|', {
        a: expectedModel,
      });

      // act
      if (!expectedPayload.label) {
        fail('expected payload is null or empty, that should not happen.');
      }
      const actual$ = service.updateWithDialog(
        expectedPayload.id,
        expectedPayload.label,
        expectedPayload.description
      );

      // assert

      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toBeCalledTimes(2);
        expect(actual$).toBeObservable(expected$);
      });
    });
  });

  describe('forkWithDialogs', () => {
    const originalDataSpecification: DataSpecification = {
      id: '123',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'original data specification',
      modelVersion: '1',
      status: 'finalised',
    };

    const forkedDataSpecification: DataSpecification = {
      id: '456',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'forked data specification',
      status: 'draft',
    };

    it('should return nothing if no data specification is provided', () => {
      const expected$ = cold('|');
      const actual$ = service.forkWithDialogs(undefined as unknown as DataSpecification);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return nothing if data specification has no id', () => {
      const expected$ = cold('|');
      const actual$ = service.forkWithDialogs({} as DataSpecification);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return nothing if data specification has no model version', () => {
      const expected$ = cold('|');
      const actual$ = service.forkWithDialogs({ id: '123' } as DataSpecification);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return nothing if data specification is not submitted', () => {
      const expected$ = cold('|');
      const actual$ = service.forkWithDialogs({
        id: '123',
        modelVersion: '1',
        status: 'draft',
      } as unknown as DataSpecification);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return nothing if create dialog is cancelled', () => {
      dialogStub.usage.afterClosed.mockImplementationOnce(() => of(undefined));

      const expected$ = cold('|');
      const actual$ = service.forkWithDialogs(originalDataSpecification);
      expect(actual$).toBeObservable(expected$);
    });

    it('should fire a loading broadcast if dialog response retrieved', () => {
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      const actual$ = service.forkWithDialogs(originalDataSpecification);

      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({
          isLoading: true,
          caption: 'Copying to new data specification ...',
        });
      });
    });

    it('should display an error if forking failed', () => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataModelsStub.createFork.mockImplementationOnce(() =>
        cold('#', null, new Error('fork fails'))
      );

      const expected$ = cold('|');
      const actual$ = service.forkWithDialogs(originalDataSpecification);

      expect(actual$).toBeObservable(expected$);

      expect(actual$).toSatisfyOnFlush(() => {
        expect(toastrSpy).toHaveBeenCalled();
      });
    });

    it('should return successful forked data specification', () => {
      const loadingSpy = jest.spyOn(broadcastStub, 'loading');

      dialogStub.usage.afterClosed.mockImplementationOnce(() => of('continue'));

      dataModelsStub.createFork.mockImplementationOnce(() =>
        cold('--a|', { a: forkedDataSpecification })
      );

      submissionSDEServiceStub.mapToDataSpecification.mockImplementationOnce((dataModel) => {
        expect(dataModel.id).toBe(forkedDataSpecification.id);
        return forkedDataSpecification;
      });

      const expected$ = cold('--a|', { a: forkedDataSpecification });
      const actual$ = service.forkWithDialogs(originalDataSpecification);
      expect(actual$).toBeObservable(expected$);

      expect(actual$).toSatisfyOnFlush(() => {
        expect(loadingSpy).toHaveBeenCalledWith({ isLoading: false });
      });
    });

    it('should move forked data specification to another folder', () => {
      const targetFolder: Folder = {
        id: '789',
        domainType: CatalogueItemDomainType.Folder,
        label: 'folder',
      };

      const options: ForkDataSpecificationOptions = {
        targetFolder,
      };

      dialogStub.usage.afterClosed.mockImplementationOnce(() => of('continue'));

      dataModelsStub.createFork.mockImplementationOnce(() =>
        cold('--a|', { a: forkedDataSpecification })
      );

      dataModelsStub.moveToFolder.mockImplementationOnce((mId, fId) => {
        expect(mId).toBe(forkedDataSpecification.id);
        expect(fId).toBe(targetFolder.id);
        return cold('--a|', { a: forkedDataSpecification });
      });

      submissionSDEServiceStub.mapToDataSpecification.mockImplementationOnce((dataModel) => {
        expect(dataModel.id).toBe(forkedDataSpecification.id);
        return forkedDataSpecification;
      });

      const expected$ = cold('----a|', { a: forkedDataSpecification });
      const actual$ = service.forkWithDialogs(originalDataSpecification, options);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('getQuery', () => {
    const dataSpecificationId: Uuid = '1234';
    const queryTypes: DataSpecificationQueryType[] = ['cohort', 'data'];

    it('should return nothing when no rules exist', () => {
      rulesStub.list.mockImplementationOnce((dt, id) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        return cold('--a|', { a: [] });
      });

      const expected$ = cold('--a|', { a: undefined });
      const actual$ = service.getQuery(dataSpecificationId, 'cohort');
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)('should return nothing when no matching %p rule found', (type) => {
      rulesStub.list.mockImplementationOnce((dt, id) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        return cold('--a|', {
          a: [
            {
              name: 'test',
            },
          ],
        });
      });

      const expected$ = cold('--a|', { a: undefined });
      const actual$ = service.getQuery(dataSpecificationId, type);
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)(
      'should return nothing when no representation found for %p rule',
      (type) => {
        rulesStub.list.mockImplementationOnce((dt, id) => {
          expect(dt).toBe('dataModels');
          expect(id).toBe(dataSpecificationId);
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
        const actual$ = service.getQuery(dataSpecificationId, type);
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
            language: dataSpecificationQueryLanguage,
            representation: JSON.stringify(condition),
          },
        ],
      };

      rulesStub.list.mockImplementationOnce((dt, id) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
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
      const actual$ = service.getQuery(dataSpecificationId, type);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('createOrUpdateQuery', () => {
    const dataSpecificationId: Uuid = '1234';
    const queryTypes: DataSpecificationQueryType[] = ['cohort', 'data'];
    const condition: QueryCondition = {
      entity: 'coretable',
      condition: 'and',
      rules: [],
    };

    const representation: RuleRepresentation = {
      id: '789',
      language: dataSpecificationQueryLanguage,
      representation: JSON.stringify(condition, null, 2),
    };
    const rule: Rule = {
      id: '456',
      name: 'temp',
      ruleRepresentations: [representation],
    };

    it.each(queryTypes)('should create a %p rule when it is missing', (type) => {
      const payload: DataSpecificationQueryPayload = {
        type,
        condition,
      };

      const expected: DataSpecificationQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };

      rulesStub.create.mockImplementationOnce((dt, id, rpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        expect(rpl.name).toBe(type);
        return cold('-a|', { a: rule });
      });

      rulesStub.createRepresentation.mockImplementationOnce((dt, id, rid, rrpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        expect(rid).toBe(rule.id);
        expect(rrpl.language).toBe(dataSpecificationQueryLanguage);
        expect(rrpl.representation).toBe(representation.representation);
        return cold('-a|', { a: representation });
      });

      const expected$ = cold('---(a|)', { a: expected });
      const actual$ = service.createOrUpdateQuery(dataSpecificationId, payload);
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)('should use an existing %p rule and create a representation', (type) => {
      const payload: DataSpecificationQueryPayload = {
        ruleId: rule.id,
        type,
        condition,
      };

      const expected: DataSpecificationQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };

      rulesStub.get.mockImplementationOnce((dt, id, rid) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        expect(rid).toBe(rid);
        return cold('-a|', { a: rule });
      });

      rulesStub.createRepresentation.mockImplementationOnce((dt, id, rid, rrpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        expect(rid).toBe(rule.id);
        expect(rrpl.language).toBe(dataSpecificationQueryLanguage);
        expect(rrpl.representation).toBe(representation.representation);
        return cold('-a|', { a: representation });
      });

      const expected$ = cold('---(a|)', { a: expected });
      const actual$ = service.createOrUpdateQuery(dataSpecificationId, payload);
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)('should update a representation for a %p rule', (type) => {
      const payload: DataSpecificationQueryPayload = {
        ruleId: rule.id,
        representationId: representation.id,
        type,
        condition,
      };

      const expected: DataSpecificationQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };

      rulesStub.get.mockImplementationOnce((dt, id, rid) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        expect(rid).toBe(rid);
        return cold('-a|', { a: rule });
      });

      rulesStub.updateRepresentation.mockImplementationOnce((dt, id, rid, rrid, rrpl) => {
        expect(dt).toBe('dataModels');
        expect(id).toBe(dataSpecificationId);
        expect(rid).toBe(rule.id);
        expect(rrid).toBe(representation.id);
        expect(rrpl.language).toBe(dataSpecificationQueryLanguage);
        expect(rrpl.representation).toBe(representation.representation);
        return cold('-a|', { a: representation });
      });

      const expected$ = cold('---(a|)', { a: expected });
      const actual$ = service.createOrUpdateQuery(dataSpecificationId, payload);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('deleteDataElementsFromQuery', () => {
    const dataSpecificationId: Uuid = '1234';
    const queryTypes: DataSpecificationQueryType[] = ['cohort', 'data'];
    const expressions: QueryExpression[] = [
      { field: 'field1', operator: '!=', value: 'value_field1' },
      { field: 'field2', operator: '=', value: 'value_field2' },
      { field: 'field3', operator: '<=', value: 'value_field3' },
    ];
    const condition: QueryCondition = {
      entity: 'coretable',
      condition: 'and',
      rules: expressions,
    };

    it.each(queryTypes)('Should remove 1 data element correctly', (type) => {
      const queryPayload: DataSpecificationQueryPayload = {
        ruleId: '456',
        representationId: '789',
        type,
        condition,
      };

      const expectedExpressions: QueryExpression[] = [
        { field: 'field2', operator: '=', value: 'value_field2' },
        { field: 'field3', operator: '<=', value: 'value_field3' },
      ];
      const expectedCondition: QueryCondition = {
        entity: 'coretable',
        condition: 'and',
        rules: expectedExpressions,
      };

      // Get query and createOrUpdateQuery has its own tests, so we can mock its dependency
      // to unit test deleteDataElementsFromQuery
      service.getQuery = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: queryPayload,
        })
      );
      service.createOrUpdateQuery = jest
        .fn()
        .mockImplementation((id: string, payload: DataSpecificationQueryPayload) => {
          return cold('a|', {
            a: {
              ruleId: payload.ruleId,
              representationId: payload.representationId,
              type: payload.type,
              condition: payload.condition,
            },
          });
        });

      const expected$ = cold('a|', {
        a: {
          ruleId: queryPayload.ruleId,
          representationId: queryPayload.representationId,
          type,
          condition: expectedCondition,
        },
      });

      const actual$ = service.deleteDataElementsFromQuery(dataSpecificationId, type, ['field1']);
      expect(actual$).toBeObservable(expected$);
    });

    it.each(queryTypes)('Should remove multiple data element correctly', (type) => {
      const queryPayload: DataSpecificationQueryPayload = {
        ruleId: '456',
        representationId: '789',
        type,
        condition,
      };

      const expectedExpressions: QueryExpression[] = [
        { field: 'field2', operator: '=', value: 'value_field2' },
      ];
      const expectedCondition: QueryCondition = {
        entity: 'coretable',
        condition: 'and',
        rules: expectedExpressions,
      };

      // Get query and createOrUpdateQuery has its own tests, so we can mock its dependency
      // to unit test deleteDataElementsFromQuery
      service.getQuery = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: queryPayload,
        })
      );
      service.createOrUpdateQuery = jest
        .fn()
        .mockImplementation((id: string, payload: DataSpecificationQueryPayload) => {
          return cold('a|', {
            a: {
              ruleId: payload.ruleId,
              representationId: payload.representationId,
              type: payload.type,
              condition: payload.condition,
            },
          });
        });

      const expected$ = cold('a|', {
        a: {
          ruleId: queryPayload.ruleId,
          representationId: queryPayload.representationId,
          type,
          condition: expectedCondition,
        },
      });

      const actual$ = service.deleteDataElementsFromQuery(dataSpecificationId, type, [
        'field1',
        'field3',
      ]);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('isDataSpecificationNameAvailable', () => {
    const dataSpecifications: DataSpecification[] = [
      {
        label: 'label1',
        id: 'id1',
        status: 'draft',
        domainType: CatalogueItemDomainType.DataModel,
      },
      {
        label: 'label2',
        id: 'id2',
        status: 'draft',
        domainType: CatalogueItemDomainType.DataModel,
      },
      {
        label: 'label3',
        id: 'id3',
        status: 'finalised',
        domainType: CatalogueItemDomainType.DataModel,
      },
      {
        label: 'label4',
        id: 'id4',
        status: 'draft',
        domainType: CatalogueItemDomainType.DataModel,
      },
    ];

    const emptyDataSpecifications: DataSpecification[] = [];

    it('Should return false if none of the dataSpecifications is using the given name', () => {
      // Arrange
      const name = 'nameToLookFor';
      // mocking dependancy on the list method of the service.
      // List service is tested so it can be mocked safely here.
      service.list = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: dataSpecifications,
        })
      );

      // Act
      const actual$ = service.isDataSpecificationNameAvailable(name);

      // Assert
      actual$.subscribe((response) => {
        expect(response).toBeTruthy();
      });
    });

    it('Should return true if any of the dataSpecifications is using the given name', () => {
      // Arrange
      const name = 'label3';
      // mocking dependancy on the list method of the service.
      // List service is tested so it can be mocked safely here.
      service.list = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: dataSpecifications,
        })
      );

      // Act
      const actual$ = service.isDataSpecificationNameAvailable(name);

      // Assert
      actual$.subscribe((response) => {
        expect(response).toBeFalsy();
      });
    });

    it('Should return false if list returns empty', () => {
      // Arrange
      const name = 'label3';
      // mocking dependancy on the list method of the service.
      // List service is tested so it can be mocked safely here.
      service.list = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: EMPTY,
        })
      );

      // Act
      const actual$ = service.isDataSpecificationNameAvailable(name);

      // Assert
      actual$.subscribe((response) => {
        expect(response).toBeFalsy();
      });
    });

    it('Should return true if dataSpecifications is empty', () => {
      // Arrange
      const name = 'label3';
      // mocking dependancy on the list method of the service.
      // List service is tested so it can be mocked safely here.
      service.list = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: emptyDataSpecifications,
        })
      );

      // Act
      const actual$ = service.isDataSpecificationNameAvailable(name);

      // Assert
      actual$.subscribe((response) => {
        expect(response).toBeTruthy();
      });
    });

    it('Should return false if name is empty', () => {
      // Arrange
      const name = '';
      // mocking dependancy on the list method of the service.
      // List service is tested so it can be mocked safely here.
      service.list = jest.fn().mockReturnValueOnce(
        cold('a|', {
          a: emptyDataSpecifications,
        })
      );

      // Act
      const actual$ = service.isDataSpecificationNameAvailable(name);

      // Assert
      actual$.subscribe((response) => {
        expect(response).toBeFalsy();
      });
    });
  });
});
