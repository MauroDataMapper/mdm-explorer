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

export type PutFn = (url: string, body: any) => any;
export type DeleteFn = (url: string) => void;
export type PostFn = (url: string, body: any) => any;
export type GetFn = (url: string) => any;
export type UploadFn = (url: string, file: File, fileKey: string) => void;
export type DownloadFn = (url: string) => Observable<Blob | undefined>;

export interface SdeRestHandlerStub {
  put: jest.MockedFunction<PutFn>;
  delete: jest.MockedFunction<DeleteFn>;
  post: jest.MockedFunction<PostFn>;
  get: jest.MockedFunction<GetFn>;
  upload: jest.MockedFunction<UploadFn>;
  download: jest.MockedFunction<DownloadFn>;
}

export const createSdeRestHandlerStub = (): SdeRestHandlerStub => {
  return {
    put: jest.fn() as jest.MockedFunction<PutFn>,
    delete: jest.fn() as jest.MockedFunction<DeleteFn>,
    post: jest.fn() as jest.MockedFunction<PostFn>,
    get: jest.fn() as jest.MockedFunction<GetFn>,
    upload: jest.fn() as jest.MockedFunction<UploadFn>,
    download: jest.fn() as jest.MockedFunction<DownloadFn>,
  };
};
