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
import { UploadProgress, Uuid } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type UploadFileFn = (file: File) => Observable<UploadProgress>;
export type DownloadFileFn = (fileId: Uuid) => Observable<Blob | undefined>;

export interface SdeResourcesBroadcastServiceStub {
  uploadFile: jest.MockedFunction<UploadFileFn>;
  downloadFile: jest.MockedFunction<DownloadFileFn>;
  /*
    on<TPayload = any>(event: SdeResourcesBroadcastEvent): Observable<TPayload> {
    return this.handler.pipe(
      filter((message) => message.event === event),
      map((message) => message.payload),
    );
  }


  dispatch<TPayload = any>(event: SdeResourcesBroadcastEvent, payload?: TPayload) {
    this.handler.next(new SdeResourcesBroadcastMessage(event, payload));
  }


  userAskedToCreateProjectForRequest(requestId: string) {
    this.dispatch<string>('user-create-project-from-request', requestId);
  }


  onUserAskedToCreateProjectForRequest(): Observable<string> {
    return this.on<string>('user-create-project-from-request');
  }


  requestChanged(request: RequestResponse) {
    this.dispatch<RequestResponse>('request-changed', request);
  }


  onRequestChanged(): Observable<RequestResponse> {
    return this.on<RequestResponse>('request-changed');
  }


  requestDialogClosed(request: RequestResponse) {
    this.dispatch<RequestResponse>('request-dialog-closed', request);
  }


  onRequestDialogClosed(): Observable<RequestResponse> {
    return this.on<RequestResponse>('request-dialog-closed');
  }

  dataSpecificationAttachmentBegin() {
    this.dispatch<boolean>('data-specification-attachment-begin', true);
  }


  onDataSpecificationAttachmentBegin(): Observable<boolean> {
    return this.on<boolean>('data-specification-attachment-begin');
  }


  dataSpecificationAttachmentEnd() {
    this.dispatch<boolean>('data-specification-attachment-end', true);
  }


  onDataSpecificationAttachmentEnd(): Observable<boolean> {
    return this.on<boolean>('data-specification-attachment-end');
  }
  */
}

export const createSdeResourcesBroadcastServiceStub = (): SdeResourcesBroadcastServiceStub => {
  return {
    uploadFile: jest.fn() as jest.MockedFunction<UploadFileFn>,
    downloadFile: jest.fn() as jest.MockedFunction<DownloadFileFn>,
  };
};
