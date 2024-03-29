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
import { ApiProperty } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';

import { ApiPropertiesService } from './api-properties.service';
import { MdmEndpointsService } from './mdm-endpoints.service';

describe('ApiPropertiesService', () => {
  let service: ApiPropertiesService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(ApiPropertiesService, {
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

  it('should return public api properties', () => {
    const properties: ApiProperty[] = [
      {
        key: 'key1',
        value: 'value1',
      },
      {
        key: 'key2',
        value: 'value2',
      },
    ];

    endpointsStub.apiProperties.listPublic.mockImplementationOnce(() =>
      cold('--a|', {
        a: {
          body: {
            count: properties.length,
            items: properties,
          },
        },
      })
    );

    const expected$ = cold('--a|', { a: properties });
    const actual$ = service.listPublic();
    expect(actual$).toBeObservable(expected$);
  });
});
