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
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import {
  CatalogueItemDomainType,
  DataClass,
  DataModelDetail,
} from '@maurodatamapper/mdm-resources';
import { MockComponent, MockService } from 'ng-mocks';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, throwError } from 'rxjs';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { BrowseComponent } from './browse.component';
import { MatDialog } from '@angular/material/dialog';
import { MatMenu } from '@angular/material/menu';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import {
  DataElementDto,
  DataElementInstance,
} from 'src/app/data-explorer/data-explorer.types';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { RequestCreatedAction } from 'src/app/data-explorer/request-created-dialog/request-created-dialog.component';

describe('BrowseComponent', () => {
  let harness: ComponentHarness<BrowseComponent>;
  const dataModelStub = createDataModelServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();
  const stateRouterStub = createStateRouterStub();
  const toastrStub = createToastrServiceStub();
  const matDialogStub = createMatDialogStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const securityStub = createSecurityServiceStub();
  const broadcastStub = createBroadcastServiceStub();

  const user: UserDetails = {
    id: '123',
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
  };

  securityStub.getSignedInUser.mockImplementation(() => user);

  const rootDataModel: DataModelDetail = {
    id: '123',
    label: 'test model',
    domainType: CatalogueItemDomainType.DataModel,
    availableActions: ['show'],
    finalised: false,
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BrowseComponent, {
      declarations: [MockComponent(MatSelectionList), MockComponent(MatMenu)],
      providers: [
        {
          provide: MatDialog,
          useValue: MockService(MatDialog),
        },
        {
          provide: DataModelService,
          useValue: dataModelStub,
        },
        {
          provide: DataExplorerService,
          useValue: dataExplorerStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('initialisation', () => {
    beforeEach(() => {
      toastrStub.error.mockClear();
    });

    it('should display an error when root data model is missing', () => {
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      harness.component.ngOnInit();

      expect(toastrStub.error).toHaveBeenCalled();
      expect(dataExplorerStub.getRootDataModel).toHaveBeenCalled();
      expect(dataModelStub.getDataClasses).not.toHaveBeenCalled();
    });

    it('should display an error when parent data classes is missing', () => {
      dataExplorerStub.getRootDataModel.mockImplementationOnce(() => of(rootDataModel));

      dataModelStub.getDataClasses.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      harness.component.ngOnInit();

      expect(toastrStub.error).toHaveBeenCalled();
      expect(dataExplorerStub.getRootDataModel).toHaveBeenCalled();
      expect(dataModelStub.getDataClasses).toHaveBeenCalled();
    });

    it('should display the initial parent data classes', () => {
      const dataClasses: DataClass[] = [
        {
          id: '1',
          label: 'class 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '2',
          label: 'class 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      dataExplorerStub.getRootDataModel.mockImplementationOnce(() => of(rootDataModel));
      dataModelStub.getDataClasses.mockImplementationOnce(() => of(dataClasses));

      harness.component.ngOnInit();

      expect(toastrStub.error).not.toHaveBeenCalled();
      expect(harness.component.parentDataClasses).toBe(dataClasses);
      expect(harness.component.selected).not.toBeDefined();
    });
  });

  describe('select parent data class', () => {
    const parentDataClass: DataClass = {
      id: '1',
      label: 'class 1',
      domainType: CatalogueItemDomainType.DataClass,
    };

    // Fake enough of a MatSelectedListChange object to make the test work
    const event = {
      options: [
        {
          value: parentDataClass,
        },
      ],
    } as MatSelectionListChange;

    beforeEach(() => {
      toastrStub.error.mockClear();
      harness.component.parentDataClasses = [parentDataClass];
    });

    it('should display an error when child data classes are missing', () => {
      dataModelStub.getDataClasses.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      harness.component.selectParentDataClass(event);

      expect(harness.component.selected).toBe(parentDataClass);
      expect(harness.component.childDataClasses).toEqual([]);
      expect(toastrStub.error).toHaveBeenCalled();
    });

    it('should display child data classes once a parent is selected', () => {
      const dataClasses: DataClass[] = [
        {
          id: '2',
          label: 'child 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '3',
          label: 'child 2',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      dataModelStub.getDataClasses.mockImplementationOnce(() => of(dataClasses));

      harness.component.selectParentDataClass(event);

      expect(harness.component.selected).toBe(parentDataClass);
      expect(harness.component.childDataClasses).toBe(dataClasses);
      expect(toastrStub.error).not.toHaveBeenCalled();
    });

    it('should display initial parent label before parent is selected', () => {
      const parentLabel = harness.component.parentDataClassLabel;
      expect(parentLabel).toBe(BrowseComponent.ParentDataClassInitialLabel);
    });

    it('should display initial child label before parent is selected', () => {
      const childLabel = harness.component.childDataClassLabel;
      expect(childLabel).toBe(BrowseComponent.ChildDataClassInitialLabel);
    });

    it('should display selected label after parent is selected', () => {
      const dataClasses: DataClass[] = [
        {
          id: '2',
          label: 'child 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '3',
          label: 'child 2',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      dataModelStub.getDataClasses.mockImplementationOnce(() => of(dataClasses));

      harness.component.selectParentDataClass(event);
      const parentLabel = harness.component.parentDataClassLabel;
      expect(parentLabel).toBe(BrowseComponent.ParentDataClassSelectedLabel);
    });

    it('should display first child label after parent is selected', () => {
      const dataClasses: DataClass[] = [
        {
          id: '2',
          label: 'child 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '3',
          label: 'child 2',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      dataModelStub.getDataClasses.mockImplementationOnce(() => of(dataClasses));

      harness.component.selectParentDataClass(event);
      const childLabel = harness.component.childDataClassLabel;
      expect(childLabel).toBe(BrowseComponent.ChildDataClassParentClassSelectedLabel);
    });
  });

  describe('select child data class', () => {
    const parentDataClass: DataClass = {
      id: '1',
      label: 'class 1',
      domainType: CatalogueItemDomainType.DataClass,
    };

    const childDataClass: DataClass = {
      id: '2',
      label: 'class 2',
      parentDataClass: '1',
      domainType: CatalogueItemDomainType.DataClass,
    };

    // Fake enough of a MatSelectedListChange object to make the test work
    const event = {
      options: [
        {
          value: childDataClass,
        },
      ],
    } as MatSelectionListChange;

    beforeEach(() => {
      harness.component.parentDataClasses = [parentDataClass];
      harness.component.childDataClasses = [childDataClass];
    });

    it('should select the given child data class', () => {
      harness.component.selectChildDataClass(event);
      expect(harness.component.selected).toBe(childDataClass);
    });

    it('should display selected parent label', () => {
      harness.component.selectChildDataClass(event);
      const parentLabel = harness.component.parentDataClassLabel;
      expect(parentLabel).toBe(BrowseComponent.ParentDataClassSelectedLabel);
    });

    it('should display selected child label', () => {
      harness.component.selectChildDataClass(event);
      const childLabel = harness.component.childDataClassLabel;
      expect(childLabel).toBe(BrowseComponent.ChildDataClassSelectedLabel);
    });
  });

  describe('view details', () => {
    it('should do nothing if there is no child data class selected', () => {
      harness.component.viewDetails();
      expect(stateRouterStub.navigateToKnownPath).not.toHaveBeenCalled();
    });

    it('should do nothing if the selected child data class has no parent', () => {
      harness.component.selected = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
      };

      harness.component.viewDetails();
      expect(stateRouterStub.navigateToKnownPath).not.toHaveBeenCalled();
    });

    it('should transition to the search results page when a selection is made', () => {
      harness.component.selected = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
        parentDataClass: '2',
        model: '3',
      };

      harness.component.viewDetails();
      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith(
        '/search/listing',
        {
          dm: harness.component.selected.model,
          dc: harness.component.selected.id,
          pdc: harness.component.selected.parentDataClass,
        }
      );
    });
  });

  describe('create request from data class', () => {
    const selected: DataClass = {
      id: '123',
      label: 'test class',
    } as DataClass;

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

    dataRequestsStub.createWithDialogs.mockImplementation(
      (): Observable<RequestCreatedAction> => {
        return of('view-requests');
      }
    );

    const routerSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

    beforeEach(() => {
      dataRequestsStub.createWithDialogs.mockClear();
      broadcastStub.loading.mockClear();
      toastrStub.error.mockClear();
      routerSpy.mockClear();

      dataModelStub.getDataElementsForDataClass.mockImplementationOnce((dc) => {
        expect(dc).toBe(selected);
        return of(dataElements);
      });

      harness.component.selected = selected;
    });

    it('should halt and display toastr message if there is no selected dataClass', () => {
      // arrange
      harness.component.selected = undefined;
      const spy = jest.spyOn(toastrStub, 'error');

      // act
      harness.component.createRequest();

      // assert
      expect(spy).toHaveBeenCalledWith(
        'You must have selected an element to create a request with.'
      );
    });

    it('should transition to requests page if RequestCreatedAction is \'view-requests\'', () => {
      // act
      harness.component.createRequest();

      // assert
      expect(routerSpy).toHaveBeenCalledWith('/requests');
    });

    it('should not transition to requests page if RequestCreatedAction is \'continue\'', () => {
      // arrange
      dataRequestsStub.createWithDialogs.mockImplementationOnce(
        (): Observable<RequestCreatedAction> => {
          return of('continue');
        }
      );

      // act
      harness.component.createRequest();

      // assert
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should use the provided callback function to retrieve the dataElements to add', () => {
      // arrange
      const createSpy = jest.spyOn(dataRequestsStub, 'createWithDialogs');
      const expectedDataElements = dataElements.map<DataElementInstance>((de) => {
        return {
          ...de,
          isBookmarked: false,
        } as DataElementInstance;
      });

      dataRequestsStub.createWithDialogs.mockImplementationOnce(
        (): Observable<RequestCreatedAction> => {
          return of('view-requests');
        }
      );

      // act
      harness.component.createRequest();

      // assert

      // Grab the callback method passed to createSpy and retrieve it's output to check its return value.
      // createSpy.mock.calls is an array containing the call arguments of all calls that have been made to this mock function.
      // Each item in the array is an array of arguments that were passed during the call. For example, createSpy.mock.calls[0][0]
      // gets the first argument of the first call to this mock function. In this case, this is the callback function used to retrieve
      // the Observable<DataElementBasic[]> containing the dataElements to be added to the new request.
      const call = createSpy.mock.calls[0];
      const callback = call[0];
      let returnedDataElements;
      callback().subscribe((items) => {
        returnedDataElements = items;
      });

      expect(returnedDataElements).toStrictEqual(expectedDataElements);
    });
  });
});
