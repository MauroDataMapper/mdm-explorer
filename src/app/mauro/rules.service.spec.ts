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
  Rule,
  RuleDomainType,
  RulePayload,
  RuleRepresentation,
  RuleRepresentationPayload,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { MdmEndpointsService } from './mdm-endpoints.service';
import { RulesService } from './rules.service';

describe('RulesService', () => {
  let service: RulesService;
  const endpointsStub = createMdmEndpointsStub();

  const domainType: RuleDomainType = 'dataModels';
  const itemId: Uuid = '1234';

  beforeEach(() => {
    service = setupTestModuleForService(RulesService, {
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

  it('should list rules for an item', () => {
    const rules: Rule[] = [
      {
        id: '1',
        name: 'rule 1',
        ruleRepresentations: [],
      },
      {
        id: '2',
        name: 'rule 2',
        ruleRepresentations: [],
      },
    ];

    endpointsStub.catalogueItem.listRules.mockImplementationOnce((dt, id) => {
      expect(dt).toBe(domainType);
      expect(id).toBe(itemId);
      return cold('--a|', {
        a: {
          body: {
            items: rules,
          },
        },
      });
    });

    const expected$ = cold('--a|', { a: rules });
    const actual$ = service.list(domainType, itemId);
    expect(actual$).toBeObservable(expected$);
  });

  it('should get a rule for an item', () => {
    const rule: Rule = {
      id: '567',
      name: 'test',
      ruleRepresentations: [],
    };

    endpointsStub.catalogueItem.getRule.mockImplementationOnce((dt, id, rid) => {
      expect(dt).toBe(domainType);
      expect(id).toBe(itemId);
      expect(rid).toBe(rule.id);
      return cold('--a|', { a: { body: rule } });
    });

    const expected$ = cold('--a|', { a: rule });
    const actual$ = service.get(domainType, itemId, rule.id);
    expect(actual$).toBeObservable(expected$);
  });

  it('should create a rule for an item', () => {
    const payload: RulePayload = {
      name: 'test',
    };

    const rule: Rule = {
      id: '567',
      ...payload,
      ruleRepresentations: [],
    };

    endpointsStub.catalogueItem.saveRule.mockImplementationOnce((dt, id, pl) => {
      expect(dt).toBe(domainType);
      expect(id).toBe(itemId);
      expect(pl).toBe(payload);
      return cold('--a|', { a: { body: rule } });
    });

    const expected$ = cold('--a|', { a: rule });
    const actual$ = service.create(domainType, itemId, payload);
    expect(actual$).toBeObservable(expected$);
  });

  it('should update a rule for an item', () => {
    const payload: RulePayload = {
      name: 'test',
    };

    const rule: Rule = {
      id: '567',
      ...payload,
      ruleRepresentations: [],
    };

    endpointsStub.catalogueItem.updateRule.mockImplementationOnce((dt, id, rid, pl) => {
      expect(dt).toBe(domainType);
      expect(id).toBe(itemId);
      expect(rid).toBe(rule.id);
      expect(pl).toBe(payload);
      return cold('--a|', { a: { body: rule } });
    });

    const expected$ = cold('--a|', { a: rule });
    const actual$ = service.update(domainType, itemId, rule.id, payload);
    expect(actual$).toBeObservable(expected$);
  });

  it('should delete a rule for an item', () => {
    const ruleId: Uuid = '567';

    endpointsStub.catalogueItem.removeRule.mockImplementationOnce((dt, id, rid) => {
      expect(dt).toBe(domainType);
      expect(id).toBe(itemId);
      expect(rid).toBe(ruleId);
      return cold('--a|', { a: { body: null } });
    });

    const expected$ = cold('--a|', { a: true });
    const actual$ = service.delete(domainType, itemId, ruleId);
    expect(actual$).toBeObservable(expected$);
  });

  it('should list representations for a rule', () => {
    const rule: Rule = {
      id: '1',
      name: 'rule 1',
      ruleRepresentations: [
        {
          id: '1',
          language: 'text',
          representation: 'test text 1',
        },
        {
          id: '2',
          language: 'text',
          representation: 'test text 2',
        },
      ],
    };

    endpointsStub.catalogueItem.listRuleRepresentations.mockImplementationOnce(
      (dt, id, rid) => {
        expect(dt).toBe(domainType);
        expect(id).toBe(itemId);
        expect(rid).toBe(rule.id);
        return cold('--a|', {
          a: {
            body: {
              items: rule.ruleRepresentations,
            },
          },
        });
      }
    );

    const expected$ = cold('--a|', { a: rule.ruleRepresentations });
    const actual$ = service.listRepresentations(domainType, itemId, rule.id);
    expect(actual$).toBeObservable(expected$);
  });

  it('should get a representation for a rule', () => {
    const ruleId: Uuid = '567';
    const representation: RuleRepresentation = {
      id: '8910',
      language: 'text',
      representation: 'test text',
    };

    endpointsStub.catalogueItem.getRuleRepresentation.mockImplementationOnce(
      (dt, id, rid, repid) => {
        expect(dt).toBe(domainType);
        expect(id).toBe(itemId);
        expect(rid).toBe(ruleId);
        expect(repid).toBe(representation.id);
        return cold('--a|', { a: { body: representation } });
      }
    );

    const expected$ = cold('--a|', { a: representation });
    const actual$ = service.getRepresentation(
      domainType,
      itemId,
      ruleId,
      representation.id
    );
    expect(actual$).toBeObservable(expected$);
  });

  it('should create a representation for a rule', () => {
    const ruleId: Uuid = '567';
    const payload: RuleRepresentationPayload = {
      language: 'text',
      representation: 'test text',
    };
    const representation: RuleRepresentation = {
      id: '8910',
      ...payload,
    };

    endpointsStub.catalogueItem.saveRuleRepresentation.mockImplementationOnce(
      (dt, id, rid, pl) => {
        expect(dt).toBe(domainType);
        expect(id).toBe(itemId);
        expect(rid).toBe(ruleId);
        expect(pl).toBe(payload);
        return cold('--a|', { a: { body: representation } });
      }
    );

    const expected$ = cold('--a|', { a: representation });
    const actual$ = service.createRepresentation(domainType, itemId, ruleId, payload);
    expect(actual$).toBeObservable(expected$);
  });

  it('should update a representation for a rule', () => {
    const ruleId: Uuid = '567';
    const payload: RuleRepresentationPayload = {
      language: 'text',
      representation: 'test text',
    };
    const representation: RuleRepresentation = {
      id: '8910',
      ...payload,
    };

    endpointsStub.catalogueItem.updateRuleRepresentation.mockImplementationOnce(
      (dt, id, rid, repid, pl) => {
        expect(dt).toBe(domainType);
        expect(id).toBe(itemId);
        expect(rid).toBe(ruleId);
        expect(repid).toBe(representation.id);
        expect(pl).toBe(payload);
        return cold('--a|', { a: { body: representation } });
      }
    );

    const expected$ = cold('--a|', { a: representation });
    const actual$ = service.updateRepresentation(
      domainType,
      itemId,
      ruleId,
      representation.id,
      payload
    );
    expect(actual$).toBeObservable(expected$);
  });

  it('should delete a representation for a rule', () => {
    const ruleId: Uuid = '567';
    const representationId: Uuid = '8910';

    endpointsStub.catalogueItem.removeRuleRepresentation.mockImplementationOnce(
      (dt, id, rid, repid) => {
        expect(dt).toBe(domainType);
        expect(id).toBe(itemId);
        expect(rid).toBe(ruleId);
        expect(repid).toBe(representationId);
        return cold('--a|', { a: { body: null } });
      }
    );

    const expected$ = cold('--a|', { a: true });
    const actual$ = service.deleteRepresentation(
      domainType,
      itemId,
      ruleId,
      representationId
    );
    expect(actual$).toBeObservable(expected$);
  });
});
