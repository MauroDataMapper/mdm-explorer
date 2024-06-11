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

import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { createSdeRequestEndpointsSharedStub } from 'src/app/testing/stubs/sde/sde-request-endpoints-shared.stub';
import {
  AttachmentType,
  FileEndpoints,
  RequestAttachmentData,
  RequestEndpoints,
  SdeRestHandler,
} from '@maurodatamapper/sde-resources';
import { cold } from 'jest-marbles';
import { AttachmentsService } from './attachments.service';
import { createSdeRestHandlerStub } from 'src/app/testing/stubs/sde/sde-rest-handler.stub';
import { createFileEndpointStub } from 'src/app/testing/stubs/sde/file-endpoints.stub';
import { of } from 'rxjs';

describe('AttachmentsService', () => {
  let attachmentsService: AttachmentsService;
  const requestEndpointsStub = createSdeRequestEndpointsSharedStub();
  const sdeRestHandlerStub = createSdeRestHandlerStub();
  const fileEndpointsStub = createFileEndpointStub();

  beforeEach(() => {
    // Default endpoint call
    attachmentsService = setupTestModuleForService(AttachmentsService, {
      providers: [
        {
          provide: RequestEndpoints,
          useValue: requestEndpointsStub,
        },
        {
          provide: SdeRestHandler,
          useValue: sdeRestHandlerStub,
        },
        {
          provide: FileEndpoints,
          useValue: fileEndpointsStub,
        },
      ],
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create an instance', () => {
    expect(attachmentsService).toBeTruthy();
  });

  it('isRequired should be true when there are no attachments', () => {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(of([]));

    const expected$ = cold('(a|)', {
      a: { isRequired: true, result: { fileProperties: { url: '', filename: '' } } },
    });

    const actual$ = attachmentsService.attachmentsAreRequired(
      '1',
      AttachmentType.DataSpecificationPDF
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should be true when existing attachments do not match the attachment type', () => {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(
      of([
        {
          id: '1',
          fileId: 'FILE1',
          attachedAt: new Date(),
          fileName: 'file.pdf',
          contentType: 'pdf',
          attachedByName: 'user1',
          attachmentType: AttachmentType.DataSpecificationPDF,
        } as RequestAttachmentData,
        {
          id: '2',
          fileId: 'FILE2',
          attachedAt: new Date(),
          fileName: 'file.txt',
          contentType: 'txt',
          attachedByName: 'user1',
          attachmentType: AttachmentType.User,
        } as RequestAttachmentData,
      ])
    );

    const expected$ = cold('(a|)', {
      a: { isRequired: true, result: { fileProperties: { url: '', filename: '' } } },
    });

    const actual$ = attachmentsService.attachmentsAreRequired(
      '1',
      AttachmentType.DataSpecificationSQL
    );

    expect(actual$).toBeObservable(expected$);
  });

  it('isRequired should be false when an existing attachment matches the attachment type', () => {
    requestEndpointsStub.listAttachments.mockReturnValueOnce(
      of([
        {
          id: '1',
          fileId: 'FILE1',
          attachedAt: new Date(),
          fileName: 'file.pdf',
          contentType: 'pdf',
          attachedByName: 'user1',
          attachmentType: AttachmentType.DataSpecificationPDF,
        } as RequestAttachmentData,
        {
          id: '2',
          fileId: 'FILE2',
          attachedAt: new Date(),
          fileName: 'file.txt',
          contentType: 'txt',
          attachedByName: 'user1',
          attachmentType: AttachmentType.User,
        } as RequestAttachmentData,
        {
          id: '3',
          fileId: 'FILE3',
          attachedAt: new Date(),
          fileName: 'file.sql',
          contentType: 'sql',
          attachedByName: 'user1',
          attachmentType: AttachmentType.DataSpecificationSQL,
        } as RequestAttachmentData,
      ])
    );

    const expected$ = cold('(a|)', {
      a: { isRequired: false, result: { fileProperties: { url: '', filename: '' } } },
    });

    const actual$ = attachmentsService.attachmentsAreRequired(
      '1',
      AttachmentType.DataSpecificationSQL
    );

    expect(actual$).toBeObservable(expected$);
  });
});
