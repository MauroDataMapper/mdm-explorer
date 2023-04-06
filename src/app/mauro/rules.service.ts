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
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  Rule,
  RuleDomainType,
  RuleIndexResponse,
  RulePayload,
  RuleRepresentation,
  RuleRepresentationIndexResponse,
  RuleRepresentationPayload,
  RuleRepresentationResponse,
  RuleResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from './mdm-endpoints.service';

/**
 * Service to manage rules and representations for Mauro catalogue items.
 */
@Injectable({
  providedIn: 'root',
})
export class RulesService {
  constructor(private endpoints: MdmEndpointsService) {}

  list(domainType: RuleDomainType, itemId: Uuid): Observable<Rule[]> {
    return this.endpoints.catalogueItem
      .listRules(domainType, itemId)
      .pipe(map((response: RuleIndexResponse) => response.body.items));
  }

  get(domainType: RuleDomainType, itemId: Uuid, ruleId: Uuid): Observable<Rule> {
    return this.endpoints.catalogueItem
      .getRule(domainType, itemId, ruleId)
      .pipe(map((response: RuleResponse) => response.body));
  }

  create(domainType: RuleDomainType, itemId: Uuid, data: RulePayload): Observable<Rule> {
    return this.endpoints.catalogueItem
      .saveRule(domainType, itemId, data)
      .pipe(map((response: RuleResponse) => response.body));
  }

  update(
    domainType: RuleDomainType,
    itemId: Uuid,
    ruleId: Uuid,
    data: RulePayload
  ): Observable<Rule> {
    return this.endpoints.catalogueItem
      .updateRule(domainType, itemId, ruleId, data)
      .pipe(map((response: RuleResponse) => response.body));
  }

  delete(domainType: RuleDomainType, itemId: Uuid, ruleId: Uuid): Observable<boolean> {
    return this.endpoints.catalogueItem
      .removeRule(domainType, itemId, ruleId)
      .pipe(map((response: HttpResponse<null>) => response.body === null));
  }

  listRepresentations(
    domainType: RuleDomainType,
    itemId: Uuid,
    ruleId: Uuid
  ): Observable<RuleRepresentation[]> {
    return this.endpoints.catalogueItem
      .listRuleRepresentations(domainType, itemId, ruleId)
      .pipe(map((response: RuleRepresentationIndexResponse) => response.body.items));
  }

  getRepresentation(
    domainType: RuleDomainType,
    itemId: Uuid,
    ruleId: Uuid,
    representationId: Uuid
  ): Observable<RuleRepresentation> {
    return this.endpoints.catalogueItem
      .getRuleRepresentation(domainType, itemId, ruleId, representationId)
      .pipe(map((response: RuleRepresentationResponse) => response.body));
  }

  createRepresentation(
    domainType: RuleDomainType,
    itemId: Uuid,
    ruleId: Uuid,
    data: RuleRepresentationPayload
  ): Observable<RuleRepresentation> {
    return this.endpoints.catalogueItem
      .saveRuleRepresentation(domainType, itemId, ruleId, data)
      .pipe(map((response: RuleRepresentationResponse) => response.body));
  }

  updateRepresentation(
    domainType: RuleDomainType,
    itemId: Uuid,
    ruleId: Uuid,
    representationId: Uuid,
    data: RuleRepresentationPayload
  ): Observable<RuleRepresentation> {
    return this.endpoints.catalogueItem
      .updateRuleRepresentation(domainType, itemId, ruleId, representationId, data)
      .pipe(map((response: RuleRepresentationResponse) => response.body));
  }

  deleteRepresentation(
    domainType: RuleDomainType,
    itemId: Uuid,
    ruleId: Uuid,
    representationId: Uuid
  ): Observable<boolean> {
    return this.endpoints.catalogueItem
      .removeRuleRepresentation(domainType, itemId, ruleId, representationId)
      .pipe(map((response: HttpResponse<null>) => response.body === null));
  }
}
