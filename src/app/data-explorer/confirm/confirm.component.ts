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

type ConfirmCallbackType = () => any;

export interface ConfirmData {
  heading: string;
  subheading: string;
  content: string[];
  buttonActionCaption: string;
  buttonCloseCaption: string;
  buttonActionCallback: ConfirmCallbackType;
}

@Component({
  selector: 'mdm-confirm',
  templateUrl: './confirm.component.html',
  styleUrls: ['./confirm.component.scss'],
})

// Advisory: This component has a class wrapper which is more
// convenient to use
export class ConfirmComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ConfirmData
  ) {}

  ngOnInit(): void {}

  action() {
    this.dialogRef.close();
    this.data.buttonActionCallback();
  }

  close() {
    this.dialogRef.close();
  }
}
