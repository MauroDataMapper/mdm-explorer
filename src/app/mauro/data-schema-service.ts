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
  DataRequest,
  DataSchema,
} from '../data-explorer/data-explorer.types';
import { DataModelService } from './data-model.service';

@Injectable({
  providedIn: 'root',
})
export class DataSchemaService {
  constructor(private dataModels: DataModelService) {}

  dataRequestClasses(dataSchemas: DataSchema[]): DataClassWithElements[] {
    const dataRequestClasses = dataSchemas.map((dataSchema) => dataSchema.dataClasses);
    return dataRequestClasses.reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
  }

  dataRequestElements(dataSchemas: DataSchema[]): DataElementSearchResult[] {
    const dataRequestElements = dataSchemas.map((dataSchema) =>
      this.dataSchemaElements(dataSchema)
    );
    return dataRequestElements.reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
  }

  dataSchemaElements(dataSchema: DataSchema): DataElementSearchResult[] {
    const dataSchemaElements = dataSchema.dataClasses.map(
      (dataClass) => dataClass.dataElements
    );
    return dataSchemaElements.reduce(
      (accumulator, value) => accumulator.concat(value),
      []
    );
  }

  loadDataSchemas(request: DataRequest): Observable<DataSchema[]> {
    return this.dataModels.getDataClasses(request as DataModel).pipe(
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
