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
import { DataClass, DataModel } from '@maurodatamapper/mdm-resources';
import { DataElementInstance } from '../data-explorer.types';

export interface DataSpecificationUpdatedData {
  dataSpecification: DataModel;
  addedClass?: DataClass;
  addedElements?: DataElementInstance[];
  removedElements?: DataElementInstance[];
  suppressViewDataSpecifications?: boolean;
}

export type DataSpecificationUpdatedAction =
  | 'continue'
  | 'view-data-specifications'
  | 'view-data-specification-detail';

@Component({
  selector: 'mdm-data-specification-updated-dialog',
  templateUrl: './data-specification-updated-dialog.component.html',
  styleUrls: ['./data-specification-updated-dialog.component.scss'],
})
export class DataSpecificationUpdatedDialogComponent implements OnInit {
  name = '';
  subHeading = '';
  items: string[] = [];

  constructor(
    private dialogRef: MatDialogRef<
      DataSpecificationUpdatedDialogComponent,
      DataSpecificationUpdatedAction
    >,
    @Inject(MAT_DIALOG_DATA) private data: DataSpecificationUpdatedData,
  ) {}

  ngOnInit(): void {
    this.name = this.data.dataSpecification.label;

    if (this.data.addedClass) {
      this.subHeading = `1 class with all elements added to '${this.name}'`;
      this.items = [this.data.addedClass.label];
    }

    if (this.data.addedElements && this.data.addedElements.length > 0) {
      this.subHeading = `The following elements were added to '${this.name}'`;
      this.items = this.data.addedElements.map((de) => de.label);
    }

    if (this.data.removedElements && this.data.removedElements.length > 0) {
      this.subHeading = `The following elements were removed from '${this.name}'`;
      this.items = this.data.removedElements.map((de) => de.label);
    }
  }

  close(action: DataSpecificationUpdatedAction) {
    this.dialogRef.close(action);
  }
}
