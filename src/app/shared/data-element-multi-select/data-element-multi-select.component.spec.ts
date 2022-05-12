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
import { DataElementMultiSelectComponent } from './data-element-multi-select.component';
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
import { SelectableDataElementSearchResult } from 'src/app/data-explorer/data-explorer.types';
import { CreateRequestDialogResponse } from 'src/app/data-explorer/create-request-dialog/create-request-dialog.component';
import { of } from 'rxjs';

describe('DataElementMultiSelectComponent', () => {
  let harness: ComponentHarness<DataElementMultiSelectComponent>;
  const dataModelsStub = createDataModelServiceStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const endpointsStub: MdmEndpointsServiceStub = createMdmEndpointsStub();
  const matDialogStub = createMatDialogStub();

  const user: UserDetails = {
    id: '123',
    firstName: 'test',
    lastName: 'user',
    email: 'test@test.com',
  };

  securityStub.getSignedInUser.mockImplementation(() => user);

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementMultiSelectComponent, {
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
      ],
    });
  });

  it('should create', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  describe('create request with several data elements', () => {
    const dataElement1: SelectableDataElementSearchResult = {
      id: '1',
      dataClassId: '2',
      dataModelId: '3',
      label: 'element 1',
      isSelected: true,
    };

    const dataElement2: SelectableDataElementSearchResult = {
      id: '2',
      dataClassId: '2',
      dataModelId: '3',
      label: 'element 2',
      isSelected: true,
    };

    beforeEach(() => {
      dataRequestsStub.createFromDataElements.mockClear();
    });

    it('should create a new request', () => {
      const requestCreation: CreateRequestDialogResponse = {
        name: 'test request',
        description: 'test description',
      };

      matDialogStub.usage.afterClosed.mockImplementationOnce(() => of(requestCreation));

      harness.component.createRequest([dataElement1, dataElement2]);

      expect(dataRequestsStub.createFromDataElements).toHaveBeenCalledWith(
        [dataElement1, dataElement2],
        user,
        requestCreation.name,
        requestCreation.description
      );
    });
  });
});
