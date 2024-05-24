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
import { EMPTY, map, Observable, switchMap, takeLast, throwError } from 'rxjs';
import { ISubmissionState, ISubmissionStep, StepName, StepResult } from '../submission.resource';
import {
  AttachmentType,
  RequestEndpoints,
  SdeRestHandler,
  FileEndpoints,
} from '@maurodatamapper/sde-resources';

@Injectable({
  providedIn: 'root',
})
export class AttachSqlStep implements ISubmissionStep {
  name: StepName = 'Attach sql file to data request';

  constructor(
    private requestEndpoints: RequestEndpoints,
    private fileEndpoints: FileEndpoints,
    private sdeRestHandler: SdeRestHandler
  ) {}

  isRequired(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.dataRequestId) {
      return this.observableError(
        'Attach Sql Step (isRequired) expects Data Request Id, which was not provided.'
      );
    }

    if (!input.pathToExportFile) {
      return this.observableError(
        'Attach Sql Step (isRequired) expects Path To Export File, which was not provided.'
      );
    }

    return this.requestEndpoints.listAttachments(input.dataRequestId).pipe(
      map((attachmentsList) => {
        const isRequired = !attachmentsList.some(
          (attachment) => attachment.attachmentType === AttachmentType.DataSpecificationSQL
        );
        const stepResult: StepResult = {
          result: {},
          isRequired,
        };
        return stepResult;
      })
    );
  }

  /*
  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.dataRequestId) {
      return this.observableError(
        'Attach Sql Step (run) expects Data Request Id, which was not provided.'
      );
    }

    if (!input.pathToExportFile) {
      return this.observableError(
        'Attach Sql Step (run) expects Path To Export File, which was not provided.'
      );
    }

    const dataRequestId: string = input.dataRequestId;

    this.sdeRestHandler.download(input.pathToExportFile).pipe(
      map((blob) => {
        if (!blob) {
          throw new Error('No blob found');
        }
        const file = new File([blob], 'NigeTestFile.sql', {
          type: blob.type,
          lastModified: Date.now(),
        });
        return this.fileEndpoints.uploadFile(file);
        // const upload$ = this.fileEndpoints.uploadFile(file);
      }),
      map((uploadProgress) => {
        uploadProgress
          .pipe(
            catchError(() => {
              // this.snackBar.open('Upload failed', 'Close', { duration: 3000 });
              // uploadProgress$.error(err);
              return EMPTY;
            })
          )
          .subscribe((uploadEvent) => {
            if (uploadEvent.eventType === 'progress') {
              /*
            uploadProgress$.next(
              uploadEvent.inner.total !== undefined
                ? 0.9 *
                    Math.round(100 * (uploadEvent.inner.loaded / uploadEvent.inner.total))
                : 0.0,
            ); /
            } else {
              this.requestEndpoints.attachFile(dataRequestId, uploadEvent.fileId).subscribe(() => {
                // this.snackBar.open('Attachment uploaded', 'Close', { duration: 3000 });
                // uploadProgress$.next(100);
                // uploadProgress$.complete();
                // this.requestService.refreshRequestLists();
              });
            }
          });
      })
    );

    return EMPTY;
    /*
    return this.dataExporterService
      .exportDataSpecification(input.specificationId, ExporterName.DataModelSqlExporterService)
      .pipe(
        map((url) => {
          return { result: { pathToExportFile: url } } as StepResult;
        })
      );
      * /
  }
*/
  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.dataRequestId) {
      return this.observableError(
        'Attach Sql Step (run) expects Data Request Id, which was not provided.'
      );
    }

    if (!input.pathToExportFile) {
      return this.observableError(
        'Attach Sql Step (run) expects Path To Export File, which was not provided.'
      );
    }

    const dataRequestId: string = input.dataRequestId;
    return this.sdeRestHandler.download(input.pathToExportFile).pipe(
      switchMap((blob) => {
        if (!blob) {
          return throwError(() => new Error('No blob found'));
        }

        const file = new File([blob], 'NigeTestFile.sql', {
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
            .attachFile(dataRequestId, uploadEvent.fileId, AttachmentType.DataSpecificationSQL)
            .pipe(
              map(() => {
                // Process the final result here
                return {
                  result: { pathToExportFile: `uploadEvent.fileId: ${uploadEvent.fileId}` },
                } as StepResult;
              })
            );
        }
      }),
      takeLast(1)
      /*
        if (!blob) {
          return throwError(() => new Error('No blob found'));
        }

        const file = new File([blob], 'NigeTestFile.sql', {
          type: 'sql',
          lastModified: Date.now(),
        });

        return (
          this.fileEndpoints.uploadFile(file).pipe(
            map((uploadEvent) => {
              if (uploadEvent.eventType === 'progress') {
                // Handle progress events if needed
                return EMPTY; // Emit nothing for progress events
              } else {
                return this.requestEndpoints.attachFile(dataRequestId, uploadEvent.fileId).pipe(
                  map(() => {
                    // Process the final result here
                    return {
                      result: {},
                    } as StepResult;
                  })
                );
              }
            })
          ),
          takeLast(1)
        ); // Ensure we only emit the final result
      }),
      finalize(() => {
        // Cleanup or final operations if needed
      })*/
    );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['dataRequestId', 'pathToExportFile'];
  }

  private observableError(errorMessage: string): Observable<StepResult> {
    return new Observable((observer) => {
      observer.error(new Error(errorMessage));
    });
  }
}
