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
//Query builder source: https://github.com/zebzhao/Angular-QueryBuilder

import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { DataType } from '@maurodatamapper/mdm-resources';
import { DataElementSearchResult } from 'src/app/data-explorer/data-explorer.types';

@Component({
  selector: 'mdm-querybuilder',
  templateUrl: './querybuilder.component.html',
  styleUrls: ['./querybuilder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueryBuilderComponent {
  // Query Builder Configuration Begin
  config: QueryBuilderConfig = {
    fields: {},
  };

  operatorMap: { [key: string]: string[] } = {
    /* eslint-disable-next-line */
    string: ['=', '!=', 'contains', 'like', 'startswith', 'endswith'],
  };

  allowRuleset = true;
  allowCollapse = true;
  persistValueOnFieldChange = false;

  query = {
    condition: 'and',
    rules: [],
  };
  // Query Builder Configuration End

  private _title = 'Query Builder';
  private showQueryBuilderText: string = 'Show ' + this._title + ' Editor';
  private hideQueryBuilderText: string = 'Hide ' + this._title + ' Editor';
  private showQueryBuilderIcon = 'arrow_drop_down';
  private hideQueryBuilderIcon = 'arrow_drop_up';

  @Input() set dataElements(value: DataElementSearchResult[]) {
    this.setupConfig(value);
  }
  @Input() set title(value: string) {
    this._title = value;
    this.showQueryBuilderText = 'Show ' + this._title + ' Editor';
    this.hideQueryBuilderText = 'Hide ' + this._title + ' Editor';
    this.setToggleQueryBuilderText();
  }
  get title(): string {
    return this._title;
  }

  constructor() {}

  // Show / Hide query builder configuration begin
  qbController = {
    showQueryBuilder: false,
    toggleQueryBuilderText: this.showQueryBuilderText,
    toggleQueryBuilderIcon: this.hideQueryBuilderIcon,
  };

  setToggleQueryBuilderText() {
    if (this.qbController.showQueryBuilder) {
      this.qbController.toggleQueryBuilderText = this.hideQueryBuilderText;
      this.qbController.toggleQueryBuilderIcon = this.hideQueryBuilderIcon;
    } else {
      this.qbController.toggleQueryBuilderText = this.showQueryBuilderText;
      this.qbController.toggleQueryBuilderIcon = this.showQueryBuilderIcon;
    }
  }

  toggleQueryBuilder() {
    this.qbController.showQueryBuilder = !this.qbController.showQueryBuilder;
    this.setToggleQueryBuilderText();
  }
  // Show / Hide query builder configuration end

  private queryBuilderDataType(dataType: DataType | undefined) {
    const dataTypeString = dataType?.label ? dataType?.label : '';

    if (dataTypeString !== '') {
      const enumLength = dataType?.enumerationValues?.length
        ? dataType?.enumerationValues?.length
        : 0;
      if (enumLength > 0) {
        return 'category';
      }
    }

    // This should not be hard coded and managed elsewhere.
    switch (dataTypeString.toLowerCase()) {
      // strings
      case 'char':
      case 'char[n]':
      case 'nchar':
      case 'ntext':
      case 'nvarchar':
      case 'nvarchar[max]':
      case 'string':
      case 'text':
      case 'varbinary[max]':
      case 'varchar':
      case 'varchar[max]':
      case 'varchar[n]':
      case 'xml': {
        return 'string';
      }
      // numbers
      case 'bigint':
      case 'datetimeoffset':
      case 'decimal':
      case 'decimal[p,s]':
      case 'float':
      case 'float[n]':
      case 'int':
      case 'integer':
      case 'money':
      case 'numeric':
      case 'numeric[p,s]':
      case 'real':
      case 'smallint':
      case 'smallmoney':
      case 'timestamp':
      case 'tinyint': {
        return 'number';
      }
      // dates
      case 'date':
      case 'datetime':
      case 'datetime2':
      case 'smalldatetime': {
        return 'date';
      }
      // time
      case 'time': {
        return 'time';
      }
      // boolean
      case 'bit':
      case 'boolean': {
        return 'boolean';
      }
      // unsupported
      case 'binary':
      case 'binary[n]':
      case 'cursor':
      case 'Finalised Data Type':
      case 'image':
      case 'sql_variant':
      case 'table':
      case 'uniqueidentifier':
      case 'V1 Data Type':
      case 'V2 Data Type 2':
      case 'V2 Data Type 3':
      case 'V2 Data Type':
      case 'varbinary': {
        return 'unsupported';
      }
      default:
        return 'string';
    }
  }

  private getOptions(dataType: DataType | undefined) {
    const options: any[] = [];
    const enumValues = dataType?.enumerationValues ? dataType?.enumerationValues : [];
    enumValues.forEach((dataOption) => {
      const option = {
        ['name']: dataOption.key,
        ['value']: dataOption.value,
      };
      options.push(option);
    });
    return options;
  }

  private getDefaultValue(dataType: DataType | undefined) {
    const dataTypeString = this.queryBuilderDataType(dataType);
    if (dataTypeString.toLowerCase() === 'number') {
      return 0;
    } else {
      return null;
    }
  }

  private setupConfig(dataElements: DataElementSearchResult[]) {
    // Sort the elements
    const sortedDataElements: DataElementSearchResult[] = dataElements.sort((n1, n2) => {
      if (n1.label > n2.label) {
        return 1;
      }

      if (n1.label < n2.label) {
        return -1;
      }

      return 0;
    });

    // Clear the query list otherwise errors about missing fields can occur.
    this.query.rules = [];

    // Reinitialise the object so that the screen will update.
    this.config = {
      fields: {},
    };

    // Setup the config
    sortedDataElements.forEach((dataElement) => {
      const dataTypeString = this.queryBuilderDataType(dataElement.dataType);
      if (dataTypeString !== 'unsupported') {
        this.config.fields[dataElement.label] = {
          name: dataElement.label + ' (' + dataTypeString + ')',
          type: dataTypeString,
          options: this.getOptions(dataElement.dataType),
          defaultValue: this.getDefaultValue(dataElement.dataType),
        };
      }
    });
  }
}
