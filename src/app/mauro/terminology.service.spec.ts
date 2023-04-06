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
import {
  CatalogueItemDomainType,
  TerminologyDetail,
  FilterQueryParameters,
  MdmIndexBody,
  Term,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { MdmEndpointsService } from './mdm-endpoints.service';

import { TerminologyService } from './terminology.service';

describe('TerminologyService', () => {
  let service: TerminologyService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(TerminologyService, {
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

  describe('get model', () => {
    const id = '123';

    it('should get a terminology', () => {
      const expectedModel: TerminologyDetail = {
        id,
        label: 'test model',
        domainType: CatalogueItemDomainType.Terminology,
        availableActions: ['show'],
        finalised: true,
      };

      endpointsStub.terminology.get.mockImplementationOnce((mId) => {
        expect(mId).toBe(id);
        return cold('--a|', {
          a: {
            body: expectedModel,
          },
        });
      });

      const expected$ = cold('--a|', { a: expectedModel });
      const actual$ = service.getModel(id, CatalogueItemDomainType.Terminology);
      expect(actual$).toBeObservable(expected$);
    });

    it('should get a codeset', () => {
      const expectedModel: TerminologyDetail = {
        id,
        label: 'test model',
        domainType: CatalogueItemDomainType.CodeSet,
        availableActions: ['show'],
        finalised: true,
      };

      endpointsStub.codeSet.get.mockImplementationOnce((mId) => {
        expect(mId).toBe(id);
        return cold('--a|', {
          a: {
            body: expectedModel,
          },
        });
      });

      const expected$ = cold('--a|', { a: expectedModel });
      const actual$ = service.getModel(id, CatalogueItemDomainType.CodeSet);
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('list terms', () => {
    const id: Uuid = '1234';
    const query: FilterQueryParameters = {
      max: 20,
      sort: 'label',
    };

    const terms: MdmIndexBody<Term> = {
      count: 10,
      items: [
        {
          id: '1',
          domainType: CatalogueItemDomainType.Term,
          definition: 'def 1',
          code: 'code 1',
        },
        {
          id: '2',
          domainType: CatalogueItemDomainType.Term,
          definition: 'def 2',
          code: 'code 2',
        },
      ],
    };

    it('should return terms for a terminology', () => {
      endpointsStub.term.list.mockImplementationOnce((mId, qry) => {
        expect(mId).toBe(id);
        expect(qry).toBe(query);
        return cold('--a|', {
          a: {
            body: terms,
          },
        });
      });

      const expected$ = cold('--a|', { a: terms });
      const actual$ = service.listTerms(id, CatalogueItemDomainType.Terminology, query);
      expect(actual$).toBeObservable(expected$);
    });

    it('should return terms for a code set', () => {
      endpointsStub.codeSet.terms.mockImplementationOnce((mId, qry) => {
        expect(mId).toBe(id);
        expect(qry).toBe(query);
        return cold('--a|', {
          a: {
            body: terms,
          },
        });
      });

      const expected$ = cold('--a|', { a: terms });
      const actual$ = service.listTerms(id, CatalogueItemDomainType.CodeSet, query);
      expect(actual$).toBeObservable(expected$);
    });
  });
});
