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
  FolderDetail,
  MdmIndexResponse,
  MdmResponse,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { KeyValueIdentifier } from 'src/app/mauro/mauro.types';
import {
  PluginResearchContactPayload,
  PluginResearchContactResponse,
} from 'src/app/mauro/plugins/plugin-research.resource';

export type PluginResearchContactFn = (
  data: PluginResearchContactPayload,
) => Observable<PluginResearchContactResponse>;
export type PluginResearchSubmitDataSpecificationFn = (
  id: Uuid,
) => Observable<MdmResponse<any>>;
export type PluginResearchUserFolderFn = () => Observable<MdmResponse<any>>;

export interface MdmPluginResearchResourceStub {
  contact: jest.MockedFunction<PluginResearchContactFn>;
  submitDataSpecification: jest.MockedFunction<PluginResearchSubmitDataSpecificationFn>;
  userFolder: jest.MockedFunction<PluginResearchUserFolderFn>;
  templateFolder: jest.MockedFunction<() => Observable<FolderDetail>>;
  theme: jest.MockedFunction<() => Observable<MdmIndexResponse<KeyValueIdentifier>>>;
}

export const createPluginResearchStub = (): MdmPluginResearchResourceStub => {
  return {
    contact: jest.fn() as jest.MockedFunction<PluginResearchContactFn>,
    submitDataSpecification:
      jest.fn() as jest.MockedFunction<PluginResearchSubmitDataSpecificationFn>,
    userFolder: jest.fn() as jest.MockedFunction<PluginResearchUserFolderFn>,
    templateFolder: jest.fn(),
    theme: jest.fn(),
  };
};
