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
import { DataClass, DataElement, DataModel } from '@maurodatamapper/mdm-resources';
import { forkJoin, map, Observable, switchMap } from 'rxjs';
import {
  DataClassWithElements,
  DataElementSearchResult,
  DataSpecification,
  DataSchema,
} from '../data-explorer/data-explorer.types';
import { DataModelService } from '../mauro/data-model.service';

@Injectable({
  providedIn: 'root',
})
export class DataSchemaService {
  constructor(private dataModels: DataModelService) {}

  /**
   * Gets all data classes (with elements as children) from a list of data schemas as a flat list.
   */
  reduceDataClassesFromSchemas(dataSchemas: DataSchema[]): DataClassWithElements[] {
    const dataSpecificationClasses = dataSchemas.map(
      (dataSchema) => dataSchema.dataClasses
    );
    return dataSpecificationClasses.reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
  }

  /**
   * Gets all data elements from a list of data schemas as a flat list.
   */
  reduceDataElementsFromSchemas(dataSchemas: DataSchema[]): DataElementSearchResult[] {
    const dataSpecificationElements = dataSchemas.map((dataSchema) =>
      this.reduceDataElementsFromSchema(dataSchema)
    );
    return dataSpecificationElements.reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
  }

  /**
   * Gets all data elements from a data schemas as a flat list.
   */
  reduceDataElementsFromSchema(dataSchema: DataSchema): DataElementSearchResult[] {
    const dataSchemaElements = dataSchema.dataClasses.map(
      (dataClass) => dataClass.dataElements
    );
    return dataSchemaElements.reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
  }

  loadDataSchemas(dataSpecification: DataSpecification): Observable<DataSchema[]> {
    return this.dataModels.getDataClasses(dataSpecification as DataModel).pipe(
      switchMap((schemas) => {
        const dataSchema = schemas.map((schema) => {
          return this.loadDataClasses(schema).pipe(
            map((dataClassWithElements) => {
              return {
                schema,
                dataClasses: dataClassWithElements,
              };
            })
          );
        });

        return forkJoin(dataSchema);
      })
    );
  }

  loadDataClasses(dataSchema: DataClass): Observable<DataClassWithElements[]> {
    return this.dataModels.getDataClasses(dataSchema).pipe(
      switchMap((dataClasses: DataClass[]) => {
        return forkJoin(
          dataClasses.map((dataClass) => this.loadDataClassElements(dataClass))
        );
      })
    );
  }

  loadDataClassElements(dataClass: DataClass): Observable<DataClassWithElements> {
    return this.dataModels.getDataElementsForDataClass(dataClass).pipe(
      map((dataElements: DataElement[]) => {
        return {
          dataClass,
          dataElements: dataElements as DataElementSearchResult[],
        };
      })
    );
  }
}
