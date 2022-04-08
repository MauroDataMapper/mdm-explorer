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
  DataClass,
  DataClassIndexResponse,
  DataElement,
  DataElementIndexParameters,
  MdmIndexBody,
} from '@maurodatamapper/mdm-resources';
import { from, merge, mergeMap, Observable, of, OperatorFunction, toArray } from 'rxjs';
import { ExceptionService } from '../core/exception.service';
import { DataModelService } from './data-model.service';
import { DataClassIdentifier } from './mauro.types';
import { MdmEndpointsService } from './mdm-endpoints.service';

@Injectable({
  providedIn: 'root',
})
export class DataClassService {
  constructor(
    private endpointsService: MdmEndpointsService,
    private exceptionService: ExceptionService,
    private dataModelService: DataModelService
  ) {}

  /**
   * returns Observable<DataClass>.
   * Creates an observable from the provided DataClass object which contains all
   * child DataClasses recursively. The output stream includes the provided data class.
   *
   * @param foundDataClass: DataClass (usually selected by the user)
   * @param errors: string[] to which exception messages can be added.
   * @returns Observable<DataClass>
   */
  getAllChildDataClasses(
    foundDataClass: DataClass,
    errors: string[]
  ): Observable<DataClass> {
    const childDataClasses = this.endpointsService.dataClass
      .listChildDataClasses(foundDataClass.model!, foundDataClass.id!) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      .pipe(
        mergeMap((response: any) => {
          const childClasses = (response as DataClassIndexResponse).body
            .items as DataClass[];
          return from(childClasses);
        }),
        this.exceptionService.catchAndReportPipeError(errors),
        mergeMap((dataClass: DataClass) => {
          return this.getAllChildDataClasses(dataClass, errors);
        }),
        this.exceptionService.catchAndReportPipeError(errors)
      );
    return merge(
      childDataClasses as Observable<DataClass>,
      of(foundDataClass)
    ) as Observable<DataClass>;
  }

  /**
   * returns pipe operator: source is DataClass, result is DataElement[].
   * Finds all the data elements that are children of the source data classes and flattens/batches
   * them into a single array. There is no check for duplicates in the output stream.
   *
   * @param errors: string[] to which exception messages can be added.
   * @returns Observable<DataModelDetail> of the new data model
   */
  public getElementsFromDataClasses(
    errors: any[]
  ): OperatorFunction<DataClass, DataElement[]> {
    const queryParams: DataElementIndexParameters = {
      all: true,
    };
    return (source: Observable<DataClass>): Observable<DataElement[]> => {
      return source.pipe(
        mergeMap((foundClass: DataClass) => {
          const dataClassIdent: DataClassIdentifier = {
            dataModelId: foundClass.model!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
            dataClassId: foundClass.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
          };
          return this.dataModelService.getDataElements(dataClassIdent, queryParams);
        }),
        this.exceptionService.catchAndReportPipeError(errors), // eslint-disable-line @typescript-eslint/no-unsafe-argument
        mergeMap((elementsResponse: MdmIndexBody<DataElement>) => {
          return from(
            (elementsResponse as { count: number; items: DataElement[] }).items
          );
        }),
        toArray()
      );
    };
  }
}
