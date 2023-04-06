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
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  DataClassWithElements,
  DataElementOperationResult,
  DataElementSearchResult,
  DataItemDeleteEvent,
  DataRequest,
  DataRequestQuery,
  dataRequestQueryLanguage,
  DataRequestQueryPayload,
  DataRequestQueryType,
  DataSchema,
  QueryCondition,
} from 'src/app/data-explorer/data-explorer.types';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { DataSchemaService } from 'src/app/data-explorer/data-schema.service';
import { OkCancelDialogResponse } from 'src/app/data-explorer/ok-cancel-dialog/ok-cancel-dialog.component';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { createDataSchemaServiceStub } from 'src/app/testing/stubs/data-schema.stub';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { createResearchPluginServiceStub } from 'src/app/testing/stubs/research-plugin.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { MyRequestDetailComponent } from './my-request-detail.component';

describe('MyRequestsComponent', () => {
  let harness: ComponentHarness<MyRequestDetailComponent>;
  const dataRequestsStub = createDataRequestsServiceStub();
  const dataSchemaStub = createDataSchemaServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const toastrStub = createToastrServiceStub();
  const researchPluginStub = createResearchPluginServiceStub();
  const dialogsStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const explorerStub = createDataExplorerServiceStub();
  const securityStub = createSecurityServiceStub();
  const requestId = '1';
  const activatedRoute: ActivatedRoute = {
    params: of({
      requestId,
    }),
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyRequestDetailComponent, {
      providers: [
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
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
          provide: ResearchPluginService,
          useValue: researchPluginStub,
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
      ],
    });
  });

  const request: DataRequest = {
    id: '1',
    label: 'request 1',
    domainType: CatalogueItemDomainType.DataModel,
    status: 'unsent',
  };

  const user = { email: 'test@test.com' } as UserDetails;

  const mockSignedInUser = () => {
    securityStub.getSignedInUser.mockReturnValueOnce(user);
  };

  describe('initialisation', () => {
    beforeEach(() => {
      toastrStub.error.mockClear();
      dataRequestsStub.get.mockClear();
      dataRequestsStub.get.mockReset();
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.request).toBeUndefined();
      expect(harness.component.dataSchemas).toStrictEqual([]);
      expect(harness.component.state).toBe('idle');
    });

    it('should have a request', () => {
      // Arrange
      dataRequestsStub.get.mockImplementationOnce(() => {
        return of(request);
      });

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(harness.component.request).toStrictEqual(request);
      expect(dataRequestsStub.get).toHaveBeenCalledWith(requestId);
    });

    it('should display an error if failed to get requests', () => {
      // Arrange
      dataRequestsStub.get.mockImplementationOnce(() => throwError(() => new Error()));

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.request).toBeUndefined();
    });

    it('should handle having no requests available', () => {
      // Arrange
      dataRequestsStub.get.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({}))
      );

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.request).toBeUndefined();
    });
  });

  describe('submit request', () => {
    beforeEach(() => {
      researchPluginStub.submitRequest.mockClear();
      toastrStub.error.mockClear();
      broadcastStub.dispatch.mockClear();
      broadcastStub.loading.mockClear();
    });

    it('should do nothing if there is no request', () => {
      harness.component.submitRequest();
      expect(researchPluginStub.submitRequest).not.toHaveBeenCalled();
    });

    it('should do nothing if current request is not in unsent state', () => {
      harness.component.request = {
        ...request,
        status: 'submitted',
      };

      harness.component.submitRequest();
      expect(researchPluginStub.submitRequest).not.toHaveBeenCalled();
    });

    it('should raise error if failed to submit', () => {
      // Arrange
      researchPluginStub.submitRequest.mockImplementationOnce((id) => {
        expect(id).toBe(request.id);
        return throwError(() => new Error());
      });

      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      harness.component.request = request;

      // Act
      harness.component.submitRequest();

      // Assert
      expect(researchPluginStub.submitRequest).toHaveBeenCalled();
      expect(broadcastStub.loading).toHaveBeenCalledTimes(2);
      expect(toastrStub.error).toHaveBeenCalled();
    });

    it('should update status of current request once submitted', () => {
      // Arrange
      const submittedDataModel: DataModelDetail = {
        id: request.id,
        label: request.label,
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: true,
        modelVersion: '1.0.0',
      };

      researchPluginStub.submitRequest.mockImplementationOnce((id) => {
        expect(id).toBe(request.id);
        return of(submittedDataModel);
      });

      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      harness.component.request = request;

      // Act
      harness.component.submitRequest();

      // Assert
      expect(researchPluginStub.submitRequest).toHaveBeenCalled();
      expect(harness.component.request.status).toBe('submitted');
      expect(broadcastStub.dispatch).toHaveBeenCalledWith('data-request-submitted');
      expect(broadcastStub.loading).toHaveBeenCalledTimes(2);
      expect(broadcastStub.loading.mock.calls).toEqual([
        [
          {
            isLoading: true,
            caption: 'Submitting your request...',
          },
        ],
        [{ isLoading: false }],
      ]);
    });

    it('should not submit request if dialog is not accepted', () => {
      // Arrange
      const okCancelResponse: OkCancelDialogResponse = {
        result: false,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      harness.component.request = request;

      // Act
      harness.component.submitRequest();

      // Assert
      expect(researchPluginStub.submitRequest).toHaveBeenCalledTimes(0);
      expect(harness.component.request.status).toBe('unsent');
      expect(broadcastStub.dispatch).toHaveBeenCalledTimes(0);
      expect(broadcastStub.loading).toHaveBeenCalledWith({ isLoading: false });
    });
  });

  describe('remove elements from requests and handling changes', () => {
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
      dataRequestsStub.deleteDataClass.mockClear();
      dataRequestsStub.deleteDataSchema.mockClear();
      dataSchemaStub.loadDataSchemas.mockClear();
    });

    it('Wrong schema information should rise toastr error without opening dialog with user', () => {
      // Arrange
      harness.component.request = request;
      const dialogSpy = jest.spyOn(dialogsStub, 'open');

      // Act
      harness.component.removeItem(eventDeleteUndefinedDataSchema);

      // Assert
      expect(toastrStub.error).toBeCalledWith(
        'Data schema undefined',
        'Unable to delete items'
      );
      expect(dialogSpy).toHaveBeenCalledTimes(0);
    });

    it('Should not attempt to delete anything if user cancels confirmation', () => {
      // Arrange
      harness.component.request = request;
      const noToOkCancelResponse: OkCancelDialogResponse = {
        result: false,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(noToOkCancelResponse));

      const dataRequestServiceSpy = jest.spyOn(dataRequestsStub, 'deleteDataSchema');

      // Act
      harness.component.removeItem(eventDeleteDataSchema);

      // Assert
      expect(dataRequestServiceSpy).toHaveBeenCalledTimes(0);
    });

    it('Should delete dataSchema correctly, also it should delete dataelements from queries', () => {
      // Arrange
      harness.component.request = request;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataRequestServiceSpy = jest.spyOn(dataRequestsStub, 'deleteDataSchema');

      dataRequestsStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataRequestServiceDeleteFromQuerySpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataSchema);

      // Assert
      expect(dataRequestServiceSpy).toHaveBeenCalledWith(
        eventDeleteDataSchema.dataSchema?.schema
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        request.id,
        'data',
        labels
      );
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        request.id,
        'cohort',
        labels
      );
    });

    it('Should delete dataClass correctly, schema only has 1 class, then delete dataschema', () => {
      // Arrange
      harness.component.request = request;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataRequestServiceSpy = jest.spyOn(dataRequestsStub, 'deleteDataSchema');
      const dataRequestDeleteDataClassSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataClass'
      );

      dataRequestsStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataRequestServiceDeleteFromQuerySpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataClass);

      // Assert
      expect(dataRequestServiceSpy).toHaveBeenCalledWith(
        eventDeleteDataSchema.dataSchema?.schema
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        request.id,
        'data',
        labels
      );
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        request.id,
        'cohort',
        labels
      );
      expect(dataRequestDeleteDataClassSpy).toHaveBeenCalledTimes(0);
    });

    it('Should delete dataClass correctly, schema has multiple classes, so deleteDataClass is used', () => {
      // Arrange
      harness.component.request = request;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataRequestServiceSpy = jest.spyOn(dataRequestsStub, 'deleteDataSchema');
      const dataRequestDeleteDataClassSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataClass'
      );

      dataRequestsStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataRequestServiceDeleteFromQuerySpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      eventDeleteDataClass.dataSchema?.dataClasses.push(dataClass);
      harness.component.removeItem(eventDeleteDataClass);

      // Assert
      expect(dataRequestServiceSpy).toHaveBeenCalledTimes(0);
      expect(dataRequestDeleteDataClassSpy).toHaveBeenCalledTimes(1);
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        request.id,
        'data',
        labels
      );
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        request.id,
        'cohort',
        labels
      );
    });

    it('Should delete dataElements correctly, if last child of dataClass, should delete dataClass', () => {
      // Arrange
      harness.component.request = request;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataRequestDeleteDataSchemaSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataSchema'
      );
      const dataRequestDeleteElementMultipleSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementMultiple'
      );
      const dataRequestDeleteDataClassSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataClass'
      );

      dataRequestsStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataRequestServiceDeleteFromQuerySpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataElementDataClassWith1Element);

      // Assert
      expect(dataRequestDeleteDataSchemaSpy).toHaveBeenCalledTimes(0);
      expect(dataRequestDeleteElementMultipleSpy).toHaveBeenCalledTimes(0);
      expect(dataRequestDeleteDataClassSpy).toHaveBeenCalledTimes(1);
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        request.id,
        'data',
        labels
      );
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        request.id,
        'cohort',
        labels
      );
    });

    it('Should delete dataElements correctly', () => {
      // Arrange
      harness.component.request = request;

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);

      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      const dataRequestDeleteDataSchemaSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataSchema'
      );
      const dataRequestDeleteElementMultipleSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementMultiple'
      );
      const dataRequestDeleteDataClassSpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataClass'
      );

      dataRequestsStub.deleteDataSchema.mockReturnValueOnce(of(deleteElementResult));
      const dataRequestServiceDeleteFromQuerySpy = jest.spyOn(
        dataRequestsStub,
        'deleteDataElementsFromQuery'
      );
      const broadcastSpy = jest.spyOn(broadcastStub, 'loading');

      // Act
      harness.component.removeItem(eventDeleteDataElement);

      // Assert
      expect(dataRequestDeleteDataSchemaSpy).toHaveBeenCalledTimes(0);
      expect(dataRequestDeleteElementMultipleSpy).toHaveBeenCalledTimes(1);
      expect(dataRequestDeleteDataClassSpy).toHaveBeenCalledTimes(0);
      expect(broadcastSpy).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          isLoading: true,
        })
      );
      expect(broadcastSpy).toHaveBeenNthCalledWith(2, { isLoading: false });
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        1,
        request.id,
        'data',
        labels
      );
      expect(dataRequestServiceDeleteFromQuerySpy).toHaveBeenNthCalledWith(
        2,
        request.id,
        'cohort',
        labels
      );
    });

    it('Refresh request when data element is added via DataElementInRequest component, if changed element is current request, reload request', () => {
      // Arrange
      const event: RequestElementAddDeleteEvent = {
        adding: true,
        dataElement: dataElements[0],
        dataModel: request,
      };
      const intersections: DataAccessRequestsSourceTargetIntersections = {
        dataAccessRequests: [request],
        sourceTargetIntersections: [
          {
            intersects: [],
            sourceDataModelId: 'model1',
            targetDataModelId: 'model2',
          },
        ],
      };

      dataSchemaStub.loadDataSchemas.mockReturnValueOnce(of([dataSchema]));
      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);
      dataRequestsStub.getRequestsIntersections.mockReturnValueOnce(of(intersections));
      const broadcastDispatchSpy = jest.spyOn(broadcastStub, 'dispatch');
      harness.component.request = request;

      // Act:
      harness.component.handleRequestElementsChange(event);

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(harness.component.dataSchemas).toEqual([dataSchema]);
      expect(harness.component.isEmpty).toBeFalsy();
      expect(harness.component.sourceTargetIntersections).toBe(intersections);
      expect(broadcastDispatchSpy).toHaveBeenCalledTimes(0);
    });

    it('Refresh request when data element is added via DataElementInRequest component, if changed element is a different request, reload intersections only and dispatch notification', () => {
      // Arrange
      const request2: DataRequest = {
        id: '2',
        label: 'request 2',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };
      const event: RequestElementAddDeleteEvent = {
        adding: true,
        dataElement: dataElements[0],
        dataModel: request2,
      };
      const intersections: DataAccessRequestsSourceTargetIntersections = {
        dataAccessRequests: [request],
        sourceTargetIntersections: [
          {
            intersects: [],
            sourceDataModelId: 'model1',
            targetDataModelId: 'model2',
          },
        ],
      };

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValueOnce(dataElements);
      dataRequestsStub.getRequestsIntersections.mockReturnValueOnce(of(intersections));
      const broadcastDispatchSpy = jest.spyOn(broadcastStub, 'dispatch');
      const dataSchemaLoadSchemasSpy = jest.spyOn(dataSchemaStub, 'loadDataSchemas');
      harness.component.request = request;

      // Act:
      harness.component.handleRequestElementsChange(event);

      // Assert
      expect(harness.component.state).toBe('idle');
      expect(harness.component.sourceTargetIntersections).toBe(intersections);
      expect(dataSchemaLoadSchemasSpy).toHaveBeenCalledTimes(0);
      expect(broadcastDispatchSpy).toHaveBeenCalledWith(
        'data-intersections-refreshed',
        intersections
      );
    });
  });

  describe('Handles states of buttons and actions', () => {
    const intersections: DataAccessRequestsSourceTargetIntersections = {
      dataAccessRequests: [request],
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
      dataRequestsStub.get.mockClear();
      dataSchemaStub.reduceDataElementsFromSchemas.mockClear();
      dataSchemaStub.reduceDataElementsFromSchemas.mockReset();
      dataSchemaStub.loadDataSchemas.mockReset();
      dataRequestsStub.get.mockReset();

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

      dataSchemaStub.reduceDataElementsFromSchemas.mockReturnValue(
        dataElementsNotSelected
      );

      dataRequestsStub.get.mockImplementationOnce(() => {
        return of(request);
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
      dataRequestsStub.getRequestsIntersections.mockReturnValueOnce(of(intersections));

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
      dataRequestsStub.getRequestsIntersections.mockReturnValueOnce(of(intersections));

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
    const condition: QueryCondition = { condition: 'or', rules: [] };

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

    const intersections: DataAccessRequestsSourceTargetIntersections = {
      dataAccessRequests: [request],
      sourceTargetIntersections: [
        {
          intersects: [],
          sourceDataModelId: 'model1',
          targetDataModelId: 'model2',
        },
      ],
    };

    beforeEach(() => {
      dataRequestsStub.get.mockImplementationOnce(() => {
        return of(request);
      });
      dataSchemaStub.loadDataSchemas.mockReturnValueOnce(of(dataSchemaWithDataElements));
      dataRequestsStub.getRequestsIntersections.mockReturnValueOnce(of(intersections));
    });

    it('should get the Cohort Query if available', () => {
      // Arrange
      const queryType: DataRequestQueryType = 'cohort';
      const payload: DataRequestQueryPayload = {
        ruleId: rule.id,
        representationId: representation.id,
        type: queryType,
        condition,
      };

      const returned: DataRequestQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };
      dataRequestsStub.getQuery.mockImplementation(() => {
        return of(returned);
      });

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.cohortQuery).toEqual(condition);
    });

    it('should get the data Query if available', () => {
      // Arrange
      const queryType: DataRequestQueryType = 'data';
      const payload: DataRequestQueryPayload = {
        ruleId: rule.id,
        representationId: representation.id,
        type: queryType,
        condition,
      };

      const returned: DataRequestQuery = {
        ruleId: rule.id,
        representationId: representation.id,
        ...payload,
      };
      dataRequestsStub.getQuery.mockImplementation(() => {
        return of(returned);
      });

      // Act
      harness.component.ngOnInit();

      // Assert
      expect(harness.component.dataQuery).toEqual(condition);
    });
  });
});
