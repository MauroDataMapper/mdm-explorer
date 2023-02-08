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
import { Component, Inject, OnInit, Optional } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { dontAllowDuplicatedNames } from 'src/app/shared/mdm-validators';
import { DialogService } from '../dialog.service';

export interface EditRequestDialogOptions {
  requestName: string;
  requestDescription?: string;
}

export interface EditRequestDialogResponse {
  name: string;
  description: string;
}

@Component({
  selector: 'mdm-edit-request-dialog',
  templateUrl: './edit-request-dialog.component.html',
  styleUrls: ['./edit-request-dialog.component.scss'],
})
export class EditRequestDialogComponent implements OnInit {
  requestForm!: FormGroup;
  initialDescription?: string;
  initialName?: string;

  constructor(
    public dialogRef: MatDialogRef<EditRequestDialogComponent, EditRequestDialogResponse>,
    private dataRequests: DataRequestsService,
    private dialogs: DialogService,
    @Inject(MAT_DIALOG_DATA) @Optional() private data: EditRequestDialogOptions
  ) {}

  get name() {
    return this.requestForm.get('name');
  }

  get description() {
    return this.requestForm.get('description');
  }

  ngOnInit(): void {
    this.initialDescription = this.data.requestDescription;
    this.initialName = this.data.requestName;

    this.requestForm = new FormGroup({
      name: new FormControl(
        this.initialName,
        [
          Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
        ],
        dontAllowDuplicatedNames(this.dataRequests, this.initialName)
      ),

      description: new FormControl(this.initialDescription),
    });
  }

  currentValuesAreTheSameAsInitialValues(): boolean {
    return (
      this.initialName === this.name?.value &&
      this.initialDescription === this.description?.value
    );
  }

  close() {
    if (this.currentValuesAreTheSameAsInitialValues()) {
      this.dialogRef.close();
    } else {
      this.dialogs
        .openConfirmation({
          title: 'Unsaved Changes',
          message: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
          okBtnTitle: 'Yes',
          cancelBtnTitle: 'No',
        })
        .afterClosed()
        .subscribe((response) => {
          if (response?.status === 'ok') {
            this.dialogRef.close();
          } else {
            return;
          }
        });
    }
  }

  update() {
    if (this.requestForm.invalid) {
      return;
    }

    if (this.currentValuesAreTheSameAsInitialValues()) {
      return;
    }

    this.dialogRef.close({
      name: this.name?.value,
      description: this.description?.value,
    });
  }
}
