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
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { DataModelService } from '../catalogue/data-model.service';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { createFolderServiceStub } from '../testing/stubs/folder.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { FolderService } from './folder.service';
import { UserRequestsService } from './user-requests.service';
import { DataElementSearchService } from '../search/data-element-search.service';
import { ExceptionService } from './exception.service';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { createDataElementSearchServiceStub } from '../testing/stubs/data-element-search.stub';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';

describe('UserRequestsService', () => {
  let service: UserRequestsService;
  const folderServiceStub = createFolderServiceStub();
  const dataModelStub = createDataModelServiceStub();
  const dataElementSearchStub = createDataElementSearchServiceStub();
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(UserRequestsService, {
      // imports: [CATALOGUE_CONFIGURATION],
      providers: [
        {
          provide: FolderService,
          useValue: folderServiceStub,
        },
        {
          provide: DataModelService,
          useValue: dataModelStub,
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

    dataModelStub.listInFolder.mockImplementationOnce(() => {
      return cold('-a|', {
        a: dms,
      });
    });

    const expected$ = cold('---a|', {
      a: dms,
    });

    // Act
    const actual$ = service.list(userEmail);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });
});
