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
  DataModel,
  DataType,
  Profile,
  ProfileValidationErrorList,
} from '@maurodatamapper/mdm-resources';
import { QueryBuilderConfig, Option } from './query-builder/query-builder.interfaces';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import {
  DataElementSearchResult,
  DataSpecificationQueryPayload,
  QueryCondition,
  QueryExpression,
} from './data-explorer.types';
import { ProfileService } from '../mauro/profile.service';
import { CoreTableProfileService } from './core-table-profile.service';

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

export const mapOptionsArrayToModelDataType = (options: Option[]): Required<CatalogueItem> => {
  const domainType = options.find((o) => o.name === 'modelResourceDomainType')
    ?.value as CatalogueItemDomainType;
  const id = options.find((o) => o.name === 'modelResourceId')?.value;
  return { id, domainType };
};

@Injectable({
  providedIn: 'root',
})
export class QueryBuilderWrapperService {
  private readonly dataTypeProfileLabel =
    '"Mauro Data Explorer - Query Builder Data Type" (primitive type profile)';
  private readonly dataModelProfileLabel =
    '"Mauro Data Explorer - Query Builder Core Table" (data model profile)';

  constructor(
    private profileService: ProfileService,
    private coreTableProfileService: CoreTableProfileService
  ) {}

  public setupConfig(
    dataModel: DataModel,
    dataElements: DataElementSearchResult[],
    query?: DataSpecificationQueryPayload
  ): Observable<QueryConfiguration> {
    return forkJoin([
      this.getDataElementTypeProfile(dataElements),
      this.getCoreTableProfile(dataModel),
    ]).pipe(
      map(([items, coreTableProfile]) => {
        let errorMessage = '';

        errorMessage = this.appendErrorMessages(errorMessage, this.getDataTypeProfileErrors(items));

        errorMessage = this.appendErrorMessages(
          errorMessage,
          this.getCoreTableProfileErrors(coreTableProfile)
        );

        if (errorMessage !== '') {
          throw new Error(errorMessage);
        }

        if (coreTableProfile && (coreTableProfile[0]?.sections?.length ?? 0 > 0)) {
          const coreTable = coreTableProfile[0].sections[0].fields[0].currentValue;
          if (coreTable) {
            return this.getQueryFields(items, dataElements, coreTable, query);
          }
        }

        throw new Error(
          `\r\nUnknown error occurred when retrieving ${this.dataTypeProfileLabel} and ${this.dataModelProfileLabel}`
        );
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

  private getEntityAndLabel(dataElement: DataElementSearchResult) {
    const entity = this.getEntity(dataElement);
    const label = dataElement.label;
    return entity ? `${entity}.${label}` : label;
  }

  private getQueryBuilderDatatypeProfile(dataType?: DataType): Observable<Profile> {
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
      (dataElement.dataType?.modelResourceDomainType === CatalogueItemDomainType.Terminology ||
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
          entity: '',
          rules: [],
        };
  }

  private setupQueryFieldFromMapping(
    dataTypeString: string,
    dataElement: DataElementSearchResult,
    config: QueryBuilderConfig
  ) {
    config.fields[this.getEntityAndLabel(dataElement)] = {
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
    const dataElementPath = this.getEntityAndLabel(dataElement);
    if (
      queryCondition?.rules?.find((x) => (x as QueryExpression)?.field?.startsWith(dataElementPath))
    ) {
      config.fields[dataElementPath] = {
        name: dataElement.label + ' (string)',
        type: 'string',
        entity: this.getEntity(dataElement),
        options: [],
        defaultValue: '',
      };
    }
  }

  private getQueryFields(
    items: [Profile | null, DataElementSearchResult][],
    dataElements: DataElementSearchResult[],
    coreTable: string,
    query?: DataSpecificationQueryPayload
  ): QueryConfiguration {
    const queryCondition: QueryCondition = this.getQueryCondition(query);

    const config: QueryBuilderConfig = {
      fields: {},
    };

    items.forEach(([data, dataElement]) => {
      let dataTypeString: string | undefined;

      if (data) {
        dataTypeString = this.getDataTypeString(data, dataElement);
      }

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

    config.coreEntityName = coreTable;

    return {
      dataElementSearchResult: dataElements,
      dataSpecificationQueryPayload: query as Required<DataSpecificationQueryPayload>,
      config,
    };
  }

  private getDataElementTypeProfile(dataElements: DataElementSearchResult[]) {
    const dataElementTypeProfileObservables = dataElements.map((dataElement) => {
      const profile$ = this.getQueryBuilderDatatypeProfile(dataElement.dataType).pipe(
        catchError((error) => {
          if (error.status === 404) {
            return of(null);
          }

          throw error;
        })
      );

      const dataElement$ = of(dataElement);

      return forkJoin([profile$, dataElement$]);
    });

    return forkJoin(dataElementTypeProfileObservables);
  }

  private getCoreTableProfile(
    dataModel: DataModel
  ): Observable<[Profile, ProfileValidationErrorList] | undefined> {
    return this.coreTableProfileService.getQueryBuilderCoreTableProfile(dataModel.id).pipe(
      switchMap((coreTableProfile: Profile | undefined) => {
        if (!coreTableProfile) {
          return of(undefined);
        }
        return this.coreTableProfileService
          .validateQueryBuilderCoreTableProfile(coreTableProfile, dataModel)
          .pipe(
            switchMap((validationErrors: ProfileValidationErrorList) => {
              return forkJoin([of(coreTableProfile), of(validationErrors)]);
            })
          );
      }),
      catchError((error) => {
        if (error.status === 404) {
          return of(undefined); // Return an empty observable
        }
        throw error;
      })
    );
  }

  private getDataTypeProfileErrors(items: [Profile | null, DataElementSearchResult][]) {
    let errorMessage = '';

    items.forEach(([profile, dataElement]) => {
      profile?.sections?.forEach((section) => {
        section.fields.forEach((field) => {
          if (field.currentValue === '') {
            if (errorMessage === '') {
              errorMessage += `\r\n${this.dataTypeProfileLabel} is missing definitions for the following types:\r\n`;
            }
            if (!errorMessage.includes(dataElement.dataType?.label ?? '')) {
              errorMessage += `- ${dataElement.dataType?.label}\r\n`;
            }
          }
        });
      });
    });

    return errorMessage;
  }

  private getCoreTableProfileErrors(
    coreTableProfile: [Profile, ProfileValidationErrorList] | undefined
  ) {
    // Check core table
    let errorMessage = '';
    if (coreTableProfile) {
      const coreTableValidationErrors = coreTableProfile[1];
      if (coreTableValidationErrors.errors?.length ?? 0 > 0) {
        errorMessage += `\r\n${this.dataModelProfileLabel} for DataModel validation errors:`;
      }
      coreTableValidationErrors?.errors?.forEach((error) => {
        if (!errorMessage.includes(error.message)) {
          errorMessage += `\r\n - ${error.message}`;
        }
      });
    } else {
      errorMessage += `\r\n${this.dataModelProfileLabel} not found for DataModel`;
    }
    return errorMessage;
  }

  private appendErrorMessages(errorMessage: string, newErrorMessages: string) {
    if (errorMessage === '') {
      errorMessage += newErrorMessages;
    } else {
      errorMessage += `\r\n${newErrorMessages}`;
    }
    return errorMessage;
  }
}
