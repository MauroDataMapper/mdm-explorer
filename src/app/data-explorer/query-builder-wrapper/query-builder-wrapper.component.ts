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
/*
Query builder source: https://github.com/zebzhao/Angular-QueryBuilder
*/
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  QueryBuilderConfig,
  Rule,
  RuleSet,
  Option,
} from '../query-builder/query-builder.interfaces';
import {
  DataElementSearchResult,
  DataSpecificationQueryType,
  QueryCondition,
} from 'src/app/data-explorer/data-explorer.types';
import { ThemePalette } from '@angular/material/core';
import { map } from 'rxjs';
import { AutocompleteSelectOptionSet } from 'src/app/shared/autocomplete-select/autocomplete-select.component';
import { TerminologyService } from 'src/app/mauro/terminology.service';
import {
  mapOptionsArrayToModelDataType,
  QueryBuilderWrapperService,
} from 'src/app/data-explorer/query-builder-wrapper.service';

@Component({
  selector: 'mdm-query-builder-wrapper',
  templateUrl: './query-builder-wrapper.component.html',
  styleUrls: ['./query-builder-wrapper.component.scss'],
})
export class QueryBuilderWrapperComponent implements OnInit {
  @Input() dataElements: DataElementSearchResult[] = [];
  @Input() color: ThemePalette = 'primary';
  @Input() queryType?: DataSpecificationQueryType;
  @Input() query: QueryCondition = {
    condition: 'and',
    entity: '',
    rules: [],
  };
  @Input() config: QueryBuilderConfig = {
    fields: {},
  };

  @Output() queryChange = new EventEmitter<QueryCondition>();

  operatorMap: { [key: string]: string[] } = {
    // non-default data types require specifying operators in order to populate the operator drop down.
    // Is also used to extend some default operators
    /* eslint-disable */
    string: ['=', '!=', 'contains', 'like', 'startswith', 'endswith'],
    integer: ['=', '!=', '<', '<=', '>', '>='],
    decimal: ['=', '!=', '<', '<=', '>', '>='],
    datetime: ['=', '!=', '>', '<', '=>', '=<'],
    terminology: ['in', 'not in'],
    /* eslint-enable */
  };

  allowRuleset = true;
  isDataQuery = false;

  /**
   * Track zero or more term searches linked to the automcomplete controls.
   * */
  termSearchResults: { [field: string]: AutocompleteSelectOptionSet } = {};

  /**
   * Associate field descriptions with their entity and label paths.
   * */
  descriptions: { [field: string]: string } = {};

  constructor(
    private terminology: TerminologyService,
    private queryBuilderWrapperService: QueryBuilderWrapperService
  ) {}

  get hasFields(): boolean {
    return Object.keys(this.config.fields).length > 0;
  }

  ngOnInit(): void {
    // For all 'terminology' fields, initialise the search result sets for the controls
    Object.entries(this.config.fields)
      .filter(([_, field]) => field.type === 'terminology')
      .forEach(([name, _]) => (this.termSearchResults[name] = { count: 0, options: [] }));

    // Clear the query component
    if (this.query.rules.length === 0) {
      this.query = {
        condition: 'and',
        entity: '',
        rules: [],
      };
    }

    this.setupDescriptions();
    this.isDataQuery = this.queryType === 'data';
  }

  modelChanged(value: RuleSet) {
    this.queryChange.emit(value as QueryCondition);
  }

  termSearchChanged(value: string | undefined, rule: Rule, options: Option[]) {
    // Due to the querybuilder component not having enough information available, we've had
    // to store necessary model details in the Option[] from the querybuilder control, otherwise
    // we have no context as to which term search to carry out
    const model = mapOptionsArrayToModelDataType(options);

    this.terminology
      .listTerms(model.id, model.domainType, {
        max: 20,
        sort: 'definition',
        order: 'asc',
        ...(value && { definition: value }),
      })
      .pipe(
        map((terms) => {
          return {
            count: terms.count,
            options: terms.items.map((item) => {
              return {
                name: item.definition,
                value: item,
              };
            }),
          };
        })
      )
      .subscribe((results: AutocompleteSelectOptionSet) => {
        this.termSearchResults[rule.field ?? ''] = results;
      });
  }

  private setupDescriptions() {
    this.dataElements.forEach((element) => {
      const entity = this.queryBuilderWrapperService.getEntity(element);
      const fullName = `${entity}.${element.label}`;

      const description = element.description
        ? element.description.length > 300
          ? element.description.substring(0, 300) + '...'
          : element.description
        : 'No additional information available';

      this.descriptions[fullName] = description;
    });
  }
}
