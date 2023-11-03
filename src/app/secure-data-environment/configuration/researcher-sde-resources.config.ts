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
import { Injectable } from '@angular/core';
import { SdeResourcesConfig, SdeResourcesMode } from '@maurodatamapper/sde-resources';
import { SdeSecurity } from './sde-security';
import { SdeColors } from './sde-colors';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ResearcherSdeResourcesConfig implements SdeResourcesConfig {
  sdeSecurity = this.researcherSdeSecurity;
  sdeResourcesMode = SdeResourcesMode.RESEARCHER;
  colors = this.sdeColors;
  sdeEndpoint = environment.sdeResearcherEndpoint;

  constructor(private researcherSdeSecurity: SdeSecurity, private sdeColors: SdeColors) {}
}