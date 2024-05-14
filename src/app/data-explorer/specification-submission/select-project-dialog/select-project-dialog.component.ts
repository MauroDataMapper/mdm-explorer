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
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Uuid } from '@maurodatamapper/sde-resources';

export interface SelectProjectDialogData {
  specificationId: Uuid;
}

export interface SelectProjectDialogResponse {
  stepDescription: string;
}

@Component({
  selector: 'mdm-select-project-dialog',
  templateUrl: './select-project-dialog.component.html',
  styleUrls: ['./select-project-dialog.component.scss'],
})
export class SelectProjectDialogComponent implements OnInit {
  selectProjectForm = new FormGroup({
    stepDescription: new FormControl('', [
      Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
    ]),
  });

  constructor(
    private dialogRef: MatDialogRef<SelectProjectDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SelectProjectDialogData
  ) {}

  get stepDescription() {
    return this.selectProjectForm.controls.stepDescription;
  }

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }

  submit() {
    const response: SelectProjectDialogResponse = {
      stepDescription: this.selectProjectForm.value.stepDescription ?? '',
    };
    this.dialogRef.close({ ...response });
  }
}
