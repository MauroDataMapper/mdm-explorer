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
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

export interface FeedbackDialogResponse {
  message: string;
}

@Component({
  selector: 'mdm-feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
})
export class FeedbackDialogComponent implements OnInit {
  feedbackForm!: UntypedFormGroup;

  constructor(
    private dialogRef: MatDialogRef<FeedbackDialogComponent, FeedbackDialogResponse>
  ) {}

  get message() {
    return this.feedbackForm.get('message');
  }

  ngOnInit(): void {
    this.feedbackForm = new UntypedFormGroup({
      message: new UntypedFormControl('', [
        Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
      ]),
    });
  }

  close() {
    this.dialogRef.close();
  }

  send() {
    if (this.feedbackForm.invalid) {
      return;
    }

    this.dialogRef.close({ message: this.message?.value });
  }
}
