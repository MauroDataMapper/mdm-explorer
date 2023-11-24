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
import { of } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { FeaturesService } from './features.service';

describe('FeaturesService', () => {
  let service: FeaturesService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    // Default endpoint call
    endpointsStub.apiProperties.listPublic.mockImplementationOnce(() => of([]));

    service = setupTestModuleForService(FeaturesService, {
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

  it.each([
    ['feature.use_open_id_connect', true, (s: FeaturesService) => s.useOpenIdConnect],
  ])('should set feature toggle according to api property', (name, state, accessor) => {
    const apiProperty: ApiProperty = {
      key: name,
      value: JSON.stringify(state),
      category: 'Features',
    };

    endpointsStub.apiProperties.listPublic.mockClear();
    endpointsStub.apiProperties.listPublic.mockImplementationOnce(() =>
      of({
        count: 1,
        items: [apiProperty],
      }),
    );

    service.loadFromServer();
    expect(accessor(service)).toBe(state);
  });
});
