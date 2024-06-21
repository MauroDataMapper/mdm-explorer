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
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataModelDetail,
  Rule,
  RuleRepresentation,
  SimpleModelVersionTree,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BroadcastService } from '../../core/broadcast.service';
import { DataExplorerService } from '../../data-explorer/data-explorer.service';
import {
  DataClassWithElements,
  DataElementOperationResult,
  DataElementSearchResult,
  DataItemDeleteEvent,
  DataSpecification,
  DataSpecificationQuery,
  dataSpecificationQueryLanguage,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  DataSchema,
  QueryCondition,
} from '../../data-explorer/data-explorer.types';
import {
  DataSpecificationSourceTargetIntersections,
  DataSpecificationService,
} from '../../data-explorer/data-specification.service';
import { DataSchemaService } from '../../data-explorer/data-schema.service';
import { OkCancelDialogResponse } from '../../data-explorer/ok-cancel-dialog/ok-cancel-dialog.component';
import { DataModelService } from '../../mauro/data-model.service';
import { UserDetails } from '../../security/user-details.service';
import { DataSpecificationElementAddDeleteEvent } from '../../shared/data-element-in-data-specification/data-element-in-data-specification.component';
import { createBroadcastServiceStub } from '../../testing/stubs/broadcast.stub';
import { createDataExplorerServiceStub } from '../../testing/stubs/data-explorer.stub';
import { createDataModelServiceStub } from '../../testing/stubs/data-model.stub';
import { createDataSpecificationServiceStub } from '../../testing/stubs/data-specifications.stub';
import { createDataSchemaServiceStub } from '../../testing/stubs/data-schema.stub';
import { createMatDialogStub } from '../../testing/stubs/mat-dialog.stub';
import { createSecurityServiceStub } from '../../testing/stubs/security.stub';
import { createToastrServiceStub } from '../../testing/stubs/toastr.stub';
import { ComponentHarness, setupTestModuleForComponent } from '../../testing/testing.helpers';
import { MyDataSpecificationDetailComponent } from './my-data-specification-detail.component';
import { SecurityService } from 'src/app/security/security.service';
import { createFolderServiceStub } from 'src/app/testing/stubs/folder.stub';
import { FolderService } from 'src/app/mauro/folder.service';
import { createSpecificationSubmissionServiceStub } from 'src/app/testing/stubs/data-specification-submission/specification-submission-service.stub';
import { SpecificationSubmissionService } from 'src/app/data-explorer/specification-submission/services/specification-submission.service';
import { DataSpecificationResearchPluginService } from 'src/app/mauro/data-specification-research-plugin.service';
import { createDataSpecificationResearchPluginServiceStub } from 'src/app/testing/stubs/data-specification-research-plugin.stub';
import { SubmissionSDEService } from 'src/app/data-explorer/specification-submission/services/submission.sde.service';
import { RequestDialogService, RequestEndpointsResearcher } from '@maurodatamapper/sde-resources';
import { createSubmissionSDEServiceStub } from 'src/app/testing/stubs/data-specification-submission/submission-sde-service.stub';
import { createRequestEndpointsResearcherStub } from 'src/app/testing/stubs/sde/request-endpoints-researcher.stub';
import { createRequestDialogServiceStub } from 'src/app/testing/stubs/sde/request-dialog-service.stub';

describe('MyDataSpecificationDetailComponent', () => {
  let harness: ComponentHarness<MyDataSpecificationDetailComponent>;
  const dataSpecificationStub = createDataSpecificationServiceStub();
  const dataSchemaStub = createDataSchemaServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const toastrStub = createToastrServiceStub();
  const dataSpecificationResearchPluginStub = createDataSpecificationResearchPluginServiceStub();
  const dialogsStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const explorerStub = createDataExplorerServiceStub();
  const securityStub = createSecurityServiceStub();
  const folderServiceStub = createFolderServiceStub();
  const specificationSubmissionServiceStub = createSpecificationSubmissionServiceStub();
  const submissionSDEServiceStub = createSubmissionSDEServiceStub();
  const researcherRequestEndpointsStub = createRequestEndpointsResearcherStub();
  const requestDialogServiceStub = createRequestDialogServiceStub();
  const dataSpecificationId = '1';
  const activatedRoute: ActivatedRoute = {
    params: of({
      dataSpecificationId,
    }),
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyDataSpecificationDetailComponent, {
      providers: [
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
        },
        {
          provide: DataSchemaService,
          useValue: dataSchemaStub,
        },
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: DataSpecificationResearchPluginService,
          useValue: dataSpecificationResearchPluginStub,
        },
        {
          provide: MatDialog,
          useValue: dialogsStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
        {
          provide: DataExplorerService,
          useValue: explorerStub,
        },
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: FolderService,
          useValue: folderServiceStub,
        },
        {
          provide: SpecificationSubmissionService,
          useValue: specificationSubmissionServiceStub,
        },
        {
          provide: SubmissionSDEService,
          useValue: submissionSDEServiceStub,
        },
        {
          provide: RequestEndpointsResearcher,
          useValue: researcherRequestEndpointsStub,
        },
        {
          provide: RequestDialogService,
          useValue: requestDialogServiceStub,
        },
      ],
    });
  });

  const dataSpecification: DataSpecification = {
    id: '1',
    label: 'data specification 1',
    domainType: CatalogueItemDomainType.DataModel,
    status: 'draft',
    author: 'Test User',
  };

  const user = {
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
  } as UserDetails;

  const mockSignedInUser = () => {
    securityStub.getSignedInUser.mockReturnValueOnce(user);
  };

  dataModelsStub.simpleModelVersionTree.mockImplementation((id) => {
    const simpleModelTree: SimpleModelVersionTree = {
      branch: 'main',
      displayName: 'main',
      documentationVersion: '1.0.0',
      id,
      modelVersion: '1.0.0',
    };
    return of([simpleModelTree]);
  });

  folderServiceStub.treeList.mockImplementation(() => {
    return of([]);
  });

  describe('initialisation', () => {
    beforeEach(() => {
      toastrStub.error.mockClear();
      dataSpecificationStub.get.mockClear();
      dataSpecificationStub.get.mockReset();
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.dataSpecification).toBeUndefined();
      expect(harness.component.dataSchemas).toStrictEqual([]);
      expect(harness.component.state).toBe('idle');
    });

    it('should have a data specification', () => {
      // Arrange
      dataSpecificationStub.get.mockImplementationOnce(() => {
        return of(dataSpecification);
      });

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(harness.component.dataSpecification).toStrictEqual(dataSpecification);
      expect(dataSpecificationStub.get).toHaveBeenCalledWith(dataSpecificationId);
    });

    it('should display an error if failed to get data specifications', () => {
      // Arrange
      dataSpecificationStub.get.mockImplementationOnce(() => throwError(() => new Error()));

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.dataSpecification).toBeUndefined();
    });

    it('should handle having no data specifications available', () => {
      // Arrange
      dataSpecificationStub.get.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({}))
      );

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.dataSpecification).toBeUndefined();
    });
  });

  describe('submit data specification', () => {
    beforeEach(() => {
      dataSpecificationResearchPluginStub.finaliseDataSpecification.mockClear();
      toastrStub.error.mockClear();
      broadcastStub.dispatch.mockClear();
      broadcastStub.loading.mockClear();
    });

    it('should do nothing if there is no data specification', () => {
      harness.component.finaliseDataSpecification();
      expect(dataSpecificationResearchPluginStub.finaliseDataSpecification).not.toHaveBeenCalled();
    });

    it('should do nothing if current data specification is not in draft state', () => {
      harness.component.dataSpecification = {
        ...dataSpecification,
        status: 'finalised',
      };

      harness.component.finaliseDataSpecification();
      expect(dataSpecificationResearchPluginStub.finaliseDataSpecification).not.toHaveBeenCalled();
    });

    it('should raise error if failed to submit', () => {
      // Arrange
      dataSpecificationResearchPluginStub.finaliseDataSpecification.mockImplementationOnce((id) => {
        expect(id).toBe(dataSpecification.id);
        return throwError(() => new Error());
      });

      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      harness.component.dataSpecification = dataSpecification;

      // Act
      harness.component.finaliseDataSpecification();

      // Assert
      expect(dataSpecificationResearchPluginStub.finaliseDataSpecification).toHaveBeenCalled();
      expect(broadcastStub.loading).toHaveBeenCalledTimes(2);
      expect(toastrStub.error).toHaveBeenCalled();
    });

    it('should update status of current data specification once submitted', () => {
      const submittedDataSpecification: DataSpecification = {
        id: '1',
        label: 'data specification 1',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'finalised',
        author: 'Test User',
      };

      dataSpecificationResearchPluginStub.finaliseDataSpecification.mockImplementationOnce((id) => {
        expect(id).toBe(submittedDataSpecification.id);
        return of(submittedDataSpecification);
      });

      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      submissionSDEServiceStub.mapToDataSpecificationWithSDEStatusCheck.mockReturnValueOnce(
        of(submittedDataSpecification)
      );

      harness.component.dataSpecification = dataSpecification;

      // Act
      harness.component.finaliseDataSpecification();

      // Assert
      expect(dataSpecificationResearchPluginStub.finaliseDataSpecification).toHaveBeenCalled();
      expect(harness.component.dataSpecification.status).toBe('finalised');
      expect(broadcastStub.dispatch).toHaveBeenCalledWith('data-specification-finalised');
      expect(broadcastStub.loading).toHaveBeenCalledTimes(2);
      expect(broadcastStub.loading.mock.calls).toEqual([
        [
          {
            isLoading: true,
            caption: 'Finalising your data specification...',
          },
        ],
        [{ isLoading: false }],
      ]);
    });

    it('should not submit data specification if dialog is not accepted', () => {
      // Arrange
      const okCancelResponse: OkCancelDialogResponse = {
        result: false,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      harness.component.dataSpecification = dataSpecification;

      // Act
      harness.component.finaliseDataSpecification();

      // Assert
      expect(dataSpecificationResearchPluginStub.finaliseDataSpecification).toHaveBeenCalledTimes(
        0
      );
      expect(harness.component.dataSpecification.status).toBe('draft');
      expect(broadcastStub.dispatch).toHaveBeenCalledTimes(0);
      expect(broadcastStub.loading).toHaveBeenCalledWith({ isLoading: false });
    });
  });

  describe('remove elements from data specifications and handling changes', () => {
    const dataSchema: DataSchema = {
      schema: {
        id: 'schema1',
        domainType: CatalogueItemDomainType.DataClass,
        label: 'labelSchema',
      },
      dataClasses: [
        {
          dataClass: {
            domainType: CatalogueItemDomainType.DataClass,
            label: 'dataClassLabel',
          },
          dataElements: [
            {
              dataClass: 'class1',
              id: 'idElement',
              isBookmarked: false,
              isSelected: false,
              label: 'dataElementLabel',
              model: 'model',
            },
          ],
        },
      ],
    };

    const dataElements: DataElementSearchResult[] = [
      {
        dataClass: 'dataClassId0',
        id: 'dataElmentId0',
        isBookmarked: true,
        label: 'label0',
        isSelected: true,
        model: 'modelId0',
      },
      {
        dataClass: 'dataClassId1',
        id: 'dataElmentId1',
        isBookmarked: true,
        label: 'label1',
        isSelected: true,
        model: 'modelId1',
      },
      {
        dataClass: 'dataClassId2',
        id: 'dataElmentId2',
        isBookmarked: true,
        label: 'label2',
        isSelected: true,
        model: 'modelId2',
      },
    ];

    const dataClass: DataClassWithElements = {
      dataClass: {
        domainType: CatalogueItemDomainType.DataClass,
        label: 'dataClass1',
      },
      dataElements,
    };

    const eventDeleteDataSchema: DataItemDeleteEvent = {
      dataSchema,
    };

    const eventDeleteDataClass: DataItemDeleteEvent = {
      dataSchema,
      dataClassWithElements: dataClass,
    };

    const eventDeleteDataElementDataClassWith1Element: DataItemDeleteEvent = {
      dataSchema,
      dataClassWithElements: {
        dataClass: {
          domainType: CatalogueItemDomainType.DataClass,
          label: 'dataClass1',
        },
        dataElements: [dataElements[0]],
      },
      dataElement: dataElements[0],
    };

    const eventDeleteDataElement: DataItemDeleteEvent = {
      dataSchema,
      dataClassWithElements: dataClass,
      dataElement: dataElements[0],
    };

    const eventDeleteUndefinedDataSchema: DataItemDeleteEvent = {
      dataSchema: undefined,
    };

    const deleteElementResult: DataElementOperationResult = {
      item: {
        dataClass: 'dataClassId2',
        id: 'dataElmentId2',
        isBookmarked: true,
        label: 'label2',
        isSelected: true,
        model: 'modelId2',
      },
      message: '',
      success: true,
    };
    const labels = dataElements.map((de) => de.label);

    const okCancelResponse: OkCancelDialogResponse = {
      result: true,
    };

    beforeEach(() => {
      mockSignedInUser();
      toastrStub.error.mockClear();
      broadcastStub.dispatch.mockClear();
      broadcastStub.loading.mockClear();
      dataSpecificationStub.deleteDataClass.mockClear();
      dataSpecificationStub.deleteDataSchema.mockClear();
      dataSchemaStub.loadDataSchemas.mockClear();
    });

    it('Wrong schema information should rise toastr error without opening dialog with user', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;
      const dialogSpy = jest.spyOn(dialogsStub, 'open');

      // Act
      harness.component.removeItem(eventDeleteUndefinedDataSchema);

      // Assert
      expect(toastrStub.error).toBeCalledWith('Data schema undefined', 'Unable to delete items');
      expect(dialogSpy).toHaveBeenCalledTimes(0);
    });

    it('Should not attempt to delete anything if user cancels confirmation', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;
      const noToOkCancelResponse: OkCancelDialogResponse = {
        result: false,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(noToOkCancelResponse));

      const dataSpecificationServiceSpy = jest.spyOn(dataSpecificationStub, 'deleteDataSchema');

      // Act
      harness.component.removeItem(eventDeleteDataSchema);

      // Assert
      expect(dataSpecificationServiceSpy).toHaveBeenCalledTimes(0);
    });

    it('Should delete dataSchema correctly, also it should delete dataelements from queries', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataSpecificationServiceSpy = jest.spyOn(dataSpecificationStub, 'deleteDataSchema');

      dataSpecificationStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataSpecificationServiceDeleteFromQuerySpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataSchema);

      // Assert
      expect(dataSpecificationServiceSpy).toHaveBeenCalledWith(
        eventDeleteDataSchema.dataSchema?.schema
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        dataSpecification.id,
        'data',
        labels
      );
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        dataSpecification.id,
        'cohort',
        labels
      );
    });

    it('Should delete dataClass correctly, schema only has 1 class, then delete dataschema', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataSpecificationServiceSpy = jest.spyOn(dataSpecificationStub, 'deleteDataSchema');
      const dataSpecificationDeleteDataClassSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataClass'
      );

      dataSpecificationStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataSpecificationServiceDeleteFromQuerySpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataClass);

      // Assert
      expect(dataSpecificationServiceSpy).toHaveBeenCalledWith(
        eventDeleteDataSchema.dataSchema?.schema
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        dataSpecification.id,
        'data',
        labels
      );
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        dataSpecification.id,
        'cohort',
        labels
      );
      expect(dataSpecificationDeleteDataClassSpy).toHaveBeenCalledTimes(0);
    });

    it('Should delete dataClass correctly, schema has multiple classes, so deleteDataClass is used', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataSpecificationServiceSpy = jest.spyOn(dataSpecificationStub, 'deleteDataSchema');
      const dataSpecificationDeleteDataClassSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataClass'
      );

      dataSpecificationStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataSpecificationServiceDeleteFromQuerySpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      eventDeleteDataClass.dataSchema?.dataClasses.push(dataClass);
      harness.component.removeItem(eventDeleteDataClass);

      // Assert
      expect(dataSpecificationServiceSpy).toHaveBeenCalledTimes(0);
      expect(dataSpecificationDeleteDataClassSpy).toHaveBeenCalledTimes(1);
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        dataSpecification.id,
        'data',
        labels
      );
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        dataSpecification.id,
        'cohort',
        labels
      );
    });

    it('Should delete dataElements correctly, if last child of dataClass, should delete dataClass', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataSpecificationDeleteDataSchemaSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataSchema'
      );
      const dataSpecificationDeleteElementMultipleSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementMultiple'
      );
      const dataSpecificationDeleteDataClassSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataClass'
      );

      dataSpecificationStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataSpecificationServiceDeleteFromQuerySpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataElementDataClassWith1Element);

      // Assert
      expect(dataSpecificationDeleteDataSchemaSpy).toHaveBeenCalledTimes(0);
      expect(dataSpecificationDeleteElementMultipleSpy).toHaveBeenCalledTimes(0);
      expect(dataSpecificationDeleteDataClassSpy).toHaveBeenCalledTimes(1);
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        dataSpecification.id,
        'data',
        labels
      );
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        dataSpecification.id,
        'cohort',
        labels
      );
    });

    it('Should delete dataElements correctly', () => {
      // Arrange
      harness.component.dataSpecification = dataSpecification;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataSpecificationDeleteDataSchemaSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataSchema'
      );
      const dataSpecificationDeleteElementMultipleSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementMultiple'
      );
      const dataSpecificationDeleteDataClassSpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataClass'
      );

      dataSpecificationStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataSpecificationServiceDeleteFromQuerySpy = jest.spyOn(
        dataSpecificationStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataElement);

      // Assert
      expect(dataSpecificationDeleteDataSchemaSpy).toHaveBeenCalledTimes(0);
      expect(dataSpecificationDeleteElementMultipleSpy).toHaveBeenCalledTimes(1);
      expect(dataSpecificationDeleteDataClassSpy).toHaveBeenCalledTimes(0);
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        dataSpecification.id,
        'data',
        labels
      );
      expect(dataSpecificationServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        dataSpecification.id,
        'cohort',
        labels
      );
    });

    it('Refresh data specification when data element is added via DataElementInDataSpecification component, if changed element is current data specification, reload data specification', () => {
      // Arrange
      const event: DataSpecificationElementAddDeleteEvent = {
        adding: true,
        dataElement: dataElements[0],
        dataModel: dataSpecification,
      };
      const intersections: DataSpecificationSourceTargetIntersections = {
        dataSpecifications: [dataSpecification],
        sourceTargetIntersections: [
          {
            intersects: [],
            sourceDataModelId: 'model1',
            targetDataModelId: 'model2',
          },
        ],
      };

      dataSpecificationStub.getQuery
        .mockReturnValueOnce(of(undefined))
        .mockReturnValueOnce(of(undefined));
      dataSchemaStub.loadDataSchemas.mockReturnValueOnce(of([dataSchema]));
      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);
      dataSpecificationStub.getDataSpecificationIntersections.mockReturnValueOnce(
        of(intersections)
      );
      const broadcastDispatchSpy = jest.spyOn(broadcastStub, 'dispatch');
      harness.component.dataSpecification = dataSpecification;

      // Act:
      harness.component.handleDataSpecificationElementsChange(event);

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(harness.component.dataSchemas).toEqual([dataSchema]);
      expect(harness.component.isEmpty).toBeFalsy();
      expect(harness.component.sourceTargetIntersections).toBe(intersections);
      expect(broadcastDispatchSpy).toHaveBeenCalledTimes(0);
    });

    it('Refresh data specification when data element is added via DataElementInDataSpecification component, if changed element is a different data specification, reload intersections only and dispatch notification', () => {
      // Arrange
      const dataSpecification2: DataSpecification = {
        id: '2',
        label: 'data specification 2',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'draft',
      };
      const event: DataSpecificationElementAddDeleteEvent = {
        adding: true,
        dataElement: dataElements[0],
        dataModel: dataSpecification2,
      };
      const intersections: DataSpecificationSourceTargetIntersections = {
        dataSpecifications: [dataSpecification],
        sourceTargetIntersections: [
          {
            intersects: [],
            sourceDataModelId: 'model1',
            targetDataModelId: 'model2',
          },
        ],
      };

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);
      dataSpecificationStub.getDataSpecificationIntersections.mockReturnValueOnce(
        of(intersections)
      );
      const broadcastDispatchSpy = jest.spyOn(broadcastStub, 'dispatch');
      const dataSchemaLoadSchemasSpy = jest.spyOn(dataSchemaStub, 'loadDataSchemas');
      harness.component.dataSpecification = dataSpecification;

      // Act:
      harness.component.handleDataSpecificationElementsChange(event);

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(harness.component.sourceTargetIntersections).toStrictEqual(intersections);
      expect(dataSchemaLoadSchemasSpy).toHaveBeenCalledTimes(0);
      expect(broadcastDispatchSpy).toHaveBeenCalledWith(
        'data-intersections-refreshed',
        intersections
      );
    });
  });

  describe('Handles states of buttons and actions', () => {
    const intersections: DataSpecificationSourceTargetIntersections = {
      dataSpecifications: [dataSpecification],
      sourceTargetIntersections: [
        {
          intersects: [],
          sourceDataModelId: 'model1',
          targetDataModelId: 'model2',
        },
      ],
    };

    let dataSchemaWithDataElements: DataSchema[] = [];
    let dataElementsNotSelected: DataElementSearchResult[] = [];

    beforeEach(() => {
      toastrStub.error.mockClear();
      dataSpecificationStub.get.mockClear();
      dataSchemaStub.reduceDataElementsFromSchemas.mockClear();
      dataSchemaStub.reduceDataElementsFromSchemas.mockReset();
      dataSchemaStub.loadDataSchemas.mockReset();
      dataSpecificationStub.get.mockReset();
      mockSignedInUser();

      // The test below change values from this elements, so we need
      // to reset them before each test to ensure clean state.
      dataElementsNotSelected = [
        {
          dataClass: 'dataClassId0',
          id: 'dataElmentId0',
          isBookmarked: true,
          label: 'label0',
          isSelected: false,
          model: 'modelId0',
        },
        {
          dataClass: 'dataClassId1',
          id: 'dataElmentId1',
          isBookmarked: true,
          label: 'label1',
          isSelected: false,
          model: 'modelId1',
        },
        {
          dataClass: 'dataClassId2',
          id: 'dataElmentId2',
          isBookmarked: true,
          label: 'label2',
          isSelected: false,
          model: 'modelId2',
        },
      ];

      dataSchemaWithDataElements = [
        {
          schema: {
            id: 'schema1',
            domainType: CatalogueItemDomainType.DataClass,
            label: 'labelSchema',
          },
          dataClasses: [
            {
              dataClass: {
                domainType: CatalogueItemDomainType.DataClass,
                label: 'dataClassLabel',
              },
              dataElements: dataElementsNotSelected,
            },
          ],
        },
      ];

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValue(dataElementsNotSelected);

      dataSpecificationStub.get.mockImplementationOnce(() => {
        return of(dataSpecification);
      });
    });

    it('Should start with everything unselected', () => {
      // Arrange

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.allElementsSelected).toBeFalsy();
      expect(harness.component.anyElementSelected).toBeFalsy();
    });

    it('Should select all data elements when Select All is clicked', () => {
      // Arrange
      dataSchemaStub.loadDataSchemas.mockReturnValueOnce(of(dataSchemaWithDataElements));
      dataSpecificationStub.getDataSpecificationIntersections.mockReturnValueOnce(
        of(intersections)
      );
      dataSpecificationStub.getQuery
        .mockReturnValueOnce(of(undefined))
        .mockReturnValueOnce(of(undefined));

      // Act
      harness.component.ngOnInit();
      harness.component.onSelectAll();

      // Assert
      expect(harness.component.allElements).toEqual(dataElementsNotSelected);
      expect(harness.component.allElementsSelected).toBeTruthy();
      expect(harness.component.anyElementSelected).toBeTruthy();
    });

    it('Should display action button when any element is selected', () => {
      // Arrange
      dataSchemaStub.loadDataSchemas.mockReturnValueOnce(of(dataSchemaWithDataElements));
      dataSpecificationStub.getDataSpecificationIntersections.mockReturnValueOnce(
        of(intersections)
      );

      // Act
      harness.component.ngOnInit();
      harness.component.updateAllOrSomeChildrenSelectedHandler();
      // avoid eslint warnings
      if (!harness.component.allElements) {
        expect(harness.component.allElements).toBeDefined();
      } else {
        harness.component.allElements[0].isSelected = true;
      }
      harness.component.updateAllOrSomeChildrenSelectedHandler();

      // Assert
      expect(harness.component.allElements).toEqual(dataElementsNotSelected);
      expect(harness.component.allElementsSelected).toBeFalsy();
      expect(harness.component.anyElementSelected).toBeTruthy();
    });
  });

  describe('Should Check for Queries', () => {
    const condition: QueryCondition = { entity: 'coretable', condition: 'or', rules: [] };

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

    const dataElementsNotSelected = [
      {
        dataClass: 'dataClassId0',
        id: 'dataElmentId0',
        isBookmarked: true,
        label: 'label0',
        isSelected: false,
        model: 'modelId0',
      },
      {
        dataClass: 'dataClassId1',
        id: 'dataElmentId1',
        isBookmarked: true,
        label: 'label1',
        isSelected: false,
        model: 'modelId1',
      },
      {
        dataClass: 'dataClassId2',
        id: 'dataElmentId2',
        isBookmarked: true,
        label: 'label2',
        isSelected: false,
        model: 'modelId2',
      },
    ];

    const dataSchemaWithDataElements = [
      {
        schema: {
          id: 'schema1',
          domainType: CatalogueItemDomainType.DataClass,
          label: 'labelSchema',
        },
        dataClasses: [
          {
            dataClass: {
              domainType: CatalogueItemDomainType.DataClass,
              label: 'dataClassLabel',
            },
            dataElements: dataElementsNotSelected,
          },
        ],
      },
    ];

    const intersections: DataSpecificationSourceTargetIntersections = {
      dataSpecifications: [dataSpecification],
      sourceTargetIntersections: [
        {
          intersects: [],
          sourceDataModelId: 'model1',
          targetDataModelId: 'model2',
        },
      ],
    };

    beforeEach(() => {
      dataSpecificationStub.get.mockImplementationOnce(() => {
        return of(dataSpecification);
      });
      dataSchemaStub.loadDataSchemas.mockReturnValueOnce(of(dataSchemaWithDataElements));
      dataSpecificationStub.getDataSpecificationIntersections.mockReturnValueOnce(
        of(intersections)
      );
    });

    it('should get the Cohort Query if available', () => {
      // Arrange
      const queryType: DataSpecificationQueryType = 'cohort';
      const payload: DataSpecificationQueryPayload = {
        ruleId: rule.id,
        representationId: representation.id,
        type: queryType,
        condition,
      };

      const returned: DataSpecificationQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };
      dataSpecificationStub.getQuery.mockImplementation(() => {
        return of(returned);
      });

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.cohortQuery).toEqual(condition);
    });

    it('should get the data Query if available', () => {
      // Arrange
      const queryType: DataSpecificationQueryType = 'data';
      const payload: DataSpecificationQueryPayload = {
        ruleId: rule.id,
        representationId: representation.id,
        type: queryType,
        condition,
      };

      const returned: DataSpecificationQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };
      dataSpecificationStub.getQuery.mockImplementation(() => {
        return of(returned);
      });

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.dataQuery).toEqual(condition);
    });
  });
});
