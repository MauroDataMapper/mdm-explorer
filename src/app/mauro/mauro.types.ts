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
  DataClass,
  DataElement,
  DataModel,
  Uuid,
} from '@maurodatamapper/mdm-resources';

/**
 * Represents a generic error from an `mdm-resources` operation.
 */
export class MdmHttpError {
  constructor(public response: HttpErrorResponse) {}
}

/**
 * Represents a full identifier for a Data Class, based on parent hierarchy.
 */
export interface DataClassIdentifier {
  dataModelId: Uuid;
  parentDataClassId?: Uuid;
  dataClassId: Uuid;
}

export const isDataModel = (item: DataModel | DataClass): item is DataModel =>
  item.domainType === CatalogueItemDomainType.DataModel;

export const isDataClass = (
  item: DataModel | DataClass | DataElement
): item is DataClass => item.domainType === CatalogueItemDomainType.DataClass;

export const isDataElement = (item: DataClass | DataElement): item is DataElement =>
  item.domainType === CatalogueItemDomainType.DataElement;

export interface KeyValueIdentifier {
  id: Uuid;
  key: string;
  value: string;
}

export const getKviValue = (
  items: KeyValueIdentifier[],
  key: string,
  defaultValue: string
) => {
  return items.find((i) => i.key === key)?.value ?? defaultValue;
};
