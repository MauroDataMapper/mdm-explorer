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
  DataType,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { ProfileService } from '../mauro/profile.service';
import { QueryBuilderService, QueryConfiguration } from './query-builder.service';
import {
  DataElementSearchResult,
  DataRequestQueryPayload,
} from '../data-explorer/data-explorer.types';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { createProfileServiceStub } from '../testing/stubs/profile.stub';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';

const defaultCatalogueItemDomainType = CatalogueItemDomainType.PrimitiveType;
const defaultProfileNamespace =
  'uk.ac.ox.softeng.maurodatamapper.plugins.explorer.querybuilder';
const defaultProfileServiceName = 'QueryBuilderPrimitiveTypeProfileProviderService';

abstract class testHelper {
  public static dataType_varchar: DataType = {
    id: 'dt-varchar',
    domainType: defaultCatalogueItemDomainType,
    label: 'varchar',
  };

  public static dataType_int: DataType = {
    id: 'dt-int',
    domainType: defaultCatalogueItemDomainType,
    label: 'int',
  };

  public static dataType_bool: DataType = {
    id: 'dt-bool',
    domainType: defaultCatalogueItemDomainType,
    label: 'bool',
  };

  public static dataType_date: DataType = {
    id: 'dt-date',
    domainType: defaultCatalogueItemDomainType,
    label: 'date',
  };

  public static dataType_time: DataType = {
    id: 'dt-time',
    domainType: defaultCatalogueItemDomainType,
    label: 'time',
  };

  public static dataType_enumeration: DataType = {
    id: 'dt-enum',
    domainType: defaultCatalogueItemDomainType,
    label: 'enum_type',
    enumerationValues: [
      { index: 0, key: 'Option 1', value: 'Option 1' },
      { index: 1, key: 'Option 2', value: 'Option 2' },
    ],
  };

  public static dataType_nonPrimitive: DataType = {
    id: 'dt-time',
    domainType: CatalogueItemDomainType.ReferenceType,
    label: 'time',
  };

  public static dataType_modelDataTypeTerminology: DataType = {
    id: 'dt-model-terminology',
    domainType: CatalogueItemDomainType.ModelDataType,
    label: 'terminology-dt',
    modelResourceDomainType: CatalogueItemDomainType.Terminology,
    modelResourceId: 'tm-123',
  };

  public static dataType_modelDataTypeCodeset: DataType = {
    id: 'dt-model-codeset',
    domainType: CatalogueItemDomainType.ModelDataType,
    label: 'codeset-dt',
    modelResourceDomainType: CatalogueItemDomainType.CodeSet,
    modelResourceId: 'cs-123',
  };

  public static expectedProfilesStubGet = (
    actualCatalogueItemDomainType: CatalogueItemDomainType,
    actualCatalogueItemId: string,
    actualProfileNamespace: string,
    actualProfileName: string,
    expectedCatalogueItemId: string
  ) => {
    expect(actualCatalogueItemDomainType).toBe(defaultCatalogueItemDomainType);
    expect(actualCatalogueItemId).toBe(expectedCatalogueItemId);
    expect(actualProfileNamespace).toBe(defaultProfileNamespace);
    expect(actualProfileName).toBe(defaultProfileServiceName);
  };

  public static createMappingProfile = (
    dataType: DataType,
    currentValue: string,
    domainType: CatalogueItemDomainType = CatalogueItemDomainType.PrimitiveType
  ): Profile => {
    return {
      sections: [
        {
          name: 'section1',
          fields: [
            {
              fieldName: 'QueryBuilderType',
              metadataPropertyName: 'querybuildertype',
              dataType: 'enumeration',
              currentValue,
            },
          ],
        },
      ],
      id: dataType.Id ?? '',
      label: dataType.label,
      domainType,
    };
  };

  public static getProfile(profiles: Profile[], dataTypeLabel: string): DataType {
    const result = profiles.find((i) => i.label === dataTypeLabel) ?? ({} as DataType);

    if (Object.keys(result).length === 0) {
      const error = new HttpErrorResponse({
        error: new Error('404 Not Found'),
        status: 404,
      });
      return of(error) as any;
    }
    return result;
  }
}

describe('QueryBuilderService', () => {
  let service: QueryBuilderService;
  const profilesStub = createProfileServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(QueryBuilderService, {
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
        testHelper.dataType_varchar,
        'string',
        false,
        'string',
      ],
      [
        'finds nothing when varchar unmapped',
        testHelper.dataType_varchar,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when varchar unmapped but referenced in query',
        testHelper.dataType_varchar,
        undefined,
        true,
        'string',
      ],
      [
        'finds number when int mapped to number',
        testHelper.dataType_int,
        'number',
        false,
        'number',
      ],
      [
        'finds string when int unmapped',
        testHelper.dataType_int,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when int unmapped but referenced in query',
        testHelper.dataType_int,
        undefined,
        true,
        'string',
      ],
      [
        'finds category when enumeration mapped to something',
        testHelper.dataType_enumeration,
        'string',
        false,
        'category',
      ],
      [
        'finds category when enumeration unmapped',
        testHelper.dataType_enumeration,
        undefined,
        false,
        'category',
      ],
      [
        'finds category when enumeration unmapped but referenced in query',
        testHelper.dataType_enumeration,
        undefined,
        true,
        'category',
      ],
      [
        'finds boolean when bool mapped to boolean',
        testHelper.dataType_bool,
        'boolean',
        false,
        'boolean',
      ],
      [
        'finds nothing when bool unmapped',
        testHelper.dataType_bool,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when bool unmapped but referenced in query',
        testHelper.dataType_bool,
        undefined,
        true,
        'string',
      ],
      [
        'finds date when date mapped to date',
        testHelper.dataType_date,
        'date',
        false,
        'date',
      ],
      [
        'finds nothing when date unmapped',
        testHelper.dataType_date,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when date unmapped but referenced in query',
        testHelper.dataType_date,
        undefined,
        true,
        'string',
      ],
      [
        'finds time when varchar mapped to string',
        testHelper.dataType_time,
        'time',
        false,
        'time',
      ],
      [
        'finds nothing when varchar unmapped',
        testHelper.dataType_time,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when varchar unmapped but referenced in query',
        testHelper.dataType_time,
        undefined,
        true,
        'string',
      ],
      [
        'finds nothing when non primitive type mapped to string',
        testHelper.dataType_nonPrimitive,
        'string',
        false,
        undefined,
      ],
      [
        'finds nothing when non primitive type unmapped',
        testHelper.dataType_nonPrimitive,
        undefined,
        false,
        undefined,
      ],
      [
        'finds string when non primitive type unmapped but referenced in query',
        testHelper.dataType_nonPrimitive,
        undefined,
        true,
        'string',
      ],
      [
        'finds terminology when data type is model data type',
        testHelper.dataType_modelDataTypeTerminology,
        undefined,
        false,
        'terminology',
      ],
      [
        'finds codeset when data type is model data type',
        testHelper.dataType_modelDataTypeCodeset,
        undefined,
        false,
        'terminology',
      ],
    ])('%s', (_, dataType, mappedType, isReferencedInQuery, expectedMappedType) => {
      const isMapped = mappedType !== undefined;

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

      const expectedQuery: DataRequestQueryPayload | undefined = isReferencedInQuery
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
          } as DataRequestQueryPayload)
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
      };

      const profiles: Profile[] = isMapped
        ? dataType.domainType !== CatalogueItemDomainType.PrimitiveType
          ? [testHelper.createMappingProfile(dataType, mappedType)]
          : [
              testHelper.createMappingProfile(
                dataType,
                mappedType,
                CatalogueItemDomainType.ReferenceType
              ),
            ]
        : [];

      const mockProfile = (profile: Profile[]) => {
        profilesStub.get.mockImplementationOnce(
          (catalogueItemDomainType, catalogueItemId, profileNamespace, profileName) => {
            testHelper.expectedProfilesStubGet(
              catalogueItemDomainType,
              catalogueItemId,
              profileNamespace,
              profileName,
              dataType.id ?? ''
            );
            return cold(
              dataType.domainType !== CatalogueItemDomainType.PrimitiveType
                ? 'a|'
                : '--a|',
              {
                a: testHelper.getProfile(profile, dataType.label),
              }
            );
          }
        );
      };

      const expectedResult: QueryConfiguration = {
        dataElementSearchResult: expectedDataElementSearchResult,
        dataRequestQueryPayload: expectedQuery as Required<DataRequestQueryPayload>,
        config: expectedQueryBuilderConfig,
      };

      mockProfile(profiles);

      const expected$ = cold(
        dataType.domainType !== CatalogueItemDomainType.PrimitiveType
          ? '(a|)'
          : '---(a|)',
        {
          a: expectedResult,
        }
      );
      const actual$ = service.setupConfig(expectedDataElementSearchResult, expectedQuery);

      expect(actual$).toBeObservable(expected$);
    });
  });
});
