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
  createDataElementStub,
  MdmDataElementResourceStub,
} from './mdm-resources/data-element-resource.stub';
import {
  createDataModelStub,
  MdmDataModelResourcesStub,
} from './mdm-resources/data-model-resource.stub';
import {
  createFolderStub,
  MdmFolderResourceStub,
} from './mdm-resources/folder-resource.stub';
import {
  createPluginResearchStub,
  MdmPluginResearchResourceStub,
} from './mdm-resources/plugin-research-resource.stub';
import {
  createSecurityStub,
  MdmSecurityResourceStub,
} from './mdm-resources/security-resource-stub';
import {
  createSessionStub,
  MdmSessionResourceStub,
} from './mdm-resources/session-resource.stub';
import {
  createProfileStub,
  MdmProfileResourcesStub,
} from './mdm-resources/profile-resource.stub';

export interface MdmEndpointsServiceStub {
  apiProperties: MdmApiPropertiesResourceStub;
  catalogueItem: MdmCatalogueItemResourceStub;
  catalogueUser: MdmCatalogueUserResourceStub;
  dataClass: MdmDataClassResourceStub;
  dataElement: MdmDataElementResourceStub;
  dataModel: MdmDataModelResourcesStub;
  folder: MdmFolderResourceStub;
  pluginResearch: MdmPluginResearchResourceStub;
  security: MdmSecurityResourceStub;
  session: MdmSessionResourceStub;
  profile: MdmProfileResourcesStub;
}

export const createMdmEndpointsStub = (): MdmEndpointsServiceStub => {
  return {
    apiProperties: createApiPropertiesStub(),
    catalogueItem: createCatalogueItemStub(),
    catalogueUser: createCatalogueUserStub(),
    dataClass: createDataClassStub(),
    dataElement: createDataElementStub(),
    dataModel: createDataModelStub(),
    folder: createFolderStub(),
    pluginResearch: createPluginResearchStub(),
    security: createSecurityStub(),
    session: createSessionStub(),
    profile: createProfileStub(),
  };
};
