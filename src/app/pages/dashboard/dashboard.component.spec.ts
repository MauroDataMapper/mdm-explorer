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
import { MockComponent } from 'ng-mocks';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { ToastrService } from 'ngx-toastr';
import { Carousel } from 'primeng/carousel';
import { of, throwError } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataSpecification } from 'src/app/data-explorer/data-explorer.types';
import { DataSpecificationService } from 'src/app/data-explorer/data-specification.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { createDataSpecificationServiceStub } from 'src/app/testing/stubs/data-specifications.stub';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { ComponentHarness, setupTestModuleForComponent } from 'src/app/testing/testing.helpers';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let harness: ComponentHarness<DashboardComponent>;
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const dataSpecificationStub = createDataSpecificationServiceStub();
  const toastrStub = createToastrServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DashboardComponent, {
      declarations: [MockComponent(Carousel), MockComponent(MatFormField), MockComponent(MatIcon)],
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
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
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

    it('should initialize the currentUserDataSpecifications list upon successful retrieval of data specifications', () => {
      securityStub.getSignedInUser.mockImplementationOnce(() => {
        return { email: 'email' } as UserDetails;
      });

      const openDataSpecifications = [
        { label: 'dataModel-1', status: 'draft' },
        { label: 'dataModel-2', status: 'draft' },
        { label: 'dataModel-3', status: 'finalised' },
      ] as DataSpecification[];

      dataSpecificationStub.list.mockImplementationOnce(() => {
        return of(openDataSpecifications);
      });

      harness.component.ngOnInit();

      const expected = openDataSpecifications.filter((r) => r.status === 'draft');
      expect(harness.component.currentUserDataSpecifications).toEqual(expected);
    });
  });

  describe('loadDataSpecifications', () => {
    it('should raise a toastr message if something goes wrong and not set currentUserDataSpecifications', () => {
      const spy = jest.spyOn(toastrStub, 'error');

      dataSpecificationStub.list.mockImplementationOnce(() => {
        return throwError(() => {});
      });

      harness.component.loadDataSpecifications();

      expect(spy).toHaveBeenCalledWith(
        'Unable to retrieve your current data specifications from the server.'
      );
      expect(harness.component.currentUserDataSpecifications).toEqual([]);
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      stateRouterStub.navigateToKnownPath.mockClear();
    });

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
