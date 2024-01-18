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
import { Injectable } from '@angular/core';
import {
  CatalogueItem,
  CatalogueItemDomainType,
  DataType,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { QueryBuilderConfig, Option } from './query-builder/query-builder.interfaces';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import {
  DataElementSearchResult,
  DataSpecificationQueryPayload,
  QueryCondition,
  QueryExpression,
} from '../data-explorer/data-explorer.types';
import { ProfileService } from '../mauro/profile.service';

export interface QueryConfiguration {
  dataElementSearchResult: DataElementSearchResult[];
  dataSpecificationQueryPayload: Required<DataSpecificationQueryPayload> | undefined;
  config: QueryBuilderConfig;
}

export const mapModelDataTypeToOptionsArray = (dataType: DataType): Option[] => {
  return [
    {
      name: 'modelResourceDomainType',
      value: dataType.modelResourceDomainType,
    },
    {
      name: 'modelResourceId',
      value: dataType.modelResourceId,
    },
  ];
};

export const mapOptionsArrayToModelDataType = (
  options: Option[]
): Required<CatalogueItem> => {
  const domainType = options.find((o) => o.name === 'modelResourceDomainType')
    ?.value as CatalogueItemDomainType;
  const id = options.find((o) => o.name === 'modelResourceId')?.value;
  return { id, domainType };
};

@Injectable({
  providedIn: 'root',
})
export class QueryBuilderService {
  constructor(private profileService: ProfileService) {}

  public setupConfig(
    dataElements: DataElementSearchResult[],
    query?: DataSpecificationQueryPayload
  ): Observable<QueryConfiguration> {
    const dataSpecifications$ = dataElements.map((dataElement) => {
      const profile$ = this.getQueryBuilderDatatype(dataElement.dataType).pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of({} as Profile);
          }

          throw error;
        })
      );

      const dataElement$ = of(dataElement);

      return forkJoin([profile$, dataElement$]);
    });

    return forkJoin(dataSpecifications$).pipe(
      map((items) => {
        return this.getQueryFields(items, dataElements, query);
      })
    );
  }

  /**
   * Identify the schema and class of a data element and use that as the entity for a field.
   */
  public getEntity(dataElement: DataElementSearchResult) {
    return dataElement.breadcrumbs
      ?.filter((bc) => bc.domainType !== CatalogueItemDomainType.DataModel)
      .map((bc) => bc.label)
      .join('.');
  }

  private getQueryBuilderDatatype(dataType?: DataType): Observable<Profile> {
    if (dataType?.domainType === CatalogueItemDomainType.PrimitiveType) {
      const requestOptions = {
        handleGetErrors: false,
      };

      return this.profileService.get(
        CatalogueItemDomainType.PrimitiveType,
        dataType?.id ?? '',
        'uk.ac.ox.softeng.maurodatamapper.plugins.explorer.querybuilder',
        'QueryBuilderPrimitiveTypeProfileProviderService',
        requestOptions
      );
    }
    return of({} as Profile);
  }

  private getDataTypeString(data: Profile, dataElement: DataElementSearchResult) {
    if (
      dataElement.dataType?.domainType === CatalogueItemDomainType.ModelDataType &&
      (dataElement.dataType?.modelResourceDomainType ===
        CatalogueItemDomainType.Terminology ||
        dataElement.dataType?.modelResourceDomainType === CatalogueItemDomainType.CodeSet)
    ) {
      return 'terminology';
    }

    if (dataElement.dataType?.enumerationValues?.length ?? 0 > 0) {
      return 'category';
    }

    if (data?.sections?.length > 0) {
      return data.sections[0].fields[0].currentValue;
    }

    return undefined;
  }

  private getFieldOptions(dataElement: DataElementSearchResult): Option[] {
    if (dataElement.dataType?.domainType === CatalogueItemDomainType.ModelDataType) {
      // We need to store contextual information with the field to track which model refers to this field.
      // Unfortunately, a Field object has no available property to hold this info, so re-use the Options[]
      // array as a rudimentary way of storing additional data
      return mapModelDataTypeToOptionsArray(dataElement.dataType);
    }

    if (dataElement.dataType?.enumerationValues) {
      return dataElement.dataType.enumerationValues.map((enumValue) => {
        return {
          name: enumValue.key,
          value: enumValue.value,
        };
      });
    }

    return [];
  }

  private getDefaultValue(dataTypeString: string) {
    return dataTypeString.toLowerCase() === 'number'
      ? 0
      : dataTypeString.toLowerCase() === 'string'
      ? ''
      : dataTypeString.toLowerCase() === 'boolean'
      ? false
      : null;
  }

  private getQueryCondition(query?: DataSpecificationQueryPayload): QueryCondition {
    return query
      ? query.condition
      : {
          condition: 'and',
          rules: [],
        };
  }

  private setupQueryFieldFromMapping(
    dataTypeString: string,
    dataElement: DataElementSearchResult,
    config: QueryBuilderConfig
  ) {
    config.fields[dataElement.label] = {
      name: dataElement.label + ' (' + dataTypeString + ')',
      type: dataTypeString,
      entity: this.getEntity(dataElement),
      options: this.getFieldOptions(dataElement),
      defaultValue: this.getDefaultValue(dataTypeString),
    };
  }

  private setupQueryFieldFromQuery(
    dataElement: DataElementSearchResult,
    config: QueryBuilderConfig,
    queryCondition: QueryCondition
  ) {
    if (
      queryCondition?.rules?.find((x) =>
        (x as QueryExpression)?.field?.startsWith(dataElement.label)
      )
    ) {
      config.fields[dataElement.label] = {
        name: dataElement.label + ' (string)',
        type: 'string',
        entity: this.getEntity(dataElement),
        options: [],
        defaultValue: '',
      };
    }
  }

  private getQueryFields(
    items: [Profile, DataElementSearchResult][],
    dataElements: DataElementSearchResult[],
    query?: DataSpecificationQueryPayload
  ): QueryConfiguration {
    const queryCondition: QueryCondition = this.getQueryCondition(query);

    const config: QueryBuilderConfig = {
      fields: {},
    };

    items.forEach(([data, dataElement]) => {
      const dataTypeString = this.getDataTypeString(data, dataElement);
      if (dataTypeString) {
        this.setupQueryFieldFromMapping(dataTypeString, dataElement, config);
      } else {
        this.setupQueryFieldFromQuery(dataElement, config, queryCondition);
      }
    });

    // Identify the distinct list of entities mapped to the fields (the schema/class levels)
    // and provide these to the configuration for entity selection
    const entities = [
      ...new Set(
        Object.values(config.fields)
          .map((field) => field.entity ?? '')
          .sort((a, b) => a.localeCompare(b))
      ),
    ];
    config.entities = entities.reduce((prev, entity) => {
      return {
        ...prev,
        [entity]: {
          name: entity.replace('.', ' > '),
          value: entity,
        },
      };
    }, {});

    return {
      dataElementSearchResult: dataElements,
      dataSpecificationQueryPayload: query as Required<DataSpecificationQueryPayload>,
      config,
    };
  }
}
