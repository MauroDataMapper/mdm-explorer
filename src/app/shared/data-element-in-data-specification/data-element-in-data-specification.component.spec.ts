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
import { MockComponent, MockService } from 'ng-mocks';
import { MatMenu } from '@angular/material/menu';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { DataElementInDataSpecificationComponent } from './data-element-in-data-specification.component';
import { MdmEndpointsService } from '../../mauro/mdm-endpoints.service';
import { SecurityService } from '../../security/security.service';
import { StateRouterService } from '../../core/state-router.service';
import { DataModelService } from '../../mauro/data-model.service';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { createDataModelServiceStub } from '../../testing/stubs/data-model.stub';
import { createDataSpecificationServiceStub } from '../../testing/stubs/data-specifications.stub';
import { createSecurityServiceStub } from '../../testing/stubs/security.stub';
import { createStateRouterStub } from '../../testing/stubs/state-router.stub';
import { createMatDialogStub } from '../../testing/stubs/mat-dialog.stub';

import {
  createMdmEndpointsStub,
  MdmEndpointsServiceStub,
} from '../../testing/stubs/mdm-endpoints.stub';
import { MatDialog } from '@angular/material/dialog';
import { UserDetails } from '../../security/user-details.service';
import { createBroadcastServiceStub } from '../../testing/stubs/broadcast.stub';
import { BroadcastService } from '../../core/broadcast.service';
import { MatDivider } from '@angular/material/divider';

describe('DataElementInDataSpecificationComponent', () => {
  let harness: ComponentHarness<DataElementInDataSpecificationComponent>;
  const dataModelsStub = createDataModelServiceStub();
  const dataSpecificationStub = createDataSpecificationServiceStub();
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
    harness = await setupTestModuleForComponent(DataElementInDataSpecificationComponent, {
      declarations: [MockComponent(MatMenu), MockComponent(MatDivider)],
      providers: [
        {
          provide: MatDialog,
          useValue: MockService(MatDialog),
        },
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
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
  /*

  NOTE:
  The tests need to be reviewed based on the new functionality. Some of these
  may no longer be releavant, and additional tests will be required.
  gh-244 has been raised to carry out this task.

  describe('creating data specifications', () => {
    const dataElement: DataElementSearchResult = {
      id: '1',
      dataClass: '2',
      model: '3',
      label: 'element 1',
      isBookmarked: false,
      isSelected: false,
    };

    const event: CreateDataSpecificationEvent = {
      item: dataElement,
    };

    const routerSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

    beforeEach(() => {
      dataSpecificationStub.createWithDialogs.mockClear();
      broadcastStub.loading.mockClear();
      routerSpy.mockClear();
    });

    it('should not call create data specification if there are no data elements', () => {
      harness.component.dataElement = undefined;
      const spy = jest.spyOn(harness.component, 'createDataSpecification');

      harness.component.onClickCreateDataSpecification();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should transition to data specifications page if DataSpecificationCreatedAction is \'view-data-specifications\'', () => {
      // arrange
      dataSpecificationStub.createWithDialogs.mockImplementationOnce(
        (): Observable<DataSpecificationCreatedAction> => {
          return of('view-data-specifications');
        }
      );

      // act
      harness.component.createDataSpecification(event);

      // assert
      expect(routerSpy).toHaveBeenCalledWith('/dataSpecifications');
    });

    it('should not transition to data specifications page if DataSpecificationCreatedAction is \'continue\'', () => {
      // arrange
      dataSpecificationStub.createWithDialogs.mockImplementationOnce(
        (): Observable<DataSpecificationCreatedAction> => {
          return of('continue');
        }
      );

      // act
      harness.component.createDataSpecification(event);

      // assert
      expect(routerSpy).not.toHaveBeenCalled();
    });

    it('should use the provided callback function to retrieve the dataElements to add', () => {
      // arrange
      const createSpy = jest.spyOn(dataSpecificationStub, 'createWithDialogs');
      const callbackReturnValue = [event.item];

      dataSpecificationStub.createWithDialogs.mockImplementationOnce(
        (): Observable<DataSpecificationCreatedAction> => {
          return of('view-data-specifications');
        }
      );

      // act
      harness.component.createDataSpecification(event);

      // assert

      // Grab the callback method passed to createSpy and retrieve it's output to check its return value.
      // createSpy.mock.calls is an array containing the call arguments of all calls that have been made to this mock function.
      // Each item in the array is an array of arguments that were passed during the call. For example, createSpy.mock.calls[0][0]
      // gets the first argument of the first call to this mock function. In this case, this is the callback function used to retrieve
      // the Observable<DataElementBasic[]> containing the dataElements to be added to the new data specification.
      const call = createSpy.mock.calls[0];
      const callback = call[0];
      let returnedDataElements;
      callback().subscribe((items) => {
        returnedDataElements = items;
      });

      expect(returnedDataElements).toStrictEqual(callbackReturnValue);
    });

    it('should emit event when create data specification button is clicked', () => {
      // Create html dom
      harness.detectChanges();
      const dom = harness.fixture.debugElement;

      // find 'create data specification' button, being the button that doesn't have the caption as the label
      const button = dom.query(
        (element) =>
          element.name === 'button' &&
          element.nativeElement.innerHTML.indexOf(harness.component.caption) === -1
      );

      // Setup the required mocks and values
      const emitSpy = jest.spyOn(harness.component.createDataSpecificationClicked, 'emit');
      dataSpecificationStub.createWithDialogs.mockClear();
      dataSpecificationStub.createWithDialogs.mockReturnValue(of('continue'));
      harness.component.dataElement = dataElement;

      // fake a click event on the button
      button.triggerEventHandler('click', event);

      // check the result
      expect(emitSpy).toHaveBeenCalledWith(event);
    });
  });
  */
});
