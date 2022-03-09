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
import { CatalogueItemDomainType, DataModelDetail } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { CatalogueService } from './catalogue.service';
import { CatalogueConfiguration, CATALOGUE_CONFIGURATION } from './catalogue.types';
import { DataModelService } from './data-model.service';

describe('CatalogueService', () => {
  let service: CatalogueService;
  const dataModelsStub = createDataModelServiceStub();
  const config: CatalogueConfiguration = {
    rootDataModelPath: 'my test model',
  };

  beforeEach(() => {
    service = setupTestModuleForService(CatalogueService, {
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: CATALOGUE_CONFIGURATION,
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
});
