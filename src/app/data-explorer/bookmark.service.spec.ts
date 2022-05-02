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
import { setupTestModuleForService } from '../testing/testing.helpers';
import { BookmarkService } from './bookmark.service';
import { of } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { createSecurityServiceStub } from '../testing/stubs/security.stub';
import { SecurityService } from '../security/security.service';

describe('BookmarkService', () => {
  let service: BookmarkService;
  const endpointsStub = createMdmEndpointsStub();
  const securityServiceStub = createSecurityServiceStub();

  beforeEach(() => {
    // Default endpoint call
    endpointsStub.apiProperties.listPublic.mockImplementationOnce(() => of([]));

    service = setupTestModuleForService(BookmarkService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: SecurityService,
          useValue: securityServiceStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
