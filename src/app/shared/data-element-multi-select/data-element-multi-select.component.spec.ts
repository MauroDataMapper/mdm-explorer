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
import { DataElementMultiSelectComponent } from './data-element-multi-select.component';
import { SecurityService } from 'src/app/security/security.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { DataSpecificationService } from 'src/app/data-explorer/data-specification.service';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createDataSpecificationServiceStub } from 'src/app/testing/stubs/data-specifications.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';

import { MatDialog } from '@angular/material/dialog';
import { UserDetails } from 'src/app/security/user-details.service';
import {
  DataElementSearchResult,
  DataSpecification,
} from 'src/app/data-explorer/data-explorer.types';
import { of } from 'rxjs';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { ToastrService } from 'ngx-toastr';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { CatalogueItemDomainType, DataModel } from '@maurodatamapper/mdm-resources';
import { createMdmEndpointsStub } from 'src/app/testing/stubs/mdm-endpoints.stub';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';

describe('DataElementMultiSelectComponent', () => {
  let harness: ComponentHarness<DataElementMultiSelectComponent>;
  const dataModelsStub = createDataModelServiceStub();
  const dataSpecificationStub = createDataSpecificationServiceStub();
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const matDialogStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const toastrStub = createToastrServiceStub();
  const endpointsStub = createMdmEndpointsStub();

  const user: UserDetails = {
    id: '123',
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
  };

  securityStub.getSignedInUser.mockImplementation(() => user);

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementMultiSelectComponent, {
      declarations: [MockComponent(MatMenu)],
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
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  describe('creating data specifications', () => {
    const dataElement1: DataElementSearchResult = {
      id: '1',
      dataClass: '2',
      model: '3',
      label: 'element 1',
      isSelected: true,
      isBookmarked: false,
    };

    const dataElement2: DataElementSearchResult = {
      id: '2',
      dataClass: '2',
      model: '3',
      label: 'element 2',
      isSelected: true,
      isBookmarked: false,
    };

    const dataElements = [dataElement1, dataElement2];

    const dataSpecification = { id: '999' } as DataSpecification;

    const navigateKnownSpy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');
    const navigateToSpy = jest.spyOn(stateRouterStub, 'navigateTo');

    beforeEach(() => {
      dataSpecificationStub.createWithDialogs.mockClear();
      broadcastStub.loading.mockClear();
      navigateKnownSpy.mockClear();
    });

    it('should not call create data specification if there are no data elements', () => {
      harness.component.dataElements = [];
      const spy = jest.spyOn(harness.component, 'createDataSpecification');

      harness.component.onClickCreateDataSpecification();

      expect(spy).not.toHaveBeenCalled();
    });

    it("should transition to data specifications page if DataSpecificationCreatedAction is 'view-data-specifications'", () => {
      // arrange
      dataSpecificationStub.createWithDialogs.mockImplementationOnce(() => {
        return of({
          dataSpecification,
          action: 'view-data-specifications',
        });
      });

      // act
      harness.component.createDataSpecification(dataElements);

      // assert
      expect(navigateKnownSpy).toHaveBeenCalledWith('/dataSpecifications');
    });

    it("should transition to data specification detail page if DataSpecificationCreatedAction is 'view-data-specification-detail'", () => {
      // arrange
      dataSpecificationStub.createWithDialogs.mockImplementationOnce(() => {
        return of({
          dataSpecification,
          action: 'view-data-specification-detail',
        });
      });

      // act
      harness.component.createDataSpecification(dataElements);

      // assert
      expect(navigateToSpy).toHaveBeenCalledWith([
        '/dataSpecifications',
        dataSpecification.id,
      ]);
    });

    it("should not transition to data specifications page if DataSpecificationCreatedAction is 'continue'", () => {
      // arrange
      dataSpecificationStub.createWithDialogs.mockImplementationOnce(() => {
        return of({
          dataSpecification,
          action: 'continue',
        });
      });

      // act
      harness.component.createDataSpecification(dataElements);

      // assert
      expect(navigateKnownSpy).not.toHaveBeenCalled();
    });

    it('should use the provided callback function to retrieve the dataElements to add', () => {
      // arrange
      const createSpy = jest.spyOn(dataSpecificationStub, 'createWithDialogs');

      dataSpecificationStub.createWithDialogs.mockImplementationOnce(() => {
        return of({
          dataSpecification,
          action: 'view-data-specifications',
        });
      });

      // act
      harness.component.createDataSpecification(dataElements);

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

      expect(returnedDataElements).toStrictEqual(dataElements);
    });
  });

  describe('add to existing data specifications', () => {
    beforeEach(() => {
      broadcastStub.dispatch.mockClear();
      broadcastStub.loading.mockClear();
    });

    it('should add expected data elements to a data specification', () => {
      const sourceDataModelId = '123';
      const targetDataModelId = '456';

      const dataElements: DataElementSearchResult[] = [...Array(10).keys()].map((i) => {
        return {
          id: i.toString(),
          model: sourceDataModelId,
          dataClass: '2',
          label: `element ${i}`,
          isBookmarked: false,
          isSelected: true,
        };
      });

      harness.component.dataElements = dataElements;

      const dataSpecification: DataModel = {
        id: targetDataModelId,
        label: 'data specification',
        domainType: CatalogueItemDomainType.DataModel,
      };

      dataModelsStub.copySubset.mockImplementationOnce((sId, tId, pl) => {
        expect(sId).toBe(sourceDataModelId);
        expect(tId).toBe(targetDataModelId);
        expect(pl).toStrictEqual({
          additions: dataElements.map((de) => de.id),
          deletions: [],
        });
        return of({ ...dataSpecification, availableActions: [], finalised: false });
      });

      harness.component.onClickAddSelectedToDataSpecification(dataSpecification);

      expect(broadcastStub.dispatch).toHaveBeenCalledWith('data-specification-added');
      expect(broadcastStub.loading).toHaveBeenCalledWith({
        isLoading: true,
        caption: 'Updating your data specification...',
      });
      expect(broadcastStub.loading).toHaveBeenCalledWith({ isLoading: false });
    });
  });
});
