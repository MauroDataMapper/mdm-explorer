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
import { Injectable } from '@angular/core';
import {
  CatalogueItemDomainType,
  DataType,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { catchError, forkJoin, map, Observable, of } from 'rxjs';
import {
  DataElementSearchResult,
  DataRequestQueryPayload,
  QueryCondition,
  QueryExpression,
} from '../data-explorer/data-explorer.types';
import { ProfileService } from './profile.service';

export interface QueryConfiguration {
  dataElementSearchResult: DataElementSearchResult[];
  dataRequestQueryPayload: Required<DataRequestQueryPayload> | undefined;
  config: QueryBuilderConfig;
}

@Injectable({
  providedIn: 'root',
})
export class QueryBuilderService {
  constructor(private profileService: ProfileService) {}

  public setupConfig(
    dataElements: DataElementSearchResult[],
    query?: DataRequestQueryPayload
  ): Observable<QueryConfiguration> {
    const requests$ = dataElements.map((dataElement) => {
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

    return forkJoin(requests$).pipe(
      map((items) => {
        return this.getQueryFields(items, dataElements, query);
      })
    );
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
    return dataElement.dataType?.enumerationValues?.length ?? 0 > 0
      ? 'category'
      : data?.sections?.length > 0
      ? data.sections[0].fields[0].currentValue
      : undefined;
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

  private getQueryCondition(query?: DataRequestQueryPayload): QueryCondition {
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
      options: (dataElement.dataType?.enumerationValues ?? []).map((dataOption) => {
        return {
          name: dataOption.key,
          value: dataOption.value,
        };
      }),
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
        options: [],
        defaultValue: '',
      };
    }
  }

  private getQueryFields(
    items: [Profile, DataElementSearchResult][],
    dataElements: DataElementSearchResult[],
    query?: DataRequestQueryPayload
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

    return {
      dataElementSearchResult: dataElements,
      dataRequestQueryPayload: query as Required<DataRequestQueryPayload>,
      config,
    };
  }
}
