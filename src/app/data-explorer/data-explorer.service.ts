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
import {
  ApiProperty,
  DataModelDetail,
  ProfileField,
  ProfileSection,
} from '@maurodatamapper/mdm-resources';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import { ProfileService } from '../mauro/profile.service';
import { ApiPropertiesService } from '../mauro/api-properties.service';
import { DataExplorerConfiguration } from './data-explorer.types';
import { ResearchPluginService } from '../mauro/research-plugin.service';

export const configurationKeys = {
  category: 'Mauro Data Explorer',
  profileNamespace: 'explorer.config.profile_namespace',
  profileServiceName: 'explorer.config.profile_service_name',
};

const getExplorerApiProperty = (
  props: ApiProperty[],
  key: string,
): ApiProperty | undefined => {
  return props.find(
    (p) => p.category === configurationKeys.category && p.key === key && p.value,
  );
};

const getExplorerApiProperties = (props: ApiProperty[]) => {
  return {
    profileNamespace: getExplorerApiProperty(props, configurationKeys.profileNamespace),
    profileServiceName: getExplorerApiProperty(
      props,
      configurationKeys.profileServiceName,
    ),
  };
};

@Injectable({
  providedIn: 'root',
})
export class DataExplorerService {
  config?: DataExplorerConfiguration;

  constructor(
    private apiProperties: ApiPropertiesService,
    private profiles: ProfileService,
    private researchPlugin: ResearchPluginService,
  ) {}

  initialise(): Observable<DataExplorerConfiguration> {
    return this.apiProperties.listPublic().pipe(
      catchError((error) => {
        console.error(
          'Cannot initialise application - error when fetching configuration properties from Mauro',
        );
        return throwError(() => error);
      }),
      switchMap((properties) => {
        const explorerProps = getExplorerApiProperties(properties);

        if (!explorerProps.profileNamespace || !explorerProps.profileServiceName) {
          return throwError(() => {
            const lines = [
              'Cannot find all configuration keys in Mauro API properties',
              `Check all required properties are listed under the '${configurationKeys.category}' section and have values.`,
              'The following API properties are required:',
              '\n',
              configurationKeys.profileNamespace,
              configurationKeys.profileServiceName,
            ];
            return new Error(lines.join('\n'));
          });
        }

        this.config = {
          profileNamespace: explorerProps.profileNamespace.value,
          profileServiceName: explorerProps.profileServiceName.value,
        };

        return of(this.config);
      }),
    );
  }

  getRootDataModel(): Observable<DataModelDetail> {
    return this.researchPlugin.rootDataModel();
  }

  getProfileFieldsForFilters(): Observable<ProfileField[]> {
    if (!this.config) {
      return throwError(
        () => new Error('DataExplorerService.initialise() has not been invoked'),
      );
    }

    return this.profiles
      .definition(this.config.profileNamespace, this.config.profileServiceName)
      .pipe(
        map((definition) => {
          // Filters only support "enumeration" data types for now, this could change later though
          return definition.sections
            .flatMap((section: ProfileSection) => section.fields)
            .filter((field: ProfileField) => field.dataType === 'enumeration');
        }),
      );
  }
}
