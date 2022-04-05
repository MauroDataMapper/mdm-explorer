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
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
  MdmShowErrorComponent,
  ShowErrorData,
} from '../shared/mdm-show-error/mdm-show-error.component';

@Injectable({
  providedIn: 'root',
})
export class MdmShowErrorService {
  constructor(private theMatDialog: MatDialog) {}

  open(data: ShowErrorData, widthPixels: number): MatDialogRef<MdmShowErrorComponent> {
    const dialogProps: MatDialogConfig = {};
    dialogProps.data = data;
    dialogProps.width = `${widthPixels}px`;
    dialogProps.height = 'fit-content';
    return this.theMatDialog.open<MdmShowErrorComponent, ShowErrorData>(
      MdmShowErrorComponent,
      dialogProps
    );
  }
}
