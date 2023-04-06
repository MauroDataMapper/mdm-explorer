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
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { isAutocompleteSelectOptionArray } from 'src/app/shared/autocomplete-select/autocomplete-select.component';

@Pipe({ name: 'meql', pure: false })
export class MeqlPipe implements PipeTransform {
  private _date: DatePipe = new DatePipe('en-GB');

  transform(value: any): string {
    return this.parseQuery(value);
  }

  private meqlConnective(connective: string) {
    switch (connective.toLowerCase()) {
      case 'and':
        return 'and';
      case 'or':
        return 'or';
      default:
        return 'UNKNOWN_CONNECTIVE';
    }
  }

  private formattedValue(value: any, quoted: boolean = false) {
    let quotes = '';
    if (quoted) {
      quotes = '"';
    }

    if (typeof value === 'number') {
      return value.toString();
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    else if (moment(value, true).isValid()) {
      return this.formatDate(value, quotes);
    } else if (isAutocompleteSelectOptionArray(value)) {
      const optionsStr =
        value && value.length > 0 ? value.map((item) => item.name).join(', ') : 'null';
      return `${quotes}${optionsStr}${quotes}`;
    } else if (value !== undefined && value !== null) {
      return `${quotes}${value.toString()}${quotes}`;
    } else {
      return 'null';
    }
  }

  private formatDate(value: any, quotes = '') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const date = moment.isMoment(value) ? value : moment(value);

    return `${quotes}${this._date
      .transform(date.toDate(), 'dd/MM/yyyy')
      ?.toString()}${quotes}`;
  }

  private parseQuery(
    value: any,
    connective: string = '',
    depth = 0,
    firstRule: boolean = true,
    lastRule: boolean = true
  ) {
    let meql = firstRule && !(connective === '') ? '(' : '';
    if (depth > 0) {
      meql += '\r\n';
    }
    let closingTabs = '';
    for (let i = 0; i < depth; i++) {
      meql += '\t';
      if (i < depth - 1) {
        closingTabs += '\t';
      }
    }

    let nextConnective = '';

    if (connective !== '' && !firstRule) {
      meql += this.meqlConnective(connective) + ' ';
    }

    for (const key in value) {
      const rules = value[key];
      switch (key.toLowerCase()) {
        case 'condition':
          nextConnective = value[key];
          break;
        case 'rules':
          for (let i = 0; i < rules.length; i++) {
            meql += this.parseQuery(
              rules[i],
              nextConnective,
              depth + 1,
              i === 0,
              i === rules.length - 1
            );
          }
          break;
        case 'field': {
          const entity = value.entity as string;
          const fullName = entity ? `${entity}.${value[key]}` : value[key];
          meql += this.formattedValue(fullName, true) + ' ';
          break;
        }
        case 'value':
          meql += this.formattedValue(value[key], true);
          break;
        case 'operator':
          meql += this.formattedValue(value[key]) + ' ';
          break;
      }
    }

    if (lastRule && !(connective === '')) {
      meql += '\r\n' + closingTabs + ')';
    }

    return meql;
  }
}
