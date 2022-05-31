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
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataClass, DataModel } from '@maurodatamapper/mdm-resources';
import { DataElementInstance } from '../data-explorer.types';

export interface RequestCreatedData {
  request: DataModel;
  addedClass?: DataClass;
  addedElements?: DataElementInstance[];
  suppressViewRequests?: boolean;
}

export type RequestCreatedAction = 'continue' | 'view-requests';

@Component({
  selector: 'mdm-request-created-dialog',
  templateUrl: './request-created-dialog.component.html',
  styleUrls: ['./request-created-dialog.component.scss'],
})
export class RequestCreatedDialogComponent implements OnInit {
  name = '';
  subHeading = '';
  items: string[] = [];
  hideViewRequestsButton = false;

  constructor(
    private dialogRef: MatDialogRef<RequestCreatedDialogComponent, RequestCreatedAction>,
    @Inject(MAT_DIALOG_DATA) private data: RequestCreatedData
  ) {}

  ngOnInit(): void {
    this.name = this.data.request.label;

    this.hideViewRequestsButton = !!this.data.suppressViewRequests;

    if (this.data.addedClass) {
      this.subHeading = `1 class with all elements added to '${this.name}'`;
      this.items = [this.data.addedClass.label];
    }

    if (this.data.addedElements) {
      this.subHeading = `The following elements were added to '${this.name}'`;
      this.items = this.data.addedElements.map((de) => de.label);
    }
  }

  close(action: RequestCreatedAction) {
    this.dialogRef.close(action);
  }
}
