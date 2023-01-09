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
import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AppErrorDialogComponent } from './app-error-dialog/app-error-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AppErrorHandlerService implements ErrorHandler {
  constructor(private dialog: MatDialog) {}

  handleError(error: any): void {
    if (!error) {
      return;
    }

    if (error.rejection) {
      // Get the reason why the error happened
      error = error.rejection;
    }

    this.dialog.open(AppErrorDialogComponent, {
      data: {
        error,
      },
      disableClose: true,
      hasBackdrop: true,
    });
  }
}
