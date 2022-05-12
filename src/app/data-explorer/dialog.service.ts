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
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  CreateRequestDialogComponent,
  CreateRequestDialogResponse,
} from './create-request-dialog/create-request-dialog.component';
import {
  FeedbackDialogComponent,
  FeedbackDialogResponse,
} from './feedback-dialog/feedback-dialog.component';
import {
  RequestCreatedAction,
  RequestCreatedData,
  RequestCreatedDialogComponent,
} from './request-created-dialog/request-created-dialog.component';
import {
  RequestUpdatedAction,
  RequestUpdatedData,
  RequestUpdatedDialogComponent,
} from './request-updated-dialog/request-updated-dialog.component';
import {
  SuccessDialogComponent,
  SuccessDialogData,
} from './success-dialog/success-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  openCreateRequest() {
    return this.matDialog.open<
      CreateRequestDialogComponent,
      any,
      CreateRequestDialogResponse
    >(CreateRequestDialogComponent, {
      minWidth: 500,
    });
  }

  openRequestCreated(data: RequestCreatedData) {
    return this.matDialog.open<
      RequestCreatedDialogComponent,
      RequestCreatedData,
      RequestCreatedAction
    >(RequestCreatedDialogComponent, {
      data,
    });
  }

  openRequestUpdated(data: RequestUpdatedData) {
    return this.matDialog.open<
      RequestUpdatedDialogComponent,
      RequestUpdatedData,
      RequestUpdatedAction
    >(RequestUpdatedDialogComponent, {
      data,
    });
  }

  openFeedbackForm() {
    return this.matDialog.open<FeedbackDialogComponent, any, FeedbackDialogResponse>(
      FeedbackDialogComponent
    );
  }

  openSuccess(data: SuccessDialogData) {
    return this.matDialog.open<SuccessDialogComponent, SuccessDialogData>(
      SuccessDialogComponent,
      {
        maxWidth: 500,
        data,
      }
    );
  }
}
