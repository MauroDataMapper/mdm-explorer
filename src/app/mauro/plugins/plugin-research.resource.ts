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
  MdmResource,
  MdmResourcesConfiguration,
  MdmResponse,
  MdmRestHandler,
  RequestSettings,
  Uuid,
} from '@maurodatamapper/mdm-resources';

export interface PluginResearchContactPayload {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  organisation?: string;
  subject: string;
  message: string;
}

export type PluginResearchContactResponse = MdmResponse<PluginResearchContactPayload>;

/**
 * Custom Mauro resource for mdm-plugin-research.
 */
export class MdmPluginResearchResource extends MdmResource {
  constructor(resourcesConfig?: MdmResourcesConfiguration, restHandler?: MdmRestHandler) {
    super(resourcesConfig, restHandler);
  }

  /**
   * `HTTP POST` - Sends a contact form to a receipient.
   *
   * @param data The payload of the request containing all the details to send.
   * @param options Optional REST handler parameters, if required.
   * @returns The result of the `POST` request.
   *
   * `200 OK` - will return a {@link PluginResearchContactResponse} containing the {@link PluginResearchContactPayload} object.
   */
  contact(data: PluginResearchContactPayload, options?: RequestSettings) {
    const url = `${this.apiEndpoint}/contact`;
    return this.simplePost(url, data, options);
  }

  /**
   * `HTTP PUT` - Submit an access request to the data owner for further processing.
   *
   * @param id The unique identifier of the Data Request (Data Model) to submit.
   * @param options Optional REST handler parameters, if required.
   * @returns The result of the `PUT` request:
   *
   * `200 OK` - will return an empty response. The HTTP status explains that it was successful.
   */
  submitRequest(id: Uuid, options?: RequestSettings) {
    const url = `${this.apiEndpoint}/researchAccessRequest/${id}`;
    return this.simplePut(url, null, options);
  }

  /**
   * `HTTP POST` - Get, or create if none exists, a folder in which to keep a user's requests
   *
   * @param options Optional REST handler parameters, if required.
   * @returns The result of the `POST` request:
   *
   * `200 OK` - will return an folder detail response. The HTTP status explains that it was successful.
   */
  userFolder(options?: RequestSettings) {
    const url = `${this.apiEndpoint}/explorer/userFolder`;
    return this.simplePost(url, null, options);
  }
}
