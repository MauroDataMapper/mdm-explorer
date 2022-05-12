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
  CatalogueItemSearchResponse,
  CatalogueItemSearchResult,
  DataClass,
  DataClassDetail,
  DataClassDetailResponse,
  DataClassIndexParameters,
  DataClassIndexResponse,
  DataElement,
  DataElementDetail,
  DataElementIndexParameters,
  DataElementIndexResponse,
  DataModel,
  DataModelCreatePayload,
  DataModelDetail,
  DataModelDetailResponse,
  DataModelFull,
  DataModelFullResponse,
  DataModelIndexResponse,
  DataModelIntersection,
  DataModelIntersectionResponse,
  DataModelSubsetPayload,
  MdmIndexBody,
  SearchQueryParameters,
  SourceTargetIntersection,
  SourceTargetIntersectionPayload,
  SourceTargetIntersectionResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs';
import { DataElementBasic } from '../data-explorer/data-explorer.types';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { DataClassIdentifier, isDataClass } from './mauro.types';

/**
 * Service to handle data interactions with Data Models and related items, such as Data Classes.
 */
@Injectable({
  providedIn: 'root',
})
export class DataModelService {
  constructor(private endpoints: MdmEndpointsService) {}

  /**
   * Gets a Data Model based on the full path to the model in the catalogue.
   *
   * @param path The full path to the data model.
   * @returns An observable which returns a {@link DataModelDetail}.
   */
  getDataModel(path: string): Observable<DataModelDetail> {
    return this.endpoints.catalogueItem
      .getPath('folders', path)
      .pipe(map((response: DataModelDetailResponse) => response.body));
  }

  /**
   * Gets a collection of Data Classes from a parent catalogue item.
   * The parent could be either a Data Model or parent Data Class.
   *
   * @param parent The parent containing the requested data classes.
   * @returns An observable which returns a list of {@link DataClass} objects.
   */
  getDataClasses(parent: DataModel | DataClass): Observable<DataClass[]> {
    if (!parent || !parent.id) {
      return of([]);
    }

    if (isDataClass(parent) && !parent.model) {
      return of([]);
    }

    const options: DataClassIndexParameters = {
      // Ideally we should be setting `all: true` but there is a bug on the backend which will end up returning _all_
      // data classes for a data model, including children. We only one one level of data class at a time, so
      // for now set a very large maximum instead
      max: 9999,
    };

    const request$: Observable<DataClassIndexResponse> = isDataClass(parent)
      ? this.endpoints.dataClass.listChildDataClasses(parent.model!, parent.id, options) // eslint-disable-line @typescript-eslint/no-non-null-assertion
      : this.endpoints.dataClass.list(parent.id, options);

    return request$.pipe(map((response) => response.body.items));
  }

  /**
   * Gets a specific Data Class using the identifiers provided.
   *
   * @param id The identifiers required to locate the Data Class. These comprise the tuple of: Data Model ID, Data Class ID,
   * and (optionally) parent Data Class ID.
   * @returns An observable containing the full {@link DataClassDetail}.
   */
  getDataClass(id: DataClassIdentifier): Observable<DataClassDetail> {
    const request$: Observable<DataClassDetailResponse> = id.parentDataClassId
      ? this.endpoints.dataClass.getChildDataClass(
          id.dataModelId,
          id.parentDataClassId,
          id.dataClassId
        )
      : this.endpoints.dataClass.get(id.dataModelId, id.dataClassId);

    return request$.pipe(map((response) => response.body));
  }

  /**
   * Gets the Data Elements from a Data Class.
   *
   * @param id The identifiers required to locate the Data Class.
   * @param params Optional parameters to control the resulting list
   * @returns An observable of {@link DataElement} objects, including the total number found.
   */
  getDataElements(
    id: DataClassIdentifier,
    params?: DataElementIndexParameters
  ): Observable<MdmIndexBody<DataElement>> {
    return this.endpoints.dataElement
      .list(id.dataModelId, id.dataClassId, params)
      .pipe(map((response: DataElementIndexResponse) => response.body));
  }

  /**
   * Get one Data Element
   *
   * @param dataModelId
   * @param dataClassId
   * @param dataElementId
   * @returns An observable of {@link DataElementDetailResponse}
   */
  getDataElement(
    dataModelId: Uuid,
    dataClassId: Uuid,
    dataElementId: Uuid
  ): Observable<DataElementDetail> {
    return this.endpoints.dataElement
      .get(dataModelId, dataClassId, dataElementId)
      .pipe(map((response: DataElementDetail) => response.body));
  }

  /**
   * Search a Data Model for child catalogue items (Data Classes, Data Elements and Data Types etc)
   * and return the results.
   *
   * @param id The ID of the root Data Model to search.
   * @param params The parameters to control the search.
   * @returns An observable of {@link CatalogueItemSearchResult} objects, including the total number found.
   */
  searchDataModel(
    id: Uuid,
    params: SearchQueryParameters
  ): Observable<MdmIndexBody<CatalogueItemSearchResult>> {
    return this.endpoints.dataModel
      .search(id, params)
      .pipe(map((response: CatalogueItemSearchResponse) => response.body));
  }

  /**
   * Get the data models contained in the given parent folder.
   *
   * @param folderId the parent folder of the dataModels you want to retrieve.
   * @returns An observable containing an array of {@link DataModel} objects contained in the parent folder.
   */
  listInFolder(folderId: string): Observable<DataModel[]> {
    return this.endpoints.dataModel
      .listInFolder(folderId)
      .pipe(map((response: DataModelIndexResponse) => response.body.items));
  }

  /**
   * Adds a data model as a child to the folder.
   *
   * @param folderId the parent folder of the dataModel you want to add.
   * @returns An observable of {@link DataModel} object just added.
   */
  addToFolder(
    folder: Uuid,
    dataModelCreatePayload: DataModelCreatePayload
  ): Observable<DataModelDetail> {
    return this.endpoints.dataModel
      .addToFolder(folder, dataModelCreatePayload)
      .pipe(map((response: DataModelDetailResponse) => response.body));
  }

  /**
   * Copy a subset of a Data Model to another Data Model. Define which Data Elements to add/remove and the related
   * schema will also be copied to the target as well.
   *
   * @param sourceId The unique identifier of the source Data Model to copy from.
   * @param targetId The unique identifier of the source Data Model to copy to.
   * @param payload The unique identifier of the source Data Model to copy from.
   * @returns An observable containing the target Data Model.
   */
  copySubset(
    sourceId: Uuid,
    targetId: Uuid,
    payload: DataModelSubsetPayload
  ): Observable<DataModelDetail> {
    return this.endpoints.dataModel
      .copySubset(sourceId, targetId, payload)
      .pipe(map((response: DataModelDetailResponse) => response.body));
  }

  /**
   * Gets the hierarchical information of a Data Model, including Data Types, Classes and Elements.
   *
   * @param id The ID of the root Data Model to get.
   * @returns The full hierarchy details of the Data Model as a {@link DataModelFull} object.
   */
  getDataModelHierarchy(id: Uuid): Observable<DataModelFull> {
    return this.endpoints.dataModel
      .hierarchy(id)
      .pipe(map((response: DataModelFullResponse) => response.body));
  }

  /**
   * Gets all Data Elements within a Data Class and all potential child Data Classes, flattened as one
   * list.
   *
   * @param dataClass The Data Class to inspect.
   * @returns A flattened array of {@link DataElement} objects.
   */
  getDataElementsForDataClass(dataClass: DataClass): Observable<DataElement[]> {
    return this.getDataClasses(dataClass).pipe(
      switchMap((childDataClasses: DataClass[]) => {
        // If this is a parent DataClass then fetch all DataElements in that plus every child DataClass
        // If this is a child DataClass, only the DataElements from that class will be fetched
        const allClasses = [dataClass, ...childDataClasses];
        const elements$ = allClasses.map((dc) =>
          this.getDataElements({
            dataClassId: dc.id ?? '',
            dataModelId: dc.model ?? '',
            parentDataClassId: dc.parentDataClass,
          }).pipe(map((response) => response.items))
        );

        return forkJoin(elements$);
      }),
      map((dataElements) => dataElements.flatMap((de) => de))
    );
  }

  /**
   * Gets the list of Data Elements which are selected in the request model
   *
   * @param sourceDataModelId
   * @param targetDataModelId
   * @returns An observable of {@link DataModelIntersection}.
   */
  getIntersection(
    sourceDataModelId: Uuid,
    targetDataModelId: Uuid
  ): Observable<DataModelIntersection> {
    return this.endpoints.dataModel
      .intersects(sourceDataModelId, targetDataModelId)
      .pipe(map((response: DataModelIntersectionResponse) => response.body));
  }

  /**
   * Gets the list of Data Elements which are selected in the request model
   *
   * @param sourceDataModelId
   * @param data
   * @returns An observable of {@link DataModelIntersection}.
   */
  getIntersectionMany(
    sourceDataModelId: Uuid,
    data: SourceTargetIntersectionPayload
  ): Observable<MdmIndexBody<SourceTargetIntersection>> {
    return this.endpoints.dataModel
      .intersectsMany(sourceDataModelId, data)
      .pipe(map((response: SourceTargetIntersectionResponse) => response.body));
  }

  deleteDataElement(dataElement: DataElementBasic): any {
    return this.endpoints.dataElement.remove(
      dataElement.dataModelId,
      dataElement.dataClassId,
      dataElement.id
    );
  }

  /**
   * Create the next version of a finalised Data Model to make edits in draft model again.
   *
   * @param model The Data Model to create the next version for.
   * @returns An observable containing the {@link DataModel} of the new draft version based off of `model`.
   */
  createNextVersion(model: DataModel): Observable<DataModelDetail> {
    if (!model.id) {
      return throwError(() => new Error('No data model id provided'));
    }

    if (!model.modelVersion) {
      return throwError(() => new Error(`Data model "${model.label}" is not finalised`));
    }

    return this.endpoints.dataModel
      .newBranchModelVersion(model.id, {})
      .pipe(map((response: DataModelDetailResponse) => response.body));
  }
}
