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
  DataModel,
  FolderDetail,
  MdmResourcesConfiguration,
  CatalogueItemDomainType,
  DataElement,
  DataElementDetail,
  DataModelFull,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { DataModelService } from '../mauro/data-model.service';
import { DataRequest } from '../data-explorer/data-explorer.types';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { createFolderServiceStub } from '../testing/stubs/folder.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { createDataElementSearchServiceStub } from '../testing/stubs/data-element-search.stub';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { FolderService } from '../mauro/folder.service';
import { DataRequestsService } from './data-requests.service';
import { DataElementSearchService } from './data-element-search.service';
import { ExceptionService } from '../core/exception.service';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';

describe('DataRequestsService', () => {
  let service: DataRequestsService;
  const dataModelsStub = createDataModelServiceStub();
  const folderServiceStub = createFolderServiceStub();
  const dataElementSearchStub = createDataElementSearchServiceStub();
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(DataRequestsService, {
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: FolderService,
          useValue: folderServiceStub,
        },
        {
          provide: MdmResourcesConfiguration,
        },
        {
          provide: DataElementSearchService,
          useValue: dataElementSearchStub,
        },
        {
          provide: ExceptionService,
        },
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the user folder with the expected name', () => {
    // Arrange
    const username = 'test@gmail.com';
    const rootFolder = { label: 'root' } as FolderDetail;
    const expectedFolder = { label: 'test[at]gmail.com' } as FolderDetail;

    const expected$ = cold('----a|', {
      a: expectedFolder,
    });

    folderServiceStub.getOrCreate.mockImplementationOnce(() => {
      return cold('--a|', {
        a: rootFolder,
      });
    });

    folderServiceStub.getOrCreateChildOf.mockImplementationOnce(
      (id: string, label: string) => {
        return cold('--a|', {
          a: { label },
        });
      }
    );

    // Act
    const actual$ = service.getRequestsFolder(username);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });

  it('should return a list of dms under the user folder', () => {
    // Arrange
    const userEmail = 'test@gmail.com';
    const dms = ['label-1', 'label-2', 'label-3'].map((label: string) => {
      return { label } as DataModel;
    });

    folderServiceStub.getOrCreate.mockImplementationOnce(() => {
      return cold('-a|', {
        a: { label: 'root' },
      });
    });

    folderServiceStub.getOrCreateChildOf.mockImplementationOnce(
      (id: string, label: string) => {
        return cold('-a|', {
          a: { label },
        });
      }
    );

    dataModelsStub.listInFolder.mockImplementationOnce(() => {
      return cold('-a|', {
        a: dms,
      });
    });

    const expected$ = cold('---a|', {
      a: dms.map((dm) => {
        return { ...dm, status: 'unsent' };
      }),
    });

    // Act
    const actual$ = service.list(userEmail);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });

  it('should return a flattened list of data elements from a data model', () => {
    const request = { id: '123' } as DataRequest;
    const dataElements = [
      { id: '1' },
      { id: '2' },
      { id: '3' },
      { id: '4' },
      { id: '5' },
      { id: '6' },
    ] as DataElement[];

    const expectedDataElements: DataElementDetail[] = dataElements.map((de) => {
      return {
        id: de.id,
        label: `element ${de.id}`,
        domainType: CatalogueItemDomainType.DataElement,
        availableActions: ['show'],
      };
    });

    // Test with a hierarchy that includes Data Elements in single and parent/child Data Classes
    const hierarchy: DataModelFull = {
      label: 'test model',
      domainType: CatalogueItemDomainType.DataModel,
      availableActions: ['show'],
      finalised: false,
      childDataClasses: [
        {
          label: 'class 1',
          domainType: CatalogueItemDomainType.DataClass,
          availableActions: ['show'],
          dataElements: expectedDataElements.slice(0, 2),
        },
        {
          label: 'class 2',
          domainType: CatalogueItemDomainType.DataClass,
          availableActions: ['show'],
          dataElements: expectedDataElements.slice(2, 4),
          dataClasses: [
            {
              label: 'class 3',
              domainType: CatalogueItemDomainType.DataClass,
              availableActions: ['show'],
              dataElements: expectedDataElements.slice(4, 6),
            },
          ],
        },
      ],
    };

    dataModelsStub.getDataModelHierarchy.mockImplementationOnce((req) => {
      expect(req).toBe(request.id);
      return cold('--a|', {
        a: hierarchy,
      });
    });

    const expected$ = cold('--a|', { a: expectedDataElements });
    const actual$ = service.getRequestDataElements(request);
    expect(actual$).toBeObservable(expected$);
  });
});
