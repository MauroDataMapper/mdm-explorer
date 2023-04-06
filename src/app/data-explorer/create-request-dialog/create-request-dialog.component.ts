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

export interface CreateRequestDialogOptions {
  showDescription?: boolean;
}

export interface CreateRequestDialogResponse {
  name: string;
  description: string;
}

@Component({
  selector: 'mdm-create-request-dialog',
  templateUrl: './create-request-dialog.component.html',
  styleUrls: ['./create-request-dialog.component.scss'],
})
export class CreateRequestDialogComponent implements OnInit {
  requestForm = new FormGroup({
    name: new FormControl('', [
      Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
    ]),
    description: new FormControl(''),
  });

  showDescription = true;

  constructor(
    public dialogRef: MatDialogRef<
      CreateRequestDialogComponent,
      CreateRequestDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA) @Optional() private data: CreateRequestDialogOptions
  ) {}

  get name() {
    return this.requestForm.controls.name;
  }

  get description() {
    return this.requestForm.controls.description;
  }

  ngOnInit(): void {
    this.showDescription = this.data?.showDescription ?? true;
  }

  close() {
    this.dialogRef.close();
  }

  create() {
    if (this.requestForm.invalid) {
      return;
    }

    this.dialogRef.close({
      name: this.name.value ?? '',
      description: this.description.value ?? '',
    });
  }
}
