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

/* eslint-disable @typescript-eslint/member-ordering */

import {
  CatalogueItemDomainType,
  DataModel,
  DataType,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { ProfileService } from '../mauro/profile.service';
import { QueryBuilderWrapperService, QueryConfiguration } from './query-builder-wrapper.service';
import {
  DataElementSearchResult,
  DataSpecification,
  DataSpecificationQueryPayload,
} from './data-explorer.types';
import { QueryBuilderConfig } from './query-builder/query-builder.interfaces';
import { createProfileServiceStub } from '../testing/stubs/profile.stub';
import { QueryBuilderTestingHelper } from '../testing/querybuilder.testing.helpers';
describe('QueryBuilderService', () => {
  let service: QueryBuilderWrapperService;
  const profilesStub = createProfileServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(QueryBuilderWrapperService, {
      providers: [
        {
          provide: ProfileService,
          useValue: profilesStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('setup config', () => {
    /* =======================================================================================================*/
    /*
      Number, String, Boolean, Date, Time, Category
    */
    it.each<[string, DataType, string | undefined, boolean, string | undefined]>([
      [
        'finds string when varchar mapped to string',
        QueryBuilderTestingHelper.dataType_varchar,
        'string',
        false,
        'string',
      ],
      [
        'finds nothing when varchar unmapped',
        QueryBuilderTestingHelper.dataType_varchar,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when varchar unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_varchar,
        undefined,
        true,
        'string',
      ],
      [
        'finds number when int mapped to number',
        QueryBuilderTestingHelper.dataType_int,
        'number',
        false,
        'number',
      ],
      [
        'finds string when int unmapped',
        QueryBuilderTestingHelper.dataType_int,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when int unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_int,
        undefined,
        true,
        'string',
      ],
      [
        'finds category when enumeration mapped to something',
        QueryBuilderTestingHelper.dataType_enumeration,
        'string',
        false,
        'category',
      ],
      [
        'finds category when enumeration unmapped',
        QueryBuilderTestingHelper.dataType_enumeration,
        undefined,
        false,
        'category',
      ],
      [
        'finds category when enumeration unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_enumeration,
        undefined,
        true,
        'category',
      ],
      [
        'finds boolean when bool mapped to boolean',
        QueryBuilderTestingHelper.dataType_bool,
        'boolean',
        false,
        'boolean',
      ],
      [
        'finds nothing when bool unmapped',
        QueryBuilderTestingHelper.dataType_bool,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when bool unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_bool,
        undefined,
        true,
        'string',
      ],
      [
        'finds date when date mapped to date',
        QueryBuilderTestingHelper.dataType_date,
        'date',
        false,
        'date',
      ],
      [
        'finds nothing when date unmapped',
        QueryBuilderTestingHelper.dataType_date,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when date unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_date,
        undefined,
        true,
        'string',
      ],
      [
        'finds time when varchar mapped to string',
        QueryBuilderTestingHelper.dataType_time,
        'time',
        false,
        'time',
      ],
      [
        'finds nothing when varchar unmapped',
        QueryBuilderTestingHelper.dataType_time,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when varchar unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_time,
        undefined,
        true,
        'string',
      ],
      [
        'finds nothing when non primitive type mapped to string',
        QueryBuilderTestingHelper.dataType_nonPrimitive,
        'string',
        false,
        undefined,
      ],
      [
        'finds nothing when non primitive type unmapped',
        QueryBuilderTestingHelper.dataType_nonPrimitive,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when non primitive type unmapped but referenced in query',
        QueryBuilderTestingHelper.dataType_nonPrimitive,
        undefined,
        true,
        'string',
      ],
      [
        'finds terminology when data type is model data type',
        QueryBuilderTestingHelper.dataType_modelDataTypeTerminology,
        undefined,
        false,
        'terminology',
      ],
      [
        'finds codeset when data type is model data type',
        QueryBuilderTestingHelper.dataType_modelDataTypeCodeset,
        undefined,
        false,
        'terminology',
      ],
    ])('%s', (_, dataType, mappedType, isReferencedInQuery, expectedMappedType) => {
      const isMapped = mappedType !== undefined;

      const coreTable = 'core_table';
      const schemaName = 'schema';
      const className = 'class';
      const entityName = `${schemaName}.${className}`;

      const expectedDataElementSearchResult: DataElementSearchResult[] = [
        {
          id: 'f-1',
          label: 'field',
          dataType,
          breadcrumbs: [
            {
              domainType: CatalogueItemDomainType.DataClass,
              label: schemaName,
            },
            {
              domainType: CatalogueItemDomainType.DataClass,
              label: className,
            },
          ],
        } as DataElementSearchResult,
      ];

      const expectedQuery: DataSpecificationQueryPayload | undefined = isReferencedInQuery
        ? ({
            condition: {
              condition: 'and',
              rules: [
                {
                  field: `field (${expectedMappedType})`,
                  operator: '=',
                  value: 'value-1',
                },
              ],
            },
          } as DataSpecificationQueryPayload)
        : undefined;

      const expectedQueryBuilderConfig: QueryBuilderConfig = {
        fields:
          expectedMappedType !== undefined
            ? {
                field: {
                  defaultValue:
                    expectedMappedType === 'number'
                      ? 0
                      : expectedMappedType === 'string'
                      ? ''
                      : expectedMappedType === 'boolean'
                      ? false
                      : null,
                  name: `field (${expectedMappedType})`,
                  entity: entityName,
                  options:
                    expectedMappedType === 'category'
                      ? [
                          { name: 'Option 1', value: 'Option 1' },
                          { name: 'Option 2', value: 'Option 2' },
                        ]
                      : expectedMappedType === 'terminology'
                      ? [
                          {
                            name: 'modelResourceDomainType',
                            value: dataType.modelResourceDomainType,
                          },
                          { name: 'modelResourceId', value: dataType.modelResourceId },
                        ]
                      : [],
                  type: expectedMappedType,
                },
              }
            : ({} as any),
        entities:
          expectedMappedType !== undefined
            ? {
                [entityName]: {
                  name: `${schemaName} > ${className}`,
                  value: entityName,
                },
              }
            : ({} as any),
        coreEntityName: coreTable,
      };

      const dataSpecification: DataSpecification = {
        id: '1',
        label: 'data specification',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'draft',
      };

      const profiles: Profile[] = isMapped
        ? dataType.domainType !== CatalogueItemDomainType.PrimitiveType
          ? [QueryBuilderTestingHelper.createMappingProfile(dataType, mappedType)]
          : [
              QueryBuilderTestingHelper.createMappingProfile(
                dataType,
                mappedType,
                CatalogueItemDomainType.ReferenceType
              ),
            ]
        : [];

      profiles.push(
        QueryBuilderTestingHelper.createCoreTableProfile(dataSpecification as DataModel, coreTable)
      );

      const mockProfile = (profile: Profile[]) => {
        QueryBuilderTestingHelper.mockProfile(
          profilesStub,
          profile,
          dataType,
          dataSpecification as DataModel
        );
      };

      const expectedResult: QueryConfiguration = {
        dataElementSearchResult: expectedDataElementSearchResult,
        dataSpecificationQueryPayload: expectedQuery as Required<DataSpecificationQueryPayload>,
        config: expectedQueryBuilderConfig,
      };

      mockProfile(profiles);

      const expected$ = cold('---(a|)', {
        a: expectedResult,
      });

      const actual$ = service.setupConfig(
        dataSpecification as DataModel,
        expectedDataElementSearchResult,
        expectedQuery
      );

      expect(actual$).toBeObservable(expected$);
    });
  });
});
