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
import { InjectionToken } from '@angular/core';
import {
  CatalogueItemDomainType,
  DataClass,
  DataModel,
} from '@maurodatamapper/mdm-resources';

export const isDataModel = (item: DataModel | DataClass): item is DataModel =>
  item.domainType === CatalogueItemDomainType.DataModel;

export const isDataClass = (item: DataModel | DataClass): item is DataClass =>
  item.domainType === CatalogueItemDomainType.DataClass;

export interface CatalogueConfiguration {
  rootDataModelPath: string;
}

export const CATALOGUE_CONFIGURATION = new InjectionToken<CatalogueConfiguration>(
  'CatalogueConfiguration'
);
