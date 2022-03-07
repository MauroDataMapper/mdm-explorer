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
import { FolderDetail } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createFolderServiceStub } from '../testing/stubs/folder.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { FolderService } from './folder.service';

import { UserRequestsService } from './user-requests.service';

describe('UserRequestsService', () => {
  let service: UserRequestsService;
  const folderServiceStub = createFolderServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(UserRequestsService, {
      providers: [
        {
          provide: FolderService,
          useValue: folderServiceStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be named with [at]', () => {
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
    const actual$ = service.getUserRequestsFolder(username);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });
});
