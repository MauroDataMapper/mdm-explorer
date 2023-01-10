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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QueryBuilderConfig, RuleSet } from 'angular2-query-builder';
import {
  DataElementSearchResult,
  QueryCondition,
} from 'src/app/data-explorer/data-explorer.types';
import { ThemePalette } from '@angular/material/core';
import { query } from '@angular/animations';

@Component({
  selector: 'mdm-querybuilder',
  templateUrl: './querybuilder.component.html',
  styleUrls: ['./querybuilder.component.scss'],
})
export class QueryBuilderComponent {
  @Input() dataElements: DataElementSearchResult[] = [];
  @Input() color: ThemePalette = 'primary';
  @Input() query: QueryCondition = {
    condition: 'and',
    rules: [],
  };
  @Input() config: QueryBuilderConfig = {
    fields: {},
  };

  @Output() queryChange = new EventEmitter<QueryCondition>();

  operatorMap: { [key: string]: string[] } = {
    /* eslint-disable-next-line */
    string: ['=', '!=', 'contains', 'like', 'startswith', 'endswith'],
  };

  allowRuleset = true;

  ngOnInit(): void {
    this.clearComponent();
    this.setupConfig();
  }

  clearComponent() {
    if (this.query.rules.length == 0) {
      this.query = {
        condition: 'and',
        rules: [],
      };
    }
  }

  get noValidFields(): boolean {
    return Object.keys(this.config.fields).length === 0;
  }

  modelChanged(value: RuleSet) {
    this.queryChange.emit(value as QueryCondition);
  }
}
