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
import { Observable } from 'rxjs';

export interface RulesServiceStub {
  list: jest.MockedFunction<
    (domainType: RuleDomainType, itemId: Uuid) => Observable<Rule[]>
  >;
  get: jest.MockedFunction<
    (domainType: RuleDomainType, itemId: Uuid, ruleId: Uuid) => Observable<Rule>
  >;
  create: jest.MockedFunction<
    (domainType: RuleDomainType, itemId: Uuid, data: RulePayload) => Observable<Rule>
  >;
  update: jest.MockedFunction<
    (
      domainType: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      data: RulePayload,
    ) => Observable<Rule>
  >;
  delete: jest.MockedFunction<
    (domainType: RuleDomainType, itemId: Uuid, ruleId: Uuid) => Observable<boolean>
  >;
  listRepresentation: jest.MockedFunction<
    (
      domainType: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
    ) => Observable<RuleRepresentation[]>
  >;
  getRepresentation: jest.MockedFunction<
    (
      domainType: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      representationId: Uuid,
    ) => Observable<RuleRepresentation>
  >;
  createRepresentation: jest.MockedFunction<
    (
      domainType: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      data: RuleRepresentationPayload,
    ) => Observable<RuleRepresentation>
  >;
  updateRepresentation: jest.MockedFunction<
    (
      domainType: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      representationId: Uuid,
      data: RuleRepresentationPayload,
    ) => Observable<RuleRepresentation>
  >;
  deleteRepresentation: jest.MockedFunction<
    (
      domainType: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      representationId: Uuid,
    ) => Observable<boolean>
  >;
}

export const createRulesServiceStub = (): RulesServiceStub => {
  return {
    list: jest.fn(),
    get: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    listRepresentation: jest.fn(),
    getRepresentation: jest.fn(),
    createRepresentation: jest.fn(),
    updateRepresentation: jest.fn(),
    deleteRepresentation: jest.fn(),
  };
};
