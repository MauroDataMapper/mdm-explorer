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
  ContainerUpdatePayload,
  FolderDetail,
} from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { FolderService } from './folder.service';

describe('FolderService', () => {
  let service: FolderService;
  const endpointsStub = createMdmEndpointsStub();

  const folderLabel = 'folderLabel';
  const expectedFolder = {
    label: folderLabel,
    domainType: CatalogueItemDomainType.Folder,
    availableActions: ['show'],
  } as FolderDetail;

  beforeEach(() => {
    service = setupTestModuleForService(FolderService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should call the update endpoint with a payload', () => {
    const folderId = '123';
    const label = 'testLabel';
    const payload: ContainerUpdatePayload = { id: folderId, label };

    // mock endpoint return
    endpointsStub.folder.update.mockImplementationOnce((id, pl) => {
      expect(id).toBe(folderId);
      expect(pl).toBe(payload);
      return cold('--a|', {
        a: { body: expectedFolder },
      });
    });

    // it's the servers problem now
    service.update(folderId, payload);
    expect(endpointsStub.folder.update).toHaveBeenCalledWith(folderId, payload);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
