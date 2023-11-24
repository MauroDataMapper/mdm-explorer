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

export interface CreateDataSpecificationDialogOptions {
  showDescription?: boolean;
}

export interface CreateDataSpecificationDialogResponse {
  name: string;
  description: string;
}

@Component({
  selector: 'mdm-create-data-specification-dialog',
  templateUrl: './create-data-specification-dialog.component.html',
  styleUrls: ['./create-data-specification-dialog.component.scss'],
})
export class CreateDataSpecificationDialogComponent implements OnInit {
  dataSpecificationForm = new FormGroup({
    name: new FormControl('', [
      Validators.required, // eslint-disable-line @typescript-eslint/unbound-method
    ]),
    description: new FormControl(''),
  });

  showDescription = true;

  constructor(
    public dialogRef: MatDialogRef<
      CreateDataSpecificationDialogComponent,
      CreateDataSpecificationDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA)
    @Optional()
    private data: CreateDataSpecificationDialogOptions,
  ) {}

  get name() {
    return this.dataSpecificationForm.controls.name;
  }

  get description() {
    return this.dataSpecificationForm.controls.description;
  }

  ngOnInit(): void {
    this.showDescription = this.data?.showDescription ?? true;
  }

  close() {
    this.dialogRef.close();
  }

  create() {
    if (this.dataSpecificationForm.invalid) {
      return;
    }

    this.dialogRef.close({
      name: this.name.value ?? '',
      description: this.description.value ?? '',
    });
  }
}
