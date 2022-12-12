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
import {
  MdmResponse,
  PathableDomainType,
  RuleDomainType,
  RuleIndexResponse,
  RulePayload,
  RuleRepresentationIndexResponse,
  RuleRepresentationPayload,
  RuleRepresentationResponse,
  RuleResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type CatalogueItemGetPathFn = (
  domainType: PathableDomainType,
  path: string
) => Observable<MdmResponse<any>>;
export type CatalogueItemGetPathMockedFn = jest.MockedFunction<CatalogueItemGetPathFn>;

export type CatalogueItemGetPathFromParentFn = (
  domainType: PathableDomainType,
  parentId: Uuid,
  path: string
) => Observable<MdmResponse<any>>;
export type CatalogueItemGetPathFromParentMockedFn =
  jest.MockedFunction<CatalogueItemGetPathFromParentFn>;

export interface MdmCatalogueItemResourceStub {
  getPath: CatalogueItemGetPathMockedFn;
  getPathFromParent: CatalogueItemGetPathFromParentMockedFn;

  listRules: jest.MockedFunction<
    (domain: RuleDomainType, id: Uuid) => Observable<RuleIndexResponse>
  >;

  getRule: jest.MockedFunction<
    (domain: RuleDomainType, itemId: Uuid, ruleId: Uuid) => Observable<RuleResponse>
  >;

  saveRule: jest.MockedFunction<
    (domain: RuleDomainType, itemId: Uuid, data: RulePayload) => Observable<RuleResponse>
  >;

  updateRule: jest.MockedFunction<
    (
      domain: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      data: RulePayload
    ) => Observable<RuleResponse>
  >;

  removeRule: jest.MockedFunction<
    (domain: RuleDomainType, itemId: Uuid, ruleId: Uuid) => Observable<any>
  >;

  listRuleRepresentations: jest.MockedFunction<
    (
      domain: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid
    ) => Observable<RuleRepresentationIndexResponse>
  >;

  getRuleRepresentation: jest.MockedFunction<
    (
      domain: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      representationId: Uuid
    ) => Observable<RuleRepresentationResponse>
  >;

  saveRuleRepresentation: jest.MockedFunction<
    (
      domain: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      data: RuleRepresentationPayload
    ) => Observable<RuleRepresentationResponse>
  >;

  updateRuleRepresentation: jest.MockedFunction<
    (
      domain: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      representationId: Uuid,
      data: RuleRepresentationPayload
    ) => Observable<RuleRepresentationResponse>
  >;

  removeRuleRepresentation: jest.MockedFunction<
    (
      domain: RuleDomainType,
      itemId: Uuid,
      ruleId: Uuid,
      representationId: Uuid
    ) => Observable<any>
  >;
}

export const createCatalogueItemStub = (): MdmCatalogueItemResourceStub => {
  return {
    getPath: jest.fn() as CatalogueItemGetPathMockedFn,
    getPathFromParent: jest.fn() as CatalogueItemGetPathFromParentMockedFn,
    listRules: jest.fn() as jest.MockedFunction<
      (domain: RuleDomainType, id: Uuid) => Observable<RuleIndexResponse>
    >,
    getRule: jest.fn() as jest.MockedFunction<
      (domain: RuleDomainType, itemId: Uuid, ruleId: Uuid) => Observable<RuleResponse>
    >,
    saveRule: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        data: RulePayload
      ) => Observable<RuleResponse>
    >,
    updateRule: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        ruleId: Uuid,
        data: RulePayload
      ) => Observable<RuleResponse>
    >,
    removeRule: jest.fn() as jest.MockedFunction<
      (domain: RuleDomainType, itemId: Uuid, ruleId: Uuid) => Observable<any>
    >,
    listRuleRepresentations: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        ruleId: Uuid
      ) => Observable<RuleRepresentationIndexResponse>
    >,
    getRuleRepresentation: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        ruleId: Uuid,
        representationId: Uuid
      ) => Observable<RuleRepresentationResponse>
    >,
    saveRuleRepresentation: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        ruleId: Uuid,
        data: RuleRepresentationPayload
      ) => Observable<RuleRepresentationResponse>
    >,
    updateRuleRepresentation: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        ruleId: Uuid,
        representationId: Uuid,
        data: RuleRepresentationPayload
      ) => Observable<RuleRepresentationResponse>
    >,
    removeRuleRepresentation: jest.fn() as jest.MockedFunction<
      (
        domain: RuleDomainType,
        itemId: Uuid,
        ruleId: Uuid,
        representationId: Uuid
      ) => Observable<any>
    >,
  };
};
