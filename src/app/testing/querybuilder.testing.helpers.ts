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
import { HttpErrorResponse } from '@angular/common/http';
import {
  CatalogueItemDomainType,
  DataModel,
  DataType,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { of } from 'rxjs';
import { ProfileServiceStub } from './stubs/profile.stub';
import { cold } from 'jest-marbles';

export abstract class QueryBuilderTestingHelper {
  static defaultPrimitiveTypeProfileNamespace =
    'uk.ac.ox.softeng.maurodatamapper.plugins.explorer.querybuilder';
  static defaultPrimitiveTypeProfileServiceName =
    'QueryBuilderPrimitiveTypeProfileProviderService';
  static defaultDataModelProfileNamespace =
    'uk.ac.ox.softeng.maurodatamapper.plugins.explorer.querybuilder';
  static defaultDataModelProfileServiceName =
    'QueryBuilderPrimitiveTypeProfileProviderService';

  public static dataType_varchar: DataType = {
    id: 'dt-varchar',
    domainType: CatalogueItemDomainType.PrimitiveType,
    label: 'varchar',
  };

  public static dataType_int: DataType = {
    id: 'dt-int',
    domainType: CatalogueItemDomainType.PrimitiveType,
    label: 'int',
  };

  public static dataType_bool: DataType = {
    id: 'dt-bool',
    domainType: CatalogueItemDomainType.PrimitiveType,
    label: 'bool',
  };

  public static dataType_date: DataType = {
    id: 'dt-date',
    domainType: CatalogueItemDomainType.PrimitiveType,
    label: 'date',
  };

  public static dataType_time: DataType = {
    id: 'dt-time',
    domainType: CatalogueItemDomainType.PrimitiveType,
    label: 'time',
  };

  public static dataType_enumeration: DataType = {
    id: 'dt-enum',
    domainType: CatalogueItemDomainType.PrimitiveType,
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

  public static dataType_dataModel: DataType = {
    id: 'dt-data-model',
    domainType: CatalogueItemDomainType.DataModel,
    label: 'datamodel-dt',
    modelResourceDomainType: CatalogueItemDomainType.DataModel,
    modelResourceId: 'dm-123',
  };

  public static expectedPrimitiveTypeProfilesStubGet = (
    actualCatalogueItemDomainType: CatalogueItemDomainType,
    actualCatalogueItemId: string,
    actualProfileNamespace: string,
    actualProfileName: string,
    expectedCatalogueItemId: string
  ) => {
    expect(actualCatalogueItemDomainType).toBe(CatalogueItemDomainType.PrimitiveType);
    expect(actualCatalogueItemId).toBe(expectedCatalogueItemId);
    expect(actualProfileNamespace).toBe(
      QueryBuilderTestingHelper.defaultPrimitiveTypeProfileNamespace
    );
    expect(actualProfileName).toBe(
      QueryBuilderTestingHelper.defaultPrimitiveTypeProfileServiceName
    );
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
      id: dataType.id ?? '',
      label: dataType.label,
      domainType,
    };
  };

  public static expectedDataModelProfilesStubGet = (
    actualCatalogueItemDomainType: CatalogueItemDomainType,
    actualCatalogueItemId: string,
    actualProfileNamespace: string,
    actualProfileName: string,
    expectedCatalogueItemId: string
  ) => {
    expect(actualCatalogueItemDomainType).toBe(CatalogueItemDomainType.DataModel);
    expect(actualCatalogueItemId).toBe(expectedCatalogueItemId);
    expect(actualProfileNamespace).toBe(
      QueryBuilderTestingHelper.defaultDataModelProfileNamespace
    );
    expect(actualProfileName).toBe(
      QueryBuilderTestingHelper.defaultDataModelProfileServiceName
    );
  };

  public static createCoreTableProfile = (
    dataModel: DataModel,
    currentValue: string
  ): Profile => {
    return {
      sections: [
        {
          name: 'Query Builder Core Table Profile',
          fields: [
            {
              fieldName: 'QueryBuilderCoreTable',
              metadataPropertyName: 'queryBuilderCoreTable',
              dataType: 'string',
              currentValue,
            },
          ],
        },
      ],
      id: dataModel.id ?? '',
      label: dataModel.label,
      domainType: CatalogueItemDomainType.DataModel,
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

  public static mockProfile(
    profilesStub: ProfileServiceStub,
    profile: Profile[],
    dataType: DataType,
    dataModel: DataModel
  ) {
    profilesStub.get.mockImplementation(
      (catalogueItemDomainType, catalogueItemId, profileNamespace, profileName) => {
        if (catalogueItemDomainType === CatalogueItemDomainType.PrimitiveType) {
          QueryBuilderTestingHelper.expectedPrimitiveTypeProfilesStubGet(
            catalogueItemDomainType,
            catalogueItemId,
            profileNamespace,
            profileName,
            dataType.id ?? ''
          );
          return cold(
            dataType.domainType !== CatalogueItemDomainType.PrimitiveType ? 'a|' : '--a|',
            {
              a: QueryBuilderTestingHelper.getProfile(profile, dataType.label),
            }
          );
        } else {
          return cold('--a|', {
            a: QueryBuilderTestingHelper.getProfile(profile, dataModel.label),
          });
        }
      }
    );

    profilesStub.validate.mockImplementation(() => {
      return cold(
        dataType.domainType !== CatalogueItemDomainType.DataModel ? 'a|' : '--a|',
        {
          a: {
            total: 0,
            fieldTotal: 0,
            errors: [],
          },
        }
      );
    });

    profilesStub.save.mockImplementation((...args) => {
      const [data] = args.slice(-1); // Get the last argument (data)
      return cold(
        dataType.domainType !== CatalogueItemDomainType.DataModel ? 'a|' : '--a|',
        {
          a: data,
        }
      );
    });
  }
}
