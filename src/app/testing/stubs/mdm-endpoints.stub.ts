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
import {
  createApiPropertiesStub,
  MdmApiPropertiesResourceStub,
} from './mdm-resources/api-properties-resource.stub';
import {
  createCatalogueItemStub,
  MdmCatalogueItemResourceStub,
} from './mdm-resources/catalogue-item-resource.stub';
import {
  createCatalogueUserStub,
  MdmCatalogueUserResourceStub,
} from './mdm-resources/catalogue-user-resource.stub';
import {
  createDataClassStub,
  MdmDataClassResourceStub,
} from './mdm-resources/data-class-resource.stub';
import {
  createFolderStub,
  MdmFolderResourceStub,
} from './mdm-resources/folder-resource.stub';
import {
  createSecurityStub,
  MdmSecurityResourceStub,
} from './mdm-resources/security-resource-stub';
import {
  createSessionStub,
  MdmSessionResourceStub,
} from './mdm-resources/session-resource.stub';

export interface MdmEndpointsServiceStub {
  apiProperties: MdmApiPropertiesResourceStub;
  catalogueItem: MdmCatalogueItemResourceStub;
  catalogueUser: MdmCatalogueUserResourceStub;
  dataClass: MdmDataClassResourceStub;
  folder: MdmFolderResourceStub;
  security: MdmSecurityResourceStub;
  session: MdmSessionResourceStub;
}

export const createMdmEndpointsStub = (): MdmEndpointsServiceStub => {
  return {
    apiProperties: createApiPropertiesStub(),
    catalogueItem: createCatalogueItemStub(),
    catalogueUser: createCatalogueUserStub(),
    dataClass: createDataClassStub(),
    folder: createFolderStub(),
    security: createSecurityStub(),
    session: createSessionStub(),
  };
};
