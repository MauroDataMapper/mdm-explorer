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
import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DataElementSearchResult } from '../data-explorer.types';
import { DataSpecificationSourceTargetIntersections } from '../data-specification.service';
import {
  SelectionExpandedDialogComponent,
  SelectionExpandedDialogData,
} from '../selection-expanded-dialog/selection-expanded-dialog.component';
import { SelectionService } from '../selection.service';

@Component({
  selector: 'mdm-selection-compact',
  templateUrl: './selection-compact.component.html',
  styleUrls: ['./selection-compact.component.scss'],
})
export class SelectionCompactComponent {
  @Input() sourceTargetIntersections: DataSpecificationSourceTargetIntersections;
  selectedElements$: Observable<DataElementSearchResult[]>;

  constructor(private selectionService: SelectionService, private matDialog: MatDialog) {
    this.sourceTargetIntersections = {
      dataSpecifications: [],
      sourceTargetIntersections: [],
    };
    this.selectedElements$ = this.selectionService.list$;
  }

  clearSelection() {
    this.selectionService.clearSelection();
  }

  showExpandedSelection() {
    if (this.sourceTargetIntersections !== undefined) {
      this.matDialog.open<SelectionExpandedDialogComponent, SelectionExpandedDialogData>(
        SelectionExpandedDialogComponent,
        {
          data: { sourceTargetIntersections: this.sourceTargetIntersections },
          panelClass: 'mdm-selection-expanded-dialog',
        }
      );
    }
  }
}
