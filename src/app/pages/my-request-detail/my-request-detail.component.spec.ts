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
import { DebugElement } from '@angular/core';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
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
  DataElementDeleteEvent,
  DataElementDto,
  DataElementMultipleOperationResult,
  DataRequest,
  DataElementSearchResult,
  QueryCondition,
  DataRequestQuery,
  DataRequestQueryType,
  dataRequestQueryLanguage,
  DataRequestQueryPayload,
} from 'src/app/data-explorer/data-explorer.types';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { OkCancelDialogResponse } from 'src/app/data-explorer/ok-cancel-dialog/ok-cancel-dialog.component';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
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
  const securityStub = createSecurityServiceStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const toastrStub = createToastrServiceStub();
  const researchPluginStub = createResearchPluginServiceStub();
  const dialogsStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const explorerStub = createDataExplorerServiceStub();
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
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
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

  const user = { email: 'test@test.com' } as UserDetails;

  const mockSignedInUser = () => {
    securityStub.getSignedInUser.mockReturnValueOnce(user);
  };

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.request).toBeUndefined();
    expect(harness.component.request).toBeUndefined();
    expect(harness.component.requestElements).toStrictEqual([]);
    expect(harness.component.state).toBe('idle');
  });

  describe('initialisation', () => {
    beforeEach(() => {
      dataRequestsStub.list.mockClear();
      toastrStub.error.mockClear();
    });

    it('should do nothing if there is no user', () => {
      harness.component.ngOnInit();
      expect(dataRequestsStub.list).not.toHaveBeenCalled();
    });

    it('should have a request', () => {
      const request: DataRequest = {
        id: '1',
        label: 'request 1',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };

      mockSignedInUser();

      dataRequestsStub.get.mockImplementationOnce((id) => {
        expect(id).toEqual(requestId);
        expect(harness.component.state).toBe('loading');
        return of(request);
      });

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(harness.component.request).toStrictEqual(request);
    });

    it('should display an error if failed to get requests', () => {
      mockSignedInUser();

      dataRequestsStub.list.mockImplementationOnce(() => throwError(() => new Error()));

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.request).toBeUndefined();
    });

    it('should handle having no requests available', () => {
      mockSignedInUser();

      dataRequestsStub.list.mockImplementationOnce(() => {
        expect(harness.component.state).toBe('loading');
        return of([]);
      });

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(harness.component.request).toBeUndefined();
    });
  });

  describe('submit request', () => {
    const request: DataRequest = {
      id: '123',
      label: 'request',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'unsent',
    };

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
      researchPluginStub.submitRequest.mockImplementationOnce((id) => {
        expect(id).toBe(request.id);
        return throwError(() => new Error());
      });

      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));

      harness.component.request = request;
      harness.component.submitRequest();

      expect(researchPluginStub.submitRequest).toHaveBeenCalled();
      expect(toastrStub.error).toHaveBeenCalled();
    });

    it('should update status of current request once submitted', () => {
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
      harness.component.submitRequest();

      expect(researchPluginStub.submitRequest).toHaveBeenCalled();
      expect(harness.component.request.status).toBe('submitted');
      expect(broadcastStub.dispatch).toHaveBeenCalledWith('data-request-submitted');
      expect(broadcastStub.loading).toHaveBeenCalledWith({
        isLoading: true,
        caption: 'Submitting your request...',
      });
      expect(broadcastStub.loading).toHaveBeenCalledWith({ isLoading: false });
    });
  });

  describe('remove elements from requests', () => {
    let elements: DataElementDto[];
    let selectableElements: () => DataElementSearchResult[];
    let request: DataRequest;
    let requestMenuItem = {
      dataModel: { id: '', label: '', domainType: CatalogueItemDomainType.DataModel },
      containsElement: false,
    };
    let intersections = {} as DataAccessRequestsSourceTargetIntersections;
    let component: MyRequestDetailComponent;
    let dom: DebugElement;

    beforeEach(() => {
      mockSignedInUser();
      elements = [
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

      selectableElements = () => {
        return elements.map((e) => {
          return {
            ...e,
            isSelected: false,
            isBookmarked: false,
          } as DataElementSearchResult;
        });
      };

      request = { id: '1', status: 'unsent', label: 'request 1' } as DataRequest;
      requestMenuItem = {
        dataModel: {
          id: '1',
          label: 'request 1',
          domainType: CatalogueItemDomainType.DataModel,
        },
        containsElement: true,
      };

      dataRequestsStub.listDataElements.mockImplementation((req) => {
        expect(req).toStrictEqual(request);
        expect(component.state).toBe('loading');
        return of(elements);
      });

      dataRequestsStub.list.mockImplementation(() => of([request]));

      dataRequestsStub.getRequestsIntersections.mockImplementation((model: string) => {
        intersections = {
          dataAccessRequests: [
            {
              label: 'data model',
              id: model,
              domainType: CatalogueItemDomainType.DataModel,
            },
          ],

          sourceTargetIntersections: [],
        };
        return of(intersections);
      });

      explorerStub.getRootDataModel.mockImplementation(() => {
        return of({
          label: 'root model',
          id: 'root model id',
          domainType: CatalogueItemDomainType.DataModel,
          finalised: false,
          availableActions: [],
        });
      });

      dataModelsStub.elementsInAnotherModel.mockImplementation((model, innerElements) =>
        of(innerElements)
      );
      dataModelsStub.dataElementToBasic.mockImplementation((element) => {
        return {
          id: element.id ?? '',
          dataClass: element.dataClass ?? '',
          model: element.model ?? '',
          label: element.label,
          isBookmarked: false,
          breadcrumbs: element.breadcrumbs,
        };
      });

      dataRequestsStub.get.mockImplementationOnce((id) => {
        expect(id).toEqual(requestId);
        expect(harness.component.state).toBe('loading');
        return of(request);
      });

      component = harness.component;
      component.ngOnInit();
      harness.detectChanges();
      dom = harness.fixture.debugElement;
    });

    it('Refresh request when data element is deleted via DataElementInRequest component', () => {
      // Not Sure if these two tests are still needed, can something externally modify a request?
      // pick the first row and trigger the RequestAddDelete event
      const dataElementRow: DebugElement = dom.query(
        (de) => de.name === 'mdm-data-element-row'
      );
      const requestAddDeleteEvent: RequestElementAddDeleteEvent = {
        adding: false,
        dataModel: requestMenuItem.dataModel,
        dataElement: selectableElements()[0],
      };
      // Pretend to delete 1 element
      dataRequestsStub.listDataElements.mockImplementation((req) => {
        expect(req).toStrictEqual(request);
        expect(component.state).toBe('loading');
        return of(elements.slice(0, 1));
      });
      dataElementRow.triggerEventHandler('requestAddDelete', requestAddDeleteEvent);
      expect(component.requestElements).toStrictEqual(selectableElements().slice(0, 1));
    });

    it('Refresh request when data element is added via DataElementInRequest component', () => {
      // pick the first row and trigger the RequestAddDelete event
      const dataElementRow: DebugElement = dom.query(
        (de) => de.name === 'mdm-data-element-row'
      );
      requestMenuItem.containsElement = false;
      const requestAddDeleteEvent: RequestElementAddDeleteEvent = {
        adding: true,
        dataModel: requestMenuItem.dataModel,
        dataElement: selectableElements()[0],
      };
      // Pretend to add 1 element
      elements.push({
        id: '3',
        label: 'element 3',
        domainType: CatalogueItemDomainType.DataElement,
      });
      dataRequestsStub.listDataElements.mockImplementation((req) => {
        expect(req).toStrictEqual(request);
        expect(component.state).toBe('loading');
        return of(elements);
      });

      // expected elements are the original first 2 request elements
      expect(component.requestElements).toStrictEqual(selectableElements().slice(0, 2));
      dataElementRow.triggerEventHandler('requestAddDelete', requestAddDeleteEvent);
      // after refresh, expected elements are all 3 of the request elements
      expect(component.requestElements).toStrictEqual(selectableElements());
    });

    it('Should select all data elements when Select All is clicked', () => {
      // Find the Select All checkbox
      const matCheckbox: DebugElement = dom.query(
        (de) => de.name === 'mat-checkbox' && de.nativeElement.innerHTML === 'Select all'
      );
      const matCheckboxChange: MatCheckboxChange = {
        source: {} as MatCheckbox,
        checked: true,
      };
      // Should already be false, but this future-proofs against changes to setup
      component.requestElements.forEach((element) => (element.isSelected = false));
      matCheckbox.triggerEventHandler('change', matCheckboxChange);
      expect(component.requestElements).toHaveLength(2);
      expect(component.requestElements[0].isSelected).toBe(true);
      expect(component.requestElements[1].isSelected).toBe(true);
    });

    it('Should enable RemoveSelected button on when there is a request, there are request elements and at least 1 is selected', () => {
      const savRequest = component.request;
      const savRequestElements = component.requestElements;

      component.request = undefined;
      component.requestElements = [];

      expect(component.removeSelectedButtonDisabled).toBeTruthy();

      component.request = savRequest;
      expect(component.removeSelectedButtonDisabled).toBeTruthy();
      component.requestElements = savRequestElements;
      expect(component.removeSelectedButtonDisabled).toBeTruthy();
      component.onSelectElement({ item: component.requestElements[0], checked: true });
      expect(component.removeSelectedButtonDisabled).toBeFalsy();
      component.onSelectElement({ item: component.requestElements[1], checked: true });
      expect(component.removeSelectedButtonDisabled).toBeFalsy();
      component.onSelectElement({ item: component.requestElements[0], checked: false });
      expect(component.removeSelectedButtonDisabled).toBeFalsy();
      component.onSelectElement({ item: component.requestElements[1], checked: false });
      expect(component.removeSelectedButtonDisabled).toBeTruthy();
    });

    it('Should open OK/Cancel dialogue, show spinner, call into DataRequestsService.deleteDataElementMultiple with a single item and refresh the request list when Remove button is clicked', () => {
      // Find any data element row from which to trigger an event
      const dataElementRow: DebugElement = dom.query(
        (de) => de.name === 'mdm-data-element-row'
      );
      const dataElementDeleteEvent: DataElementDeleteEvent = {
        item: selectableElements()[0],
      };
      // spy on OK/Cancel, broadcast service .loading and DataRequestsService.deleteDataElementMultiple
      dialogsStub.usage.afterClosed.mockReset();
      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.open = jest.fn().mockReturnValue(dialogsStub.usage);
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));
      const deleteResult: DataElementMultipleOperationResult = {
        successes: [
          {
            success: true,
            message: '',
            item: component.requestElements[0],
          },
        ],
        failures: [],
      };
      dataRequestsStub.deleteDataElementMultiple.mockReset();
      dataRequestsStub.deleteDataElementMultiple.mockReturnValue(of(deleteResult));
      broadcastStub.loading.mockReset();

      // Pretend to delete first element
      dataRequestsStub.listDataElements.mockImplementation(() => {
        return of(elements.slice(1, 2));
      });
      // Raise the delete event
      dataElementRow.triggerEventHandler('delete', dataElementDeleteEvent);

      // check the fallout
      expect(dialogsStub.open).toHaveBeenCalledTimes(1);
      expect(broadcastStub.loading).toHaveBeenCalledTimes(2);
      expect(dataRequestsStub.deleteDataElementMultiple).toHaveBeenCalledTimes(1);
      expect(dataRequestsStub.deleteDataElementMultiple.mock.calls[0][0]).toStrictEqual([
        selectableElements()[0],
      ]);
      expect(dataRequestsStub.deleteDataElementMultiple.mock.calls[0][1].id).toBe(
        request.id
      );
      expect(dataRequestsStub.deleteDataElementMultiple.mock.calls[0][1].label).toBe(
        request.label
      );
      expect(component.requestElements.length).toBe(1);
      expect(component.requestElements[0]).toStrictEqual(selectableElements()[1]);
    });

    it('Should open OK/Cancel dialogue, show spinner, call into DataRequestsService.deleteDataElementMultiple with 2 items and refresh the request list when Remove Selected is clicked', () => {
      // Find Remove Selected button to click for event trigger
      const dataElementRow: DebugElement = dom.query(
        (de) =>
          de.name === 'button' && de.nativeElement.innerHTML === ' Remove selected ... '
      );
      // Select request elements
      component.requestElements.forEach((el) => (el.isSelected = true));
      // spy on OK/Cancel, broadcast service .loading and DataRequestsService.deleteDataElementMultiple
      dialogsStub.usage.afterClosed.mockReset();
      const okCancelResponse: OkCancelDialogResponse = {
        result: true,
      };
      dialogsStub.open = jest.fn().mockReturnValue(dialogsStub.usage);
      dialogsStub.usage.afterClosed.mockReturnValue(of(okCancelResponse));
      const deleteResult: DataElementMultipleOperationResult = {
        successes: [
          {
            success: true,
            message: '',
            item: component.requestElements[0],
          },
        ],
        failures: [],
      };
      dataRequestsStub.deleteDataElementMultiple.mockReset();
      dataRequestsStub.deleteDataElementMultiple.mockReturnValue(of(deleteResult));
      broadcastStub.loading.mockReset();

      // Pretend to delete all elements
      dataRequestsStub.listDataElements.mockImplementation(() => {
        return of([]);
      });
      // Raise the click event
      dataElementRow.triggerEventHandler('click', {});

      // check the fallout
      expect(dialogsStub.open).toHaveBeenCalledTimes(1);
      expect(broadcastStub.loading).toHaveBeenCalledTimes(2);
      expect(dataRequestsStub.deleteDataElementMultiple).toHaveBeenCalledTimes(1);
      const expectedDeleteItems = selectableElements();
      expectedDeleteItems.forEach((el) => (el.isSelected = true));
      expect(dataRequestsStub.deleteDataElementMultiple.mock.calls[0][0]).toStrictEqual(
        expectedDeleteItems
      );
      expect(dataRequestsStub.deleteDataElementMultiple.mock.calls[0][1].id).toBe(
        request.id
      );
      expect(dataRequestsStub.deleteDataElementMultiple.mock.calls[0][1].label).toBe(
        request.label
      );
      expect(component.requestElements.length).toBe(0);
    });
  });

  describe('Should Check for Queries', () => {
    const request = { id: '1', status: 'unsent', label: 'request 1' } as DataRequest;
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

    beforeEach(() => {
      dataRequestsStub.list.mockClear();
      harness.component.request = request;
    });

    it('should get the Cohort Query if available', () => {
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
      harness.component.initialiseRequestQueries();
      expect(harness.component.cohortQuery).toEqual(condition);
    });

    it('should get the data Query if available', () => {
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
      harness.component.initialiseRequestQueries();
      expect(harness.component.dataQuery).toEqual(condition);
    });
  });
});
