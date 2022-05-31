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
import { MockComponent } from 'ng-mocks';
import { MatMenu } from '@angular/material/menu';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import {
  CreateRequestEvent,
  DataElementInRequestComponent,
} from './data-element-in-request.component';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import { SecurityService } from 'src/app/security/security.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';

import {
  createMdmEndpointsStub,
  MdmEndpointsServiceStub,
} from 'src/app/testing/stubs/mdm-endpoints.stub';
import { MatDialog } from '@angular/material/dialog';
import { UserDetails } from 'src/app/security/user-details.service';
import { DataElementSearchResult } from 'src/app/data-explorer/data-explorer.types';
import { Observable, of } from 'rxjs';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { RequestCreatedAction } from 'src/app/data-explorer/request-created-dialog/request-created-dialog.component';

describe('DataElementInRequestComponent', () => {
  let harness: ComponentHarness<DataElementInRequestComponent>;
  const dataModelsStub = createDataModelServiceStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const endpointsStub: MdmEndpointsServiceStub = createMdmEndpointsStub();
  const matDialogStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();

  const user: UserDetails = {
    id: '123',
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
  };

  securityStub.getSignedInUser.mockImplementation(() => user);

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementInRequestComponent, {
      declarations: [MockComponent(MatMenu), MockComponent(MatDialog)],
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
        },
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  describe('creating requests', () => {
    const dataElement: DataElementSearchResult = {
      id: '1',
      dataClass: '2',
      model: '3',
      label: 'element 1',
      isBookmarked: false,
    };

    const event: CreateRequestEvent = {
      item: dataElement,
    };

    const routerSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

    beforeEach(() => {
      dataRequestsStub.createWithDialogs.mockClear();
      broadcastStub.loading.mockClear();
      routerSpy.mockClear();
    });

    it('should not call create request if there are no data elements', () => {
      harness.component.dataElement = undefined;
      const spy = jest.spyOn(harness.component, 'createRequest');

      harness.component.onClickCreateRequest();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should transition to requests page if RequestCreatedAction is 'view-requests'", () => {
      // arrange
      dataRequestsStub.createWithDialogs.mockImplementationOnce(
        (): Observable<RequestCreatedAction> => {
          return of('view-requests');
        }
      );

      // act
      harness.component.createRequest(event);

      // assert
      expect(routerSpy).toHaveBeenCalledWith('/requests');
    });

    it("should not transition to requests page if RequestCreatedAction is 'continue'", () => {
      // arrange
      dataRequestsStub.createWithDialogs.mockImplementationOnce(
        (): Observable<RequestCreatedAction> => {
          return of('continue');
        }
      );

      // act
      harness.component.createRequest(event);

      // assert
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should use the provided callback function to retrieve the dataElements to add', () => {
      // arrange
      const createSpy = jest.spyOn(dataRequestsStub, 'createWithDialogs');
      const callbackReturnValue = [event.item];

      dataRequestsStub.createWithDialogs.mockImplementationOnce(
        (): Observable<RequestCreatedAction> => {
          return of('view-requests');
        }
      );

      // act
      harness.component.createRequest(event);

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

      expect(returnedDataElements).toStrictEqual(callbackReturnValue);
    });

    it('should emit event when create request button is clicked', () => {
      // Create html dom
      harness.detectChanges();
      const dom = harness.fixture.debugElement;

      // find 'create request' button, being the button that doesn't have the caption as the label
      const button = dom.query(
        (element) =>
          element.name === 'button' &&
          element.nativeElement.innerHTML.indexOf(harness.component.caption) === -1
      );

      // Setup the required mocks and values
      const emitSpy = jest.spyOn(harness.component.createRequestClicked, 'emit');
      dataRequestsStub.createWithDialogs.mockClear();
      dataRequestsStub.createWithDialogs.mockReturnValue(of('continue'));
      harness.component.dataElement = dataElement;

      // fake a click event on the button
      button.triggerEventHandler('click', event);

      // check the result
      expect(emitSpy).toHaveBeenCalledWith(event);
    });
  });
});
