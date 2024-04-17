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

/* eslint-disable @typescript-eslint/member-ordering */

import {
  CatalogueItemDomainType,
  DataModel,
  Profile,
  ProfileField,
  ProfileSection,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { ProfileService } from '../mauro/profile.service';
import { createProfileServiceStub } from '../testing/stubs/profile.stub';
import { QueryBuilderTestingHelper } from '../testing/querybuilder.testing.helpers';
import { CoreTableProfileService } from './core-table-profile.service';
import { HttpErrorResponse } from '@angular/common/http';
describe('CoreTableProfileService', () => {
  let service: CoreTableProfileService;
  const profilesStub = createProfileServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(CoreTableProfileService, {
      providers: [
        {
          provide: ProfileService,
          useValue: profilesStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('profile test', () => {
    it('should get a profile', () => {
      const coreTable = 'core_table';

      const rootDataModel: DataModel = {
        id: '1',
        label: 'data model',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };

      const profiles: Profile[] = [];

      profiles.push(
        QueryBuilderTestingHelper.createCoreTableProfile(rootDataModel, coreTable)
      );

      const mockProfile = (profile: Profile[]) => {
        QueryBuilderTestingHelper.mockProfile(
          profilesStub,
          profile,
          QueryBuilderTestingHelper.dataType_dataModel,
          rootDataModel
        );
      };

      mockProfile(profiles);

      const expectedResult = {
        id: '1',
        domainType: 'DataModel',
        label: 'data model',
        sections: [
          {
            name: 'Query Builder Core Table Profile',
            fields: [
              {
                currentValue: 'core_table',
                dataType: 'string',
                fieldName: 'QueryBuilderCoreTable',
                metadataPropertyName: 'queryBuilderCoreTable',
              } as ProfileField,
            ] as ProfileField[],
          } as ProfileSection,
        ] as ProfileSection[],
      } as Profile;

      const expected$ = cold('--a|', {
        a: expectedResult,
      });

      const actual$ = service.getQueryBuilderCoreTableProfile(rootDataModel as DataModel);

      expect(actual$).toBeObservable(expected$);
    });

    it('should throw a 404 if there is no matching profile', () => {
      const rootDataModel: DataModel = {
        id: '1',
        label: 'data model',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };

      const profiles: Profile[] = [];

      const mockProfile = (profile: Profile[]) => {
        QueryBuilderTestingHelper.mockProfile(
          profilesStub,
          profile,
          QueryBuilderTestingHelper.dataType_dataModel,
          rootDataModel
        );
      };

      mockProfile(profiles);

      // TODO: I could not work out the jest marbles for this test so I have
      // created an expected result that contains the frame information for the
      // inner object. Once this expected result is set test can be
      // checked using the standard jest marbles approach.
      // If a developer knows how to write the jest marbles for this expected result
      // then please update this test.
      const expectedFrameResults = [
        {
          frame: 0,
          notification: {
            error: undefined,
            kind: 'N',
            value: new HttpErrorResponse({
              error: new Error('404 Not Found'),
              status: 404,
            }),
          },
        },
        {
          frame: 0,
          notification: {
            error: undefined,
            kind: 'C',
            value: undefined,
          },
        },
      ];

      const expected$ = cold('--a|', {
        a: expectedFrameResults,
      });

      const actual$ = service.getQueryBuilderCoreTableProfile(rootDataModel as DataModel);

      expect(actual$).toBeObservable(expected$);
    });

    it('should save a profile', () => {
      const rootDataModel: DataModel = {
        id: '1',
        label: 'data model',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };

      const profiles: Profile[] = [];

      const mockProfile = (profile: Profile[]) => {
        QueryBuilderTestingHelper.mockProfile(
          profilesStub,
          profile,
          QueryBuilderTestingHelper.dataType_dataModel,
          rootDataModel
        );
      };

      mockProfile(profiles);

      profilesStub.save.mockImplementation(
        (domainType, catalogueItemId, profileNamespace, profileName, data) => {
          profiles.push(data);
          return cold('--a|', {
            a: data,
          });
        }
      );

      const coreTableProfile = {
        id: '1',
        domainType: 'DataModel',
        label: 'data model',
        sections: [
          {
            name: 'Query Builder Core Table Profile',
            fields: [
              {
                currentValue: 'core_table',
                dataType: 'string',
                fieldName: 'QueryBuilderCoreTable',
                metadataPropertyName: 'queryBuilderCoreTable',
              } as ProfileField,
            ] as ProfileField[],
          } as ProfileSection,
        ] as ProfileSection[],
      } as Profile;

      const expected$ = cold('--a|', {
        a: coreTableProfile,
      });

      const actual$ = service.saveQueryBuilderCoreTableProfile(
        rootDataModel as DataModel,
        coreTableProfile
      );

      expect(actual$).toBeObservable(expected$);
      expect(profiles.length).toBe(1);
      expect(profiles[0]).toBe(coreTableProfile);
    });

    it('should show profile validation errors', () => {
      const rootDataModel: DataModel = {
        id: '1',
        label: 'data model',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };

      const profiles: Profile[] = [];

      const mockProfile = (profile: Profile[]) => {
        QueryBuilderTestingHelper.mockProfile(
          profilesStub,
          profile,
          QueryBuilderTestingHelper.dataType_dataModel,
          rootDataModel
        );
      };

      mockProfile(profiles);

      profilesStub.validate.mockImplementation(() => {
        return cold('--a|', {
          a: {
            total: 1,
            fieldTotal: 1,
            errors: [
              {
                fieldName: 'QueryBuilderCoreTable',
                message: 'The field is required',
                metadataPropertyName: 'queryBuilderCoreTable',
              },
            ],
          },
        });
      });

      const coreTableProfile = {
        id: '1',
        domainType: 'DataModel',
        label: 'data model',
        sections: [
          {
            name: 'Query Builder Core Table Profile',
            fields: [
              {
                currentValue: '',
                dataType: 'string',
                fieldName: 'QueryBuilderCoreTable',
                metadataPropertyName: 'queryBuilderCoreTable',
              } as ProfileField,
            ] as ProfileField[],
          } as ProfileSection,
        ] as ProfileSection[],
      } as Profile;

      const expected = {
        errors: [
          {
            fieldName: 'QueryBuilderCoreTable',
            message: 'The field is required',
            metadataPropertyName: 'queryBuilderCoreTable',
          },
        ],
        fieldTotal: 1,
        total: 1,
      };

      const expected$ = cold('--a|', {
        a: expected,
      });

      const actual$ = service.validateQueryBuilderCoreTableProfile(
        coreTableProfile,
        rootDataModel
      );

      expect(actual$).toBeObservable(expected$);
    });

    it('should show no profile validation errors if there are no errors', () => {
      const rootDataModel: DataModel = {
        id: '1',
        label: 'data model',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'unsent',
      };

      const profiles: Profile[] = [];

      const mockProfile = (profile: Profile[]) => {
        QueryBuilderTestingHelper.mockProfile(
          profilesStub,
          profile,
          QueryBuilderTestingHelper.dataType_dataModel,
          rootDataModel
        );
      };

      mockProfile(profiles);

      const coreTableProfile = {
        id: '1',
        domainType: 'DataModel',
        label: 'data model',
        sections: [
          {
            name: 'Query Builder Core Table Profile',
            fields: [
              {
                currentValue: '',
                dataType: 'string',
                fieldName: 'QueryBuilderCoreTable',
                metadataPropertyName: 'queryBuilderCoreTable',
              } as ProfileField,
            ] as ProfileField[],
          } as ProfileSection,
        ] as ProfileSection[],
      } as Profile;

      const expected = {
        errors: [],
        fieldTotal: 0,
        total: 0,
      };

      const expected$ = cold('--a|', {
        a: expected,
      });

      const actual$ = service.validateQueryBuilderCoreTableProfile(
        coreTableProfile,
        rootDataModel
      );

      expect(actual$).toBeObservable(expected$);
    });
  });
});
