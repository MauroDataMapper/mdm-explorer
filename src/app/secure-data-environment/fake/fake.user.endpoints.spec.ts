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
import { SdeEndpointsService } from '../sde-endpoints.service';
import { cold } from 'jest-marbles';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { TestBed } from '@angular/core/testing';
import { FakeResources } from './fake-resources';

describe('UserEndPoints', () => {
  let sdeEndpointsService: SdeEndpointsService;
  let fakeResources: FakeResources;

  beforeEach(() => {
    sdeEndpointsService = setupTestModuleForService(SdeEndpointsService, {});
    fakeResources = TestBed.inject(FakeResources);
  });

  it('should get an admin user', () => {
    const expectedAdminUser = fakeResources.adminUsers[0];

    const actualAdminUser = sdeEndpointsService.user.getAdminUser(
      fakeResources.adminUsers[0].id
    );

    const expected = cold('(a|)', { a: expectedAdminUser });
    expect(actualAdminUser).toBeObservable(expected);
  });

  it('should get a research user', () => {
    const expectedAdminUser = fakeResources.adminUsers[0];

    const actualAdminUser = sdeEndpointsService.user.getAdminUser(
      fakeResources.adminUsers[0].id
    );

    const expected = cold('(a|)', { a: expectedAdminUser });
    expect(actualAdminUser).toBeObservable(expected);
  });
});
