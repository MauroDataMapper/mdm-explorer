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
  CatalogueItemDomainType,
  DataModelDetail,
  ProfileDefinition,
  ProfileFieldDataType,
  ApiProperty,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { ApiPropertiesService } from '../mauro/api-properties.service';
import { DataModelService } from '../mauro/data-model.service';
import { ProfileService } from '../mauro/profile.service';
import { createApiPropertiesServiceStub } from '../testing/stubs/api-properties.stub';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { createProfileServiceStub } from '../testing/stubs/profile.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';

import { configurationKeys, DataExplorerService } from './data-explorer.service';
import { DataExplorerConfiguration } from './data-explorer.types';

describe('DataExplorerService', () => {
  let service: DataExplorerService;
  const apiPropertiesStub = createApiPropertiesServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const profilesStub = createProfileServiceStub();

  const config: DataExplorerConfiguration = {
    rootDataModelPath: 'my test model',
    profileServiceName: 'Profile Service',
    profileNamespace: 'Profile Namespace',
  };

  beforeEach(() => {
    service = setupTestModuleForService(DataExplorerService, {
      providers: [
        {
          provide: ApiPropertiesService,
          useValue: apiPropertiesStub,
        },
        {
          provide: ProfileService,
          useValue: profilesStub,
        },
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
      ],
    });
  });

  /**
   * Force the service to be in an initialised state without calling `initialise()`
   */
  const mockInitialiseService = () => {
    service.config = config;
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialise', () => {
    it('should fail if error occurred getting api properties', () => {
      apiPropertiesStub.listPublic.mockImplementationOnce(() =>
        cold('#', null, new Error())
      );

      const expected$ = cold('#', null, new Error());
      const actual$ = service.initialise();
      expect(actual$).toBeObservable(expected$);
    });

    it('should fail if required api properties are missing', () => {
      apiPropertiesStub.listPublic.mockImplementationOnce(() =>
        cold('--a|', {
          a: [
            {
              key: 'wrongKey',
              value: 'wrongValue',
            },
          ],
        })
      );

      const expected$ = cold('--#', null, new Error());
      const actual$ = service.initialise();
      expect(actual$).toBeObservable(expected$);
    });

    it('should be configured when required api properties are present', () => {
      const properties: ApiProperty[] = [
        {
          category: configurationKeys.category,
          key: configurationKeys.rootDataModelPath,
          value: 'rootDataModelPath',
        },
        {
          category: configurationKeys.category,
          key: configurationKeys.profileNamespace,
          value: 'profileNamespace',
        },
        {
          category: configurationKeys.category,
          key: configurationKeys.profileServiceName,
          value: 'profileServiceName',
        },
      ];

      apiPropertiesStub.listPublic.mockImplementationOnce(() =>
        cold('--a|', {
          a: properties,
        })
      );

      const expectedConfig: DataExplorerConfiguration = {
        rootDataModelPath: 'rootDataModelPath',
        profileNamespace: 'profileNamespace',
        profileServiceName: 'profileServiceName',
      };

      const expected$ = cold('--a|', {
        a: expectedConfig,
      });
      const actual$ = service.initialise();
      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(service.config).toStrictEqual(expectedConfig);
      });
    });
  });

  describe('get root data model', () => {
    it('should throw an error if service is not initialised', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.getRootDataModel();
      expect(actual$).toBeObservable(expected$);
    });

    it('should return the root data model', () => {
      const dataModel: DataModelDetail = {
        label: config.rootDataModelPath,
        domainType: CatalogueItemDomainType.DataModel,
        availableActions: ['show'],
        finalised: false,
      };

      mockInitialiseService();

      dataModelsStub.getDataModel.mockImplementationOnce((path) => {
        expect(path).toBe(config.rootDataModelPath);
        return cold('--a|', { a: dataModel });
      });

      const expected$ = cold('--a|', {
        a: dataModel,
      });

      const actual$ = service.getRootDataModel();
      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('profile filter fields', () => {
    const createProfileDefinition = (
      dataType: ProfileFieldDataType
    ): ProfileDefinition => {
      return {
        sections: [
          {
            name: 'section1',
            fields: [
              {
                fieldName: 'field1',
                metadataPropertyName: 'field1',
                dataType,
              },
            ],
          },
          {
            name: 'section2',
            fields: [
              {
                fieldName: 'field2',
                metadataPropertyName: 'field2',
                dataType,
              },
            ],
          },
        ],
      };
    };

    const mockProfileDefinition = (definition: ProfileDefinition) => {
      profilesStub.definition.mockImplementationOnce((pns, pn) => {
        expect(pns).toBe(config.profileNamespace);
        expect(pn).toBe(config.profileServiceName);
        return cold('--a|', { a: definition });
      });
    };

    const supportedDataTypes: ProfileFieldDataType[] = ['enumeration'];

    const unsupportedDataTypes: ProfileFieldDataType[] = [
      'boolean',
      'string',
      'text',
      'int',
      'decimal',
      'date',
      'datetime',
      'time',
      'folder',
      'model',
      'json',
    ];

    it('should throw an error if service is not initialised', () => {
      const expected$ = cold('#', null, new Error());
      const actual$ = service.getProfileFieldsForFilters();
      expect(actual$).toBeObservable(expected$);
    });

    it.each(unsupportedDataTypes)(
      'should not return unsupported profile field data type %p',
      (dataType) => {
        mockInitialiseService();

        const definition = createProfileDefinition(dataType);
        mockProfileDefinition(definition);

        const expected$ = cold('--a|', { a: [] });
        const actual$ = service.getProfileFieldsForFilters();
        expect(actual$).toBeObservable(expected$);
      }
    );

    it.each(supportedDataTypes)(
      'should return profile fields with data type %p',
      (dataType) => {
        mockInitialiseService();

        const definition = createProfileDefinition(dataType);
        mockProfileDefinition(definition);

        const expectedFields = definition.sections.flatMap((section) => section.fields);

        const expected$ = cold('--a|', { a: expectedFields });
        const actual$ = service.getProfileFieldsForFilters();
        expect(actual$).toBeObservable(expected$);
      }
    );
  });
});
