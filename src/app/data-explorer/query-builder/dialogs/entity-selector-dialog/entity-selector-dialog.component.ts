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
import { Entity } from '../../query-builder.interfaces';
import { MatSelectChange } from '@angular/material/select';

export interface EntitySelectorDialogResponse {
  result: boolean;
  selectedEntity?: Entity;
}

export interface EntitySelectorDialogData {
  heading: string;
  entities?: (Entity | undefined)[] | null | undefined;
  okLabel?: string;
  cancelLabel?: string;
}

@Component({
  selector: 'mdm-entity-selector-dialog',
  templateUrl: './entity-selector-dialog.component.html',
  styleUrls: ['./entity-selector-dialog.component.scss'],
})
export class EntitySelectorDialogComponent implements OnInit {
  public selectedEntity: Entity | undefined;

  constructor(
    private dialogRef: MatDialogRef<
      EntitySelectorDialogComponent,
      EntitySelectorDialogResponse
    >,
    @Inject(MAT_DIALOG_DATA) private data: EntitySelectorDialogData,
  ) {}

  get heading() {
    return this.data.heading;
  }

  get entities() {
    return this.data.entities;
  }

  get okLabel() {
    return this.data.okLabel ?? 'Ok';
  }

  get cancelLabel() {
    return this.data.cancelLabel ?? 'Cancel';
  }

  ngOnInit(): void {
    this.selectedEntity = undefined;
  }

  close(result: boolean) {
    this.dialogRef.close({ result, selectedEntity: this.selectedEntity });
  }

  onSelectionChange(_: MatSelectChange): void {
    this.close(true);
  }
}
