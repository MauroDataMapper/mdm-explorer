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
import { Inject, Injectable } from '@angular/core';
import { DataModelDetail, ProfileField } from '@maurodatamapper/mdm-resources';
import { map, Observable } from 'rxjs';
import { DataModelService } from '../mauro/data-model.service';
import { ProfileService } from '../mauro/profile.service';
import {
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from './data-explorer.types';

@Injectable({
  providedIn: 'root',
})
export class DataExplorerService {
  constructor(
    private dataModels: DataModelService,
    private profiles: ProfileService,
    @Inject(DATA_EXPLORER_CONFIGURATION) private config: DataExplorerConfiguration
  ) {}

  getRootDataModel(): Observable<DataModelDetail> {
    return this.dataModels.getDataModel(this.config.rootDataModelPath);
  }

  getProfileFieldsForFilters(): Observable<ProfileField[]> {
    return this.profiles
      .definition(this.config.profileNamespace, this.config.profileServiceName)
      .pipe(
        map((definition) => {
          // Filters only support "enumeration" data types for now, this could change later though
          return definition.sections
            .flatMap((section) => section.fields)
            .filter((field) => field.dataType === 'enumeration');
        })
      );
  }
}
