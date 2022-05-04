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
import {
  CatalogueItemDomainType,
  DataModelDetail,
  ProfileDefinition,
  ProfileFieldDataType,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { DataModelService } from '../mauro/data-model.service';
import { ProfileService } from '../mauro/profile.service';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { createProfileServiceStub } from '../testing/stubs/profile.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';

import { DataExplorerService } from './data-explorer.service';
import {
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from './data-explorer.types';

describe('DataExplorerService', () => {
  let service: DataExplorerService;
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
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: ProfileService,
          useValue: profilesStub,
        },
        {
          provide: DATA_EXPLORER_CONFIGURATION,
          useValue: config,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the root data model', () => {
    const dataModel: DataModelDetail = {
      label: config.rootDataModelPath,
      domainType: CatalogueItemDomainType.DataModel,
      availableActions: ['show'],
      finalised: false,
    };

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

    it.each(unsupportedDataTypes)(
      'should not return unsupported profile field data type %p',
      (dataType) => {
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
