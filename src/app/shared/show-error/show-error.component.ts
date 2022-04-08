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

export interface ShowErrorData {
  heading: string;
  subheading: string;
  message: string;
  buttonLabel: string;
}

@Component({
  selector: 'mdm-show-error',
  templateUrl: './show-error.component.html',
  styleUrls: ['./show-error.component.scss'],
})
// Advisory: This component has a class wrapper which is more
// convenient to use
export class ShowErrorComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ShowErrorComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: ShowErrorData
  ) {}

  ngOnInit(): void {}

  close() {
    this.dialogRef.close();
  }
}
