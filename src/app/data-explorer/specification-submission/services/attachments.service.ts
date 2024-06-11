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
import { Injectable } from '@angular/core';
import { EMPTY, Observable, map, switchMap, takeLast, throwError } from 'rxjs';
import { FileProperties, StepResult } from '../type-declarations/submission.resource';
import {
  AttachmentType,
  FileEndpoints,
  RequestEndpoints,
  SdeRestHandler,
  Uuid,
} from '@maurodatamapper/sde-resources';

@Injectable({
  providedIn: 'root',
})
export class AttachmentsService {
  constructor(
    private requestEndpoints: RequestEndpoints,
    private sdeRestHandler: SdeRestHandler,
    private fileEndpoints: FileEndpoints
  ) {}

  attachmentsAreRequired(
    dataRequestId: Uuid,
    attachmentType: AttachmentType
  ): Observable<StepResult> {
    return this.requestEndpoints.listAttachments(dataRequestId).pipe(
      map((attachmentsList) => {
        const isRequired = !attachmentsList.some(
          (attachment) => attachment.attachmentType === attachmentType
        );
        const stepResult: StepResult = {
          result: { fileProperties: { url: '', filename: '' } as FileProperties },
          isRequired,
        };
        return stepResult;
      })
    );
  }

  attachFile(
    dataRequestId: Uuid,
    fileProperties: FileProperties,
    attachmentType: AttachmentType
  ): Observable<StepResult> {
    return this.sdeRestHandler.download(fileProperties.url).pipe(
      switchMap((blob) => {
        if (!blob) {
          return throwError(() => new Error('No blob found'));
        }

        const file = new File([blob], fileProperties.filename, {
          type: 'text/plain',
          lastModified: Date.now(),
        });

        return this.fileEndpoints.uploadFile(file);
      }),
      switchMap((uploadEvent) => {
        if (uploadEvent.eventType === 'progress') {
          // Handle progress events if needed
          return EMPTY; // Emit nothing for progress events
        } else {
          return this.requestEndpoints
            .attachFile(dataRequestId, uploadEvent.fileId, attachmentType)
            .pipe(
              map(() => {
                // Process the final result here
                return {
                  result: {},
                } as StepResult;
              })
            );
        }
      }),
      takeLast(1)
    );
  }
}
