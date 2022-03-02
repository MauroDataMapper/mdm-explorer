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
  MdmApiPropertyResources,
  MdmCatalogueUserResource,
  MdmCatalogueItemResource,
  MdmDataClassResource,
  MdmDataElementResource,
  MdmDataFlowResource,
  MdmDataModelResource,
  MdmDataTypeResource,
  MdmFolderResource,
  MdmPluginDoiResource,
  MdmPluginOpenIdConnectResource,
  MdmProfileResource,
  MdmResourcesConfiguration,
  MdmSecurityResource,
  MdmSessionResource,
  MdmSummaryMetadataResource,
} from '@maurodatamapper/mdm-resources';
import { MdmHttpClientService } from './mdm-http-client.service';

@Injectable({
  providedIn: 'root',
})
export class MdmEndpointsService {
  apiProperties = new MdmApiPropertyResources(this.configuration, this.httpClient);
  catalogueUser = new MdmCatalogueUserResource(this.configuration, this.httpClient);
  catalogueItem = new MdmCatalogueItemResource(this.configuration, this.httpClient);
  dataClass = new MdmDataClassResource(this.configuration, this.httpClient);
  dataElement = new MdmDataElementResource(this.configuration, this.httpClient);
  dataFlow = new MdmDataFlowResource(this.configuration, this.httpClient);
  dataModel = new MdmDataModelResource(this.configuration, this.httpClient);
  dataType = new MdmDataTypeResource(this.configuration, this.httpClient);
  folder = new MdmFolderResource(this.configuration, this.httpClient);
  pluginDoi = new MdmPluginDoiResource(this.configuration, this.httpClient);
  pluginOpenIdConnect = new MdmPluginOpenIdConnectResource(
    this.configuration,
    this.httpClient
  );
  profile = new MdmProfileResource(this.configuration, this.httpClient);
  security = new MdmSecurityResource(this.configuration, this.httpClient);
  session = new MdmSessionResource(this.configuration, this.httpClient);
  summaryMetadata = new MdmSummaryMetadataResource(this.configuration, this.httpClient);

  constructor(
    private configuration: MdmResourcesConfiguration,
    private httpClient: MdmHttpClientService
  ) {}
}
