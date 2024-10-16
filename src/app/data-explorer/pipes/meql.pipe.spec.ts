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
import { MeqlPipe } from './meql.pipe';
import { TestBed } from '@angular/core/testing';
import moment from 'moment';
import { QueryCondition, QueryExpression, QueryOperator } from '../data-explorer.types';

const newline = '\r\n';
const tab = '\t';

describe('MeqlPipe', () => {
  let pipe: MeqlPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MeqlPipe],
    });
    pipe = TestBed.inject(MeqlPipe);
  });

  describe('Basic Tests', () => {
    it('create an instance', () => {
      expect(pipe).toBeTruthy();
    });

    it('should transform entities to their full field name', () => {
      const query = {
        condition: 'and',
        rules: [
          {
            field: 'some entity.field name',
            entity: 'some entity',
            operator: '=',
            value: 'String 1',
          },
        ],
      };

      const line1 = `(${newline}`;
      const line2 = `${tab}"${query.rules[0].field}" ${query.rules[0].operator} "${query.rules[0].value}"${newline}`;
      const line3 = ')';

      const actual = pipe.transform(query);
      const expected = `${line1}${line2}${line3}`;
      expect(actual).toBe(expected);
    });
  });

  describe('Single Condition Tests', () => {
    it.each([
      ['transforms field equal to string', 'Simple String Field', '=', 'Some Text'],
      ['transforms field not equal to string', 'Simple String Field', '!=', 'Some Text'],
      ['transforms field equal to number', 'Simple String Field', '=', 0],
      ['transforms field not equal to number', 'Simple String Field', '!=', 99],
    ])('%s', (_, field, operator, value) => {
      /*
          Expected example:

          (
            "Field" = "Value"
          )
        */
      const query = {
        condition: 'and',
        rules: [{ field, operator, value }],
      };

      const expectedValue = typeof value === 'string' ? `"${value}"` : value.toString();

      const line1 = `(${newline}`;
      const line2 = `${tab}"${query.rules[0].field}" ${query.rules[0].operator} ${expectedValue}${newline}`;
      const line3 = ')';

      const actual = pipe.transform(query);
      const expected = `${line1}${line2}${line3}`;
      expect(actual).toBe(expected);
    });
  });

  describe('Double Condition Tests', () => {
    it.each([
      [
        'transforms and uses "and" condition',
        {
          condition: 'and',
          rules: [
            {
              field: 'Simple String Field',
              operator: '=',
              value: 'String 1',
            },
            {
              field: 'String field 2',
              operator: '!=',
              value: 'String 2',
            },
          ],
        },
      ],
      [
        'transforms and uses "or" condition',
        {
          condition: 'or',
          rules: [
            {
              field: 'Simple String Field',
              operator: '=',
              value: 'String 1',
            },
            {
              field: 'String field 2',
              operator: '!=',
              value: 'String 2',
            },
          ],
        },
      ],
    ])('%s', (_, query) => {
      /*
        Expected example:

        (
          "Field" = "Value"
          and "Field2" = "Value2"
        )
        */
      const line1 = `(${newline}`;
      const line2 = `${tab}"${query.rules[0].field}" ${query.rules[0].operator} "${query.rules[0].value}"${newline}`;
      const line3 = `${tab}${query.condition} "${query.rules[1].field}" ${query.rules[1].operator} "${query.rules[1].value}"${newline}`;
      const line4 = ')';

      const actual = pipe.transform(query);
      const expected = `${line1}${line2}${line3}${line4}`;
      expect(actual).toBe(expected);
    });
  });

  describe('Double Ruleset Tests', () => {
    it.each<[string, QueryCondition]>([
      [
        'transforms and uses "and" and "or" conditions',
        {
          entity: 'coretable',
          condition: 'and',
          rules: [
            {
              field: 'String field 1',
              operator: '=',
              value: 'String 1',
            },
            {
              field: 'String field 2',
              operator: '!=',
              value: 'String 2',
            },
            {
              entity: 'coretable',
              condition: 'or',
              rules: [
                {
                  field: 'Simple field 3',
                  operator: '=',
                  value: 'String 3',
                },
                {
                  field: 'String field 4',
                  operator: '!=',
                  value: 'String 4',
                },
              ],
            },
          ],
        },
      ],
      [
        'transforms and uses "or" and "and" conditions',
        {
          entity: 'coretable',
          condition: 'or',
          rules: [
            {
              field: 'String field 1',
              operator: '=',
              value: 'String 1',
            },
            {
              field: 'String field 2',
              operator: '!=',
              value: 'String 2',
            },
            {
              entity: 'coretable',
              condition: 'and',
              rules: [
                {
                  field: 'Simple field 3',
                  operator: '=',
                  value: 'String 3',
                },
                {
                  field: 'String field 4',
                  operator: '!=',
                  value: 'String 4',
                },
              ],
            },
          ],
        },
      ],
      [
        'transforms and uses "or" and "or" conditions',
        {
          entity: 'coretable',
          condition: 'or',
          rules: [
            {
              field: 'String field 1',
              operator: '=',
              value: 'String 1',
            },
            {
              field: 'String field 2',
              operator: '!=',
              value: 'String 2',
            },
            {
              entity: 'coretable',
              condition: 'or',
              rules: [
                {
                  field: 'Simple field 3',
                  operator: '=',
                  value: 'String 3',
                },
                {
                  field: 'String field 4',
                  operator: '!=',
                  value: 'String 4',
                },
              ],
            },
          ],
        },
      ],
      [
        'transforms and uses "and" and "and" conditions',
        {
          entity: 'coretable',
          condition: 'and',
          rules: [
            {
              field: 'String field 1',
              operator: '=',
              value: 'String 1',
            },
            {
              field: 'String field 2',
              operator: '!=',
              value: 'String 2',
            },
            {
              entity: 'coretable',
              condition: 'and',
              rules: [
                {
                  field: 'Simple field 3',
                  operator: '=',
                  value: 'String 3',
                },
                {
                  field: 'String field 4',
                  operator: '!=',
                  value: 'String 4',
                },
              ],
            },
          ],
        },
      ],
    ])('%s', (_, query) => {
      /*
        Expected example:

        (
          "Field" = "Value"
          and "Field2" = "Value2"
          and (
              "Field3" = "Value3"
              or "Field4" = "Value4"
          )
        )
        */
      const line1 = `(${newline}`;
      const line2 = `${tab}"${(query.rules[0] as QueryExpression).field}" ${
        (query.rules[0] as QueryExpression).operator
      } "${(query.rules[0] as QueryExpression).value}"${newline}`;
      const line3 = `${tab}${query.condition} "${
        (query.rules[1] as QueryExpression).field
      }" ${(query.rules[1] as QueryExpression).operator} "${
        (query.rules[1] as QueryExpression).value
      }"${newline}`;
      const line4 = `${tab}${query.condition} (${newline}`;
      const line5 = `${tab}${tab}"${
        ((query.rules[2] as QueryCondition).rules[0] as QueryExpression).field
      }" ${((query.rules[2] as QueryCondition).rules[0] as QueryExpression).operator} "${
        ((query.rules[2] as QueryCondition).rules[0] as QueryExpression).value
      }"${newline}`;
      const line6 = `${tab}${tab}${(query.rules[2] as QueryCondition).condition} "${
        ((query.rules[2] as QueryCondition).rules[1] as QueryExpression).field
      }" ${((query.rules[2] as QueryCondition).rules[1] as QueryExpression).operator} "${
        ((query.rules[2] as QueryCondition).rules[1] as QueryExpression).value
      }"${newline}`;
      const line7 = `${tab})${newline}`;
      const line8 = ')';

      const expected = `${line1}${line2}${line3}${line4}${line5}${line6}${line7}${line8}`;
      const actual = pipe.transform(query);
      expect(actual).toBe(expected);
    });
  });

  describe('Date Tests', () => {
    it('formats dates correctly', () => {
      const query = {
        condition: 'and',
        rules: [
          {
            field: 'A Date Field',
            operator: '=',
            value: moment('12/31/2022', 'MM/DD/YYYY'),
          },
        ],
      };

      const line1 = `(${newline}`;
      const line2 = `${tab}"A Date Field" = "31/12/2022"${newline}`;
      const line3 = ')';

      const expected = `${line1}${line2}${line3}`;
      const actual = pipe.transform(query);
      expect(actual).toBe(expected);
    });

    it('returns empty string for invalid data', () => {
      const query = {
        unexpectedField: 'should not be here',
        unexpectedArray: [{ badField: 'not valid' }],
      };
      const actual = pipe.transform(query);
      expect(actual).toBe('');
    });
  });

  describe('autocomplete select options tests', () => {
    it.each<[string, QueryOperator, string]>([
      ['autocomplete field', 'in', 'Term 01'],
      ['autocomplete field', 'not in', 'Term 01'],
    ])(
      'formats single autocomplete select option %p with operator %p correctly',
      (field, operator, name) => {
        const query: QueryCondition = {
          entity: 'coretable',
          condition: 'and',
          rules: [
            {
              field,
              operator,
              value: [
                {
                  name,
                  value: {}, // Minimum value required for tests
                },
              ],
            },
          ],
        };

        const line1 = `(${newline}`;
        const line2 = `${tab}"${field}" ${operator} "${name}"${newline}`;
        const line3 = ')';

        const expected = `${line1}${line2}${line3}`;
        const actual = pipe.transform(query);
        expect(actual).toBe(expected);
      }
    );

    it.each<[string, QueryOperator, string[]]>([
      ['autocomplete field', 'in', ['Term 01', 'Term 02', 'Term 03']],
      ['autocomplete field', 'not in', ['Term 01', 'Term 02', 'Term 03']],
    ])(
      'formats multiple autocomplete select options %p with operator %p correctly',
      (field, operator, names) => {
        const query: QueryCondition = {
          entity: 'coretable',
          condition: 'and',
          rules: [
            {
              field,
              operator,
              value: names.map((name) => {
                return {
                  name,
                  value: {}, // Minimum value required for tests
                };
              }),
            },
          ],
        };

        const combinedNames = names.join(', ');
        const line1 = `(${newline}`;
        const line2 = `${tab}"${field}" ${operator} "${combinedNames}"${newline}`;
        const line3 = ')';

        const expected = `${line1}${line2}${line3}`;
        const actual = pipe.transform(query);
        expect(actual).toBe(expected);
      }
    );
  });
});
