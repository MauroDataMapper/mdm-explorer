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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  DataRequest,
  DataRequestStatus,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { ResearchPluginService } from 'src/app/mauro/research-plugin.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
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
import { MyRequestsComponent } from './my-requests.component';

describe('MyRequestsComponent', () => {
  let harness: ComponentHarness<MyRequestsComponent>;
  const securityStub = createSecurityServiceStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const toastrStub = createToastrServiceStub();
  const researchPluginStub = createResearchPluginServiceStub();
  const dialogsStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const explorerStub = createDataExplorerServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyRequestsComponent, {
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
      ],
    });
  });

  const user = { email: 'test@test.com' } as UserDetails;

  const mockSignedInUser = () => {
    securityStub.getSignedInUser.mockReturnValueOnce(user);
  };

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.allRequests).toStrictEqual([]);
    expect(harness.component.filteredRequests).toStrictEqual([]);
    expect(harness.component.statusFilters).toStrictEqual([]);
    expect(harness.component.requestElements).toStrictEqual([]);
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
  });

  it('should display all requests available to a user', () => {
    const requests: DataRequest[] = [
      {
        id: '1',
        label: 'request 1',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      },
      {
        id: '2',
        label: 'request 2',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      },
    ];

    mockSignedInUser();

    dataRequestsStub.list.mockImplementationOnce(() => {
      expect(harness.component.state).toBe('loading');
      return of(requests);
    });

    harness.component.ngOnInit();

    expect(harness.component.state).toBe('idle');
    expect(harness.component.allRequests).toStrictEqual(requests);
    expect(harness.component.filteredRequests).toStrictEqual(requests); // No filters yet
  });

  it('should display an error if failed to get requests', () => {
    mockSignedInUser();

    dataRequestsStub.list.mockImplementationOnce(() => throwError(() => new Error()));

    harness.component.ngOnInit();

    expect(harness.component.state).toBe('idle');
    expect(toastrStub.error).toHaveBeenCalled();
    expect(harness.component.allRequests).toStrictEqual([]);
    expect(harness.component.filteredRequests).toStrictEqual([]);
  });

  it('should handle having no requests available', () => {
    mockSignedInUser();

    dataRequestsStub.list.mockImplementationOnce(() => {
      expect(harness.component.state).toBe('loading');
      return of([]);
    });

    harness.component.ngOnInit();

    expect(harness.component.state).toBe('idle');
    expect(harness.component.allRequests).toStrictEqual([]);
    expect(harness.component.filteredRequests).toStrictEqual([]); // No filters yet
  });

  describe('filter by status', () => {
    const requests: DataRequest[] = [
      {
        id: '1',
        label: 'request 1',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      },
      {
        id: '2',
        label: 'request 2',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      },
      {
        id: '3',
        label: 'request 3',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'submitted',
      },
    ];

    beforeEach(() => {
      harness.component.allRequests = requests;
    });

    it('should display all requests if no filters are set', () => {
      const event = {
        source: { value: 'unsent' },
        checked: false,
      } as MatCheckboxChange;

      harness.component.filterByStatus(event);

      expect(harness.component.statusFilters).toStrictEqual([]);
      expect(harness.component.filteredRequests).toStrictEqual(requests);
    });

    it.each<DataRequestStatus>(['unsent', 'submitted'])(
      'should display only requests of status %p',
      (status) => {
        const event = {
          source: { value: status },
          checked: true,
        } as MatCheckboxChange;

        harness.component.filterByStatus(event);

        expect(harness.component.statusFilters).toStrictEqual([status]);
        expect(harness.component.filteredRequests).toStrictEqual(
          requests.filter((r) => r.status === status)
        );
      }
    );

    it.each<DataRequestStatus>(['unsent', 'submitted'])(
      'should include more requests when status %p is removed',
      (status) => {
        harness.component.statusFilters = [status];
        harness.component.filteredRequests = requests.filter((r) => r.status === status);

        const event = {
          source: { value: status },
          checked: false,
        } as MatCheckboxChange;

        harness.component.filterByStatus(event);

        expect(harness.component.statusFilters).toStrictEqual([]);
        expect(harness.component.filteredRequests).toStrictEqual(requests);
      }
    );
  });
});
