import { Injectable } from '@angular/core';
import {
  DataClass,
  DataClassIndexResponse,
  DataElement,
  DataElementIndexParameters,
} from '@maurodatamapper/mdm-resources';
import { from, merge, mergeMap, Observable, of, OperatorFunction, toArray } from 'rxjs';
import { ExceptionService } from '../core/exception.service';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { DataClassIdentifier } from './catalogue.types';
import { DataModelService } from './data-model.service';

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
        this.exceptionService.catchAndReportPipeError(errors),
        mergeMap((elementsResponse: any) => {
          return from(
            (elementsResponse as { count: number; items: DataElement[] }).items
          );
        }),
        toArray()
      );
    };
  }
}
