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
import { DataModel } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let harness: ComponentHarness<DashboardComponent>;
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const toastrStub = createToastrServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DashboardComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
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
  });

  describe('initialisation', () => {
    it('should transition to home page if user not logged in', () => {
      const spy = jest.spyOn(stateRouterStub, 'navigateToKnownPath');

      securityStub.getSignedInUser.mockImplementationOnce(() => {
        return null;
      });

      harness.component.ngOnInit();

      expect(spy).toHaveBeenCalledWith('/home');
    });

    it('should initialize the currentUserRequests list upon successful retrieval of requests', () => {
      securityStub.getSignedInUser.mockImplementationOnce(() => {
        return { email: 'email' } as UserDetails;
      });

      const openRequests = [
        { label: 'dataModel-1' },
        { label: 'dataModel-2' },
      ] as DataModel[];

      dataRequestsStub.list.mockImplementationOnce(() => {
        return of(openRequests);
      });

      harness.component.ngOnInit();

      expect(harness.component.currentUserRequests).toEqual(openRequests);
    });
  });

  describe('loadRequests', () => {
    it('should raise a toastr message if something goes wrong and not set currentUserRequests', () => {
      const spy = jest.spyOn(toastrStub, 'error');
      const username = 'username';

      dataRequestsStub.list.mockImplementationOnce(() => {
        return throwError(() => {});
      });

      harness.component.loadRequests(username);

      expect(spy).toHaveBeenCalledWith(
        'Unable to retrieve your current requests from the server.'
      );
      expect(harness.component.currentUserRequests).toEqual([]);
    });
  });

  describe('search', () => {
    it('should transition to the search-listing page with the appropriate search payload', () => {
      const searchTerms = 'test search terms';
      const expectedPayload = { search: searchTerms };

      harness.component.searchTerms = searchTerms;
      harness.component.search();

      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith(
        '/search/listing',
        expectedPayload
      );
    });
  });
});
