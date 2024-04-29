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
import { CatalogueItemDomainType, DataModelDetail } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { MdmEndpointsService } from './mdm-endpoints.service';
import { PluginResearchContactPayload } from './plugins/plugin-research.resource';

import { ResearchPluginService } from './research-plugin.service';

describe('ResearchPluginService', () => {
  let service: ResearchPluginService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(ResearchPluginService, {
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

  it('should send a contact form', () => {
    const form: PluginResearchContactPayload = {
      firstName: 'test',
      lastName: 'person',
      emailAddress: 'test@test.com',
      organisation: 'test org',
      subject: 'testing',
      message: 'this is a test message',
    };

    endpointsStub.pluginResearch.contact.mockImplementationOnce((data) => {
      expect(data).toBe(form);
      return cold('-a|', { a: { body: data } });
    });

    const expected$ = cold('-a|', { a: form });
    const actual$ = service.contact(form);
    expect(actual$).toBeObservable(expected$);
  });

  it('should submit a data specification', () => {
    const id = '123';
    const dataModel: DataModelDetail = {
      id,
      label: 'test data specification',
      domainType: CatalogueItemDomainType.DataModel,
      availableActions: ['show'],
      finalised: true,
    };

    endpointsStub.pluginResearch.submitDataSpecification.mockImplementationOnce(
      (ident) => {
        expect(ident).toBe(id);
        return cold('--a|', { a: { body: {} } });
      }
    );

    endpointsStub.dataModel.get.mockImplementationOnce((ident) => {
      expect(ident).toBe(id);
      return cold('--a|', { a: { body: dataModel } });
    });

    const expected$ = cold('----a|', { a: dataModel });
    const actual$ = service.finaliseDataSpecification(id);
    expect(actual$).toBeObservable(expected$);
  });
});
