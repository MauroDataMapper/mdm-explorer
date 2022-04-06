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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectionListChange } from '@angular/material/list';
import { CatalogueItemDomainType, DataElement } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import {
  DataRequest,
  DataRequestStatus,
} from 'src/app/data-explorer/data-explorer.types';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { createUserRequestsServiceStub } from 'src/app/testing/stubs/user-requests.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { MyRequestsComponent } from './my-requests.component';

describe('MyRequestsComponent', () => {
  let harness: ComponentHarness<MyRequestsComponent>;
  const securityStub = createSecurityServiceStub();
  const userRequestsStub = createUserRequestsServiceStub();
  const toastrStub = createToastrServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyRequestsComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: UserRequestsService,
          useValue: userRequestsStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.allRequests).toStrictEqual([]);
    expect(harness.component.filteredRequests).toStrictEqual([]);
    expect(harness.component.statusFilters).toStrictEqual([]);
    expect(harness.component.request).toBeUndefined();
    expect(harness.component.requestElements).toStrictEqual([]);
    expect(harness.component.state).toBe('idle');
  });

  describe('initialisation', () => {
    const user = { email: 'test@test.com' } as UserDetails;

    const mockSignedInUser = () => {
      securityStub.getSignedInUser.mockReturnValueOnce(user);
    };

    beforeEach(() => {
      userRequestsStub.list.mockClear();
      toastrStub.error.mockClear();
    });

    it('should do nothing if there is no user', () => {
      harness.component.ngOnInit();
      expect(userRequestsStub.list).not.toHaveBeenCalled();
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

      userRequestsStub.list.mockImplementationOnce((email) => {
        expect(email).toBe(user.email);
        expect(harness.component.state).toBe('loading');
        return of(requests);
      });

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(harness.component.allRequests).toStrictEqual(requests);
      expect(harness.component.filteredRequests).toStrictEqual(requests); // No filters yet
      expect(harness.component.request).toBe(requests[0]);
    });

    it('should display an error if failed to get requests', () => {
      mockSignedInUser();

      userRequestsStub.list.mockImplementationOnce(() => throwError(() => new Error()));

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.allRequests).toStrictEqual([]);
      expect(harness.component.filteredRequests).toStrictEqual([]);
      expect(harness.component.request).toBeUndefined();
    });

    it('should handle having no requests available', () => {
      mockSignedInUser();

      userRequestsStub.list.mockImplementationOnce((email) => {
        expect(email).toBe(user.email);
        expect(harness.component.state).toBe('loading');
        return of([]);
      });

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(harness.component.allRequests).toStrictEqual([]);
      expect(harness.component.filteredRequests).toStrictEqual([]); // No filters yet
      expect(harness.component.request).toBeUndefined();
    });
  });

  describe('select request', () => {
    beforeEach(() => {
      toastrStub.error.mockClear();
    });

    it('should do nothing if no request was selected', () => {
      const event = {
        options: [
          {
            value: undefined,
          },
        ],
      } as MatSelectionListChange;

      harness.component.selectRequest(event);

      expect(harness.component.state).toBe('idle');
      expect(harness.component.requestElements).toStrictEqual([]);
    });

    it('should select the chosen request', () => {
      const elements: DataElement[] = [
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

      const request = { id: '1', status: 'unsent' } as DataRequest;

      userRequestsStub.getRequestDataElements.mockImplementationOnce((req) => {
        expect(req).toStrictEqual(request);
        expect(harness.component.state).toBe('loading');
        return of(elements);
      });

      const event = {
        options: [
          {
            value: request,
          },
        ],
      } as MatSelectionListChange;

      harness.component.selectRequest(event);

      expect(harness.component.state).toBe('idle');
      expect(harness.component.requestElements).toStrictEqual(elements);
    });

    it('should display an error if request elements cannot be found', () => {
      const request = { id: '1', status: 'unsent' } as DataRequest;

      userRequestsStub.getRequestDataElements.mockImplementationOnce(() =>
        throwError(() => new Error())
      );

      const event = {
        options: [
          {
            value: request,
          },
        ],
      } as MatSelectionListChange;

      harness.component.selectRequest(event);

      expect(harness.component.state).toBe('idle');
      expect(toastrStub.error).toHaveBeenCalled();
      expect(harness.component.requestElements).toStrictEqual([]);
    });
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