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
import { map, Observable } from 'rxjs';
import { MdmEndpointsService } from './mdm-endpoints.service';
import {
  PluginResearchContactPayload,
  PluginResearchContactResponse,
} from './plugins/plugin-research.resource';

@Injectable({
  providedIn: 'root',
})
export class ResearchPluginService {
  constructor(private endpoints: MdmEndpointsService) {}

  contact(data: PluginResearchContactPayload): Observable<PluginResearchContactPayload> {
    return this.endpoints.pluginResearch
      .contact(data)
      .pipe(map((response: PluginResearchContactResponse) => response.body));
  }
}