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
  CatalogueItemDomainType,
  DataModel,
  Profile,
  ProfileValidationErrorList,
} from '@maurodatamapper/mdm-resources';
import { Observable, of } from 'rxjs';
import { ProfileService } from '../mauro/profile.service';

@Injectable({
  providedIn: 'root',
})
export class CoreTableProfileService {
  private readonly queryBuilderProfileNamespace =
    'uk.ac.ox.softeng.maurodatamapper.plugins.explorer.querybuilder';
  private readonly queryBuilderCoreTableProfileName =
    'QueryBuilderCoreTableProfileProviderService';

  constructor(private profileService: ProfileService) {}

  public getQueryBuilderCoreTableProfile(
    dataModel: DataModel
  ): Observable<Profile | undefined> {
    const requestOptions = {
      handleGetErrors: false,
    };

    if (dataModel.id) {
      return this.profileService.get(
        CatalogueItemDomainType.DataModel,
        dataModel.id,
        this.queryBuilderProfileNamespace,
        this.queryBuilderCoreTableProfileName,
        requestOptions
      );
    }
    return of({} as Profile);
  }

  public validateQueryBuilderCoreTableProfile(
    profile: Profile,
    dataModel: DataModel
  ): Observable<ProfileValidationErrorList> {
    return this.profileService.validate(
      CatalogueItemDomainType.DataModel,
      dataModel.id ?? '',
      this.queryBuilderProfileNamespace,
      this.queryBuilderCoreTableProfileName,
      profile
    );
  }

  public saveQueryBuilderCoreTableProfile(
    dataModel: DataModel,
    coreTableProfile: Profile | undefined
  ): Observable<Profile | undefined> {
    if (!coreTableProfile) {
      return of(undefined);
    }
    if (dataModel.id) {
      return this.profileService.save(
        CatalogueItemDomainType.DataModel,
        dataModel.id,
        this.queryBuilderProfileNamespace,
        this.queryBuilderCoreTableProfileName,
        coreTableProfile
      );
    }
    return of({} as Profile);
  }
}
