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
import { QueryBuilderWrapperComponent } from './query-builder-wrapper.component';

import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { createTerminologyServiceStub } from 'src/app/testing/stubs/terminology.stub';
import { TerminologyService } from 'src/app/mauro/terminology.service';
import { MockComponent } from 'ng-mocks';
import { MeqlOutputComponent } from '../meql-output/meql-output.component';
import { MatCard } from '@angular/material/card';
import { QueryCondition } from '../data-explorer.types';
import { mapModelDataTypeToOptionsArray } from '../query-builder.service';
import {
  CatalogueItemDomainType,
  MdmResourcesConfiguration,
} from '@maurodatamapper/mdm-resources';
import { of } from 'rxjs';
import { AutocompleteSelectOptionSet } from 'src/app/shared/autocomplete-select/autocomplete-select.component';
import { QueryBuilderComponent } from '../query-builder/query-builder.component';
import { Rule } from '../query-builder/query-builder.interfaces';

describe('QueryBuilderComponent', () => {
  let harness: ComponentHarness<QueryBuilderWrapperComponent>;
  const terminologyStub = createTerminologyServiceStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(QueryBuilderWrapperComponent, {
      providers: [
        {
          provide: TerminologyService,
          useValue: terminologyStub,
        },
        {
          provide: MdmResourcesConfiguration,
          useValue: mdmResourcesConfiguration,
        },
      ],
      declarations: [
        MockComponent(MeqlOutputComponent),
        MockComponent(MatCard),
        MockComponent(QueryBuilderComponent),
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.dataElements).toStrictEqual([]);
    expect(harness.component.color).toBe('primary');
    expect(harness.component.query).toStrictEqual({
      condition: 'and',
      rules: [],
    });
    expect(harness.component.config).toStrictEqual({
      fields: {},
    });
  });

  describe('has fields', () => {
    it('should be false when fields list is empty', () => {
      expect(harness.component.hasFields).toBeFalsy();
    });

    it('should be true when fields list is not empty', () => {
      harness.component.config = {
        fields: {
          testField: {
            name: 'testField',
            type: 'string',
          },
        },
      };

      expect(harness.component.hasFields).toBeTruthy();
    });
  });

  describe('initialisation', () => {
    it('should not initialise any term search results if there are no terminology fields', () => {
      harness.component.config = {
        fields: {
          testField: {
            name: 'testField',
            type: 'string',
          },
        },
      };

      harness.component.ngOnInit();

      expect(Object.keys(harness.component.termSearchResults)).toStrictEqual([]);
    });

    it('should initialise term search results for a terminology field', () => {
      harness.component.config = {
        fields: {
          testField1: {
            name: 'testField1',
            type: 'terminology',
          },
          testField2: {
            name: 'testField2',
            type: 'terminology',
          },
        },
      };

      harness.component.ngOnInit();

      const expectedSetup = {
        count: 0,
        options: [],
      };

      expect(harness.component.termSearchResults['testField1']).toStrictEqual(
        expectedSetup
      );
      expect(harness.component.termSearchResults['testField2']).toStrictEqual(
        expectedSetup
      );
    });

    it('should reset the query when empty', () => {
      harness.component.query = {
        condition: 'or',
        rules: [],
      };

      harness.component.ngOnInit();

      expect(harness.component.query).toStrictEqual({
        condition: 'and',
        rules: [],
      });
    });

    it('should not reset the query when it has a value', () => {
      const query: QueryCondition = {
        condition: 'or',
        rules: [
          {
            field: 'test',
            operator: '=',
            value: 'value',
          },
          {
            field: 'something',
            operator: '=',
            value: 'else',
          },
        ],
      };

      harness.component.query = query;
      harness.component.ngOnInit();
      expect(harness.component.query).toStrictEqual(query);
    });

    it('should map entity and labels to descriptions', () => {
      harness.component.dataElements = [
        {
          isSelected: false,
          id: '1',
          model: 'test',
          dataClass: 'Class 1',
          label: 'testField1',
          isBookmarked: false,
          description: 'testField1 Description',
          breadcrumbs: [
            {
              id: '11',
              label: 'Schema 1',
              domainType: CatalogueItemDomainType.DataClass,
            },
            {
              id: '12',
              label: 'Class 1',
              domainType: CatalogueItemDomainType.DataClass,
            },
          ],
        },
        {
          isSelected: false,
          id: '2',
          model: 'test',
          dataClass: 'Class 2',
          label: 'testField2',
          isBookmarked: false,
          description: 'testField2 Description',
          breadcrumbs: [
            {
              id: '21',
              label: 'Schema 2',
              domainType: CatalogueItemDomainType.DataClass,
            },
            {
              id: '22',
              label: 'Class 2',
              domainType: CatalogueItemDomainType.DataClass,
            },
          ],
        },
      ];

      harness.component.config = {
        fields: {
          testField1: {
            name: 'testField1',
            type: 'terminology',
          },
          testField2: {
            name: 'testField2',
            type: 'terminology',
          },
        },
      };

      harness.component.ngOnInit();
      const expected = {
        'Schema 1.Class 1.testField1': 'testField1 Description',
        'Schema 2.Class 2.testField2': 'testField2 Description',
      };
      expect(harness.component.descriptions).toStrictEqual(expected);
    });

    describe('model changed', () => {
      it('should raise an event when the query changes', () => {
        const spy = jest.spyOn(harness.component.queryChange, 'emit');

        const query: QueryCondition = {
          condition: 'or',
          rules: [
            {
              field: 'test',
              operator: '=',
              value: 'value',
            },
          ],
        };

        harness.component.modelChanged(query);
        expect(spy).toHaveBeenCalledWith(query);
      });
    });

    describe('term search changed', () => {
      const options = mapModelDataTypeToOptionsArray({
        id: '123',
        domainType: CatalogueItemDomainType.ModelDataType,
        label: 'data type',
        modelResourceDomainType: CatalogueItemDomainType.Terminology,
        modelResourceId: '456',
      });

      const rule: Rule = {
        field: 'test-field',
      };

      it('should set returned term search results', () => {
        const expectedResults: AutocompleteSelectOptionSet = {
          count: 10,
          options: [
            {
              name: 'definition',
              value: {
                domainType: CatalogueItemDomainType.Term,
                definition: 'definition',
                code: 'code',
              },
            },
          ],
        };

        expect(harness.component.termSearchResults[rule.field ?? '']).toBeUndefined();

        terminologyStub.listTerms.mockImplementationOnce(() => {
          return of({
            count: expectedResults.count,
            items: expectedResults.options.map((opt) => opt.value),
          });
        });

        harness.component.termSearchChanged('search value', rule, options);

        expect(harness.component.termSearchResults[rule.field ?? '']).toStrictEqual(
          expectedResults
        );
      });
    });
  });
});
