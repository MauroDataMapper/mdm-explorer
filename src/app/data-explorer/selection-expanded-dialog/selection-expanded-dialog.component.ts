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
import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Uuid } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';
import { DataElementSearchResult } from '../data-explorer.types';
import { DataAccessRequestsSourceTargetIntersections } from '../data-requests.service';
import { SelectionService } from '../selection.service';

export interface SelectionExpandedDialogData {
  sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
}

@Component({
  encapsulation: ViewEncapsulation.None,
  templateUrl: './selection-expanded-dialog.component.html',
  styleUrls: ['./selection-expanded-dialog.component.scss'],
})
export class SelectionExpandedDialogComponent {
  selectedElements$: Observable<DataElementSearchResult[]>;
  sourceTargetIntersections: DataAccessRequestsSourceTargetIntersections;
  constructor(
    public dialogRef: MatDialogRef<SelectionExpandedDialogComponent>,
    private selectionService: SelectionService,
    @Inject(MAT_DIALOG_DATA) data: SelectionExpandedDialogData
  ) {
    this.selectedElements$ = selectionService.list$;
    this.sourceTargetIntersections = data.sourceTargetIntersections;
  }

  close() {
    this.dialogRef.close();
  }

  clearSelection() {
    this.selectionService.clearSelection();
    this.dialogRef.close();
  }

  deselectElement(elementId: Uuid) {
    this.selectionService.remove([elementId]);
  }
}
