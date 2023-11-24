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
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface OkCancelDialogResponse {
  result: boolean;
}

export interface OkCancelDialogData {
  heading: string;
  content: string;
  okLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'mdm-ok-cancel-dialog',
  templateUrl: './ok-cancel-dialog.component.html',
  styleUrls: ['./ok-cancel-dialog.component.scss'],
})
export class OkCancelDialogComponent implements OnInit {
  constructor(
    private dialogRef: MatDialogRef<OkCancelDialogComponent, OkCancelDialogResponse>,
    @Inject(MAT_DIALOG_DATA) private data: OkCancelDialogData,
  ) {}

  get heading() {
    return this.data.heading;
  }

  get content() {
    return this.data.content;
  }

  get okLabel() {
    return this.data.okLabel ?? 'Ok';
  }

  get cancelLabel() {
    return this.data.cancelLabel ?? 'Cancel';
  }

  ngOnInit(): void {}

  close(result: boolean) {
    this.dialogRef.close({ result });
  }
}
