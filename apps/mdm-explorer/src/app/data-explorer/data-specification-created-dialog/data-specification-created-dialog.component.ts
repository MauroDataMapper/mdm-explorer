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
import { DataElementInstance, DataSpecification } from '../data-explorer.types';

export interface DataSpecificationCreatedData {
  dataSpecification: DataModel;
  addedClass?: DataClass;
  addedElements?: DataElementInstance[];
  suppressViewDataSpecifications?: boolean;
}

export type DataSpecificationCreatedAction =
  | 'continue'
  | 'view-data-specifications'
  | 'view-data-specification-detail';

export interface DataSpecificationCreatedResponse {
  dataSpecification: DataSpecification;
  action: DataSpecificationCreatedAction;
}

@Component({
  selector: 'mdm-data-specification-created-dialog',
  templateUrl: './data-specification-created-dialog.component.html',
  styleUrls: ['./data-specification-created-dialog.component.scss'],
})
export class DataSpecificationCreatedDialogComponent implements OnInit {
  name = '';
  subHeading = '';
  items: string[] = [];
  hideViewDataSpecificationsButton = false;

  constructor(
    private dialogRef: MatDialogRef<
      DataSpecificationCreatedDialogComponent,
      DataSpecificationCreatedAction
    >,
    @Inject(MAT_DIALOG_DATA) private data: DataSpecificationCreatedData
  ) {}

  ngOnInit(): void {
    this.name = this.data.dataSpecification.label;

    this.hideViewDataSpecificationsButton = !!this.data.suppressViewDataSpecifications;

    if (this.data.addedClass) {
      this.subHeading = `1 class with all elements added to '${this.name}'`;
      this.items = [this.data.addedClass.label];
    }

    if (this.data.addedElements) {
      this.subHeading = `The following elements were added to '${this.name}'`;
      this.items = this.data.addedElements.map((de) => de.label);
    }
  }

  close(action: DataSpecificationCreatedAction) {
    this.dialogRef.close(action);
  }
}
