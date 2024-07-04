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
import { MatDialog } from '@angular/material/dialog';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogConfig,
  DialogResult,
} from '../shared/confirmation-dialog/confirmation-dialog.component';
import {
  CreateDataSpecificationDialogComponent,
  CreateDataSpecificationDialogOptions,
  CreateDataSpecificationDialogResponse,
} from './create-data-specification-dialog/create-data-specification-dialog.component';
import {
  EditDataSpecificationDialogComponent,
  EditDataSpecificationDialogOptions,
  EditDataSpecificationDialogResponse,
} from './edit-data-specification-dialog/edit-data-specification-dialog.component';
import {
  FeedbackDialogComponent,
  FeedbackDialogResponse,
} from './feedback-dialog/feedback-dialog.component';
import {
  OkCancelDialogComponent,
  OkCancelDialogData,
  OkCancelDialogResponse,
} from './ok-cancel-dialog/ok-cancel-dialog.component';
import {
  DataSpecificationCreatedAction,
  DataSpecificationCreatedData,
  DataSpecificationCreatedDialogComponent,
} from './data-specification-created-dialog/data-specification-created-dialog.component';
import {
  DataSpecificationUpdatedAction,
  DataSpecificationUpdatedData,
  DataSpecificationUpdatedDialogComponent,
} from './data-specification-updated-dialog/data-specification-updated-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import {
  ShareDataSpecificationDialogComponent,
  ShareDataSpecificationDialogInputOutput,
} from './share-data-specification-dialog/share-data-specification-dialog.component';
import {
  SelectProjectDialogComponent,
  SelectProjectDialogData,
} from './specification-submission/select-project-dialog/select-project-dialog.component';
import { SimpleDialogComponent, SimpleDialogData } from './simple-dialog/simple-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  constructor(private matDialog: MatDialog) {}

  openCreateDataSpecification(data?: CreateDataSpecificationDialogOptions) {
    return this.matDialog.open<
      CreateDataSpecificationDialogComponent,
      CreateDataSpecificationDialogOptions,
      CreateDataSpecificationDialogResponse
    >(CreateDataSpecificationDialogComponent, {
      minWidth: 500,
      data,
    });
  }

  openEditDataSpecification(data: EditDataSpecificationDialogOptions) {
    return this.matDialog.open<
      EditDataSpecificationDialogComponent,
      EditDataSpecificationDialogOptions,
      EditDataSpecificationDialogResponse
    >(EditDataSpecificationDialogComponent, { minWidth: 500, data });
  }

  openDataSpecificationCreated(data: DataSpecificationCreatedData) {
    return this.matDialog.open<
      DataSpecificationCreatedDialogComponent,
      DataSpecificationCreatedData,
      DataSpecificationCreatedAction
    >(DataSpecificationCreatedDialogComponent, {
      data,
    });
  }

  openDataSpecificationUpdated(data: DataSpecificationUpdatedData) {
    return this.matDialog.open<
      DataSpecificationUpdatedDialogComponent,
      DataSpecificationUpdatedData,
      DataSpecificationUpdatedAction
    >(DataSpecificationUpdatedDialogComponent, {
      data,
    });
  }

  openConfirmation(data: ConfirmationDialogConfig) {
    return this.matDialog.open<ConfirmationDialogComponent, ConfirmationDialogConfig, DialogResult>(
      ConfirmationDialogComponent,
      {
        data,
      }
    );
  }

  openFeedbackForm() {
    return this.matDialog.open<FeedbackDialogComponent, any, FeedbackDialogResponse>(
      FeedbackDialogComponent
    );
  }

  openOkCancel(data: OkCancelDialogData) {
    return this.matDialog.open<OkCancelDialogComponent, OkCancelDialogData, OkCancelDialogResponse>(
      OkCancelDialogComponent,
      {
        maxWidth: 500,
        data,
      }
    );
  }

  openSuccess(data: SimpleDialogData) {
    return this.matDialog.open<SuccessDialogComponent, SimpleDialogData>(SuccessDialogComponent, {
      maxWidth: 500,
      data,
    });
  }

  openSimple(data: SimpleDialogData) {
    return this.matDialog.open<SimpleDialogComponent, SimpleDialogData>(SimpleDialogComponent, {
      maxWidth: 500,
      data,
    });
  }

  shareWithCommunity(data: ShareDataSpecificationDialogInputOutput) {
    return this.matDialog.open<
      ShareDataSpecificationDialogComponent,
      ShareDataSpecificationDialogInputOutput,
      ShareDataSpecificationDialogInputOutput
    >(ShareDataSpecificationDialogComponent, { minWidth: 500, data });
  }

  openSelectProject(data: SelectProjectDialogData) {
    return this.matDialog.open<SelectProjectDialogComponent, SelectProjectDialogData>(
      SelectProjectDialogComponent,
      {
        data,
      }
    );
  }
}
