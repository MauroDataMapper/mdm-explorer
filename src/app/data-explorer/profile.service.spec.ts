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
import { CatalogueItemDomainType, Profile } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(ProfileService, {
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

  describe('get profile', () => {
    it('should get a profile for a data element', () => {
      const expectedProfile: Profile = {
        id: '1',
        label: 'test profild',
        domainType: CatalogueItemDomainType.DataElement,
        sections: [],
      };

      endpointsStub.profile.profile.mockImplementationOnce(
        (domainType, id, namespace, name) => {
          expect(domainType).toBe(CatalogueItemDomainType.DataElement);
          expect(id).toBe('1');
          expect(namespace).toBe('namespace');
          expect(name).toBe('name');
          return cold('--a|', {
            a: {
              body: expectedProfile,
            },
          });
        }
      );

      const expected$ = cold('--a|', { a: expectedProfile });
      const actual$ = service.get(
        CatalogueItemDomainType.DataElement,
        '1',
        'namespace',
        'name'
      );
      expect(actual$).toBeObservable(expected$);
    });
  });
});
