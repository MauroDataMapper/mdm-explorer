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
import { Observable } from 'rxjs';
import { Uuid } from '@maurodatamapper/mdm-resources';
import {
  FileProperties,
  StepResult,
} from 'src/app/data-explorer/specification-submission/type-declarations/submission.resource';
import { AttachmentType } from '@maurodatamapper/sde-resources';

export type AttachmentsAreRequiredStubFn = (
  dataRequestId: Uuid,
  attachmentType: AttachmentType
) => Observable<StepResult>;

export type AttachFileStubFn = (
  dataRequestId: Uuid,
  fileProperties: FileProperties,
  attachmentType: AttachmentType
) => Observable<StepResult>;

export interface AttachmentsServiceStub {
  attachmentsAreRequired: jest.MockedFunction<AttachmentsAreRequiredStubFn>;
  attachFile: jest.MockedFunction<AttachFileStubFn>;
}

export const createAttachmentsServiceStub = (): AttachmentsServiceStub => {
  return {
    attachmentsAreRequired: jest.fn() as jest.MockedFunction<AttachmentsAreRequiredStubFn>,
    attachFile: jest.fn() as jest.MockedFunction<AttachFileStubFn>,
  };
};
