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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { Uuid } from '@maurodatamapper/mdm-resources';

export interface ShareDataSpecificationDialogOptions {
  sharedWithCommunity: boolean;
}

export interface ShareDataSpecificationDialogResponse {
  sharedWithCommunity: boolean;
}

@Component({
  selector: 'mdm-share-data-specification-dialog',
  templateUrl: './share-data-specification-dialog.component.html',
  styleUrls: ['./share-data-specification-dialog.component.scss'],
})
export class ShareDataSpecificationDialogComponent implements OnInit {
  initialSharedValue: boolean;
  dialogCheckboxValue: boolean;
  checkBoxDisabled: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<
      ShareDataSpecificationDialogComponent,
      ShareDataSpecificationDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA)
    @Optional()
    private data: ShareDataSpecificationDialogOptions
  ) {
    this.initialSharedValue = this.data.sharedWithCommunity;
    this.dialogCheckboxValue = this.data.sharedWithCommunity;
  }

  ngOnInit(): void {}

  update() {
    this.dialogRef.close({
      sharedWithCommunity: this.dialogCheckboxValue,
    });
  }

  close() {
    this.dialogRef.close();
  }
}