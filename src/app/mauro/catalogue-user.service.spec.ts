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
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import {
  CatalogueUser,
  CatalogueUserPayload,
  CatalogueUserService,
  ChangePasswordPayload,
} from './catalogue-user.service';

describe('CatalogueUserService', () => {
  let service: CatalogueUserService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(CatalogueUserService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get a catalogue user', () => {
    const userId = '123';

    const expectedUser: CatalogueUser = {
      id: userId,
      emailAddress: 'test@test.com',
      firstName: 'test',
      lastName: 'test',
      organisation: 'test org',
      jobTitle: 'tester',
    };

    endpointsStub.catalogueUser.get.mockImplementationOnce((id) => {
      expect(id).toBe(userId);
      return cold('--a|', {
        a: {
          body: expectedUser,
        },
      });
    });

    const expected$ = cold('--a|', { a: expectedUser });
    const actual$ = service.get(userId);
    expect(actual$).toBeObservable(expected$);
  });

  it('should update a catalogue user', () => {
    const userId = '123';
    const payload: CatalogueUserPayload = {
      firstName: 'test',
      lastName: 'test',
      organisation: 'test org',
      jobTitle: 'tester',
    };
    const expectedUser: CatalogueUser = {
      id: userId,
      emailAddress: 'test@test.com',
      ...payload,
    };

    endpointsStub.catalogueUser.update.mockImplementationOnce((id, pl) => {
      expect(id).toBe(userId);
      expect(pl).toBe(payload);
      return cold('--a|', {
        a: {
          body: expectedUser,
        },
      });
    });

    const expected$ = cold('--a|', { a: expectedUser });
    const actual$ = service.update(userId, payload);
    expect(actual$).toBeObservable(expected$);
  });

  it('should change a user password', () => {
    const id = '123';
    const payload: ChangePasswordPayload = {
      oldPassword: 'old-password',
      newPassword: 'new-password',
    };

    const expectedUser: CatalogueUser = {
      id,
      emailAddress: 'test@test.com',
    };

    endpointsStub.catalogueUser.changePassword.mockImplementationOnce((i, pl) => {
      expect(i).toBe(id);
      expect(pl).toBe(payload);
      return cold('--a|', {
        a: {
          body: expectedUser,
        },
      });
    });

    const expected$ = cold('--a|', {
      a: expectedUser,
    });
    const actual$ = service.changePassword(id, payload);
    expect(actual$).toBeObservable(expected$);
  });
});
