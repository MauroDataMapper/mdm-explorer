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
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MockComponent, MockDirective, ngMocks } from 'ng-mocks';
import { DataElementMultiSelectComponent } from 'src/app/shared/data-element-multi-select/data-element-multi-select.component';
import { createMatDialogRefStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementSearchResult } from '../data-explorer.types';
import { SelectionService } from '../selection.service';
import { SelectionExpandedDialogComponent } from './selection-expanded-dialog.component';

describe('SelectionExpandedDialogComponent', () => {
  let harness: ComponentHarness<SelectionExpandedDialogComponent>;
  let selectionService: SelectionService;
  const dialogRefStub = createMatDialogRefStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SelectionExpandedDialogComponent, {
      declarations: [
        MockDirective(MatDialogContent),
        MockDirective(MatDialogActions),
        MockComponent(DataElementMultiSelectComponent),
        MockComponent(MatIcon),
        MockComponent(MatCheckbox),
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: dialogRefStub,
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: [],
        },
      ],
    });
    selectionService = harness.fixture.componentRef.injector.get(SelectionService);
  });

  beforeEach(() => {
    dialogRefStub.close.mockClear();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('behaviours', () => {
    const startingSelection = [{ id: '1' } as DataElementSearchResult];

    beforeEach(() => {
      selectionService.clearSelection();
      selectionService.add(startingSelection);
      harness.detectChanges();
    });

    it('should close', () => {
      harness.component.close();
      expect(dialogRefStub.close).toHaveBeenCalled();
    });

    it('should clear the selection', () => {
      let selectedElements: DataElementSearchResult[] | undefined;
      harness.component.selectedElements$.subscribe((v) => (selectedElements = v));
      expect(selectedElements).toHaveLength(startingSelection.length);

      const spy = jest.spyOn(selectionService, 'clearSelection');

      harness.component.clearSelection();

      expect(selectedElements).toHaveLength(0);
      expect(spy).toHaveBeenCalled();
    });

    it('should remove individual selected items', () => {
      const firstItem = { id: '1' } as DataElementSearchResult;
      const secondItem = { id: '2' } as DataElementSearchResult;
      selectionService.add([firstItem, secondItem]);

      let selectedElements: DataElementSearchResult[] | undefined;
      harness.component.selectedElements$.subscribe((v) => (selectedElements = v));
      expect(selectedElements).toContainEqual(firstItem);
      expect(selectedElements).toContainEqual(secondItem);

      harness.component.deselectElement(firstItem.id);
      expect(selectedElements).not.toContainEqual(firstItem);
      expect(selectedElements).toContainEqual(secondItem);
    });

    it('should forward properties to mdm-data-element-multi-select', () => {
      const withSelected = ngMocks.find<DataElementMultiSelectComponent>(
        'mdm-data-element-multi-select',
      ).componentInstance;
      expect(withSelected.dataElements).toEqual(startingSelection);
      expect(withSelected.sourceTargetIntersections).toEqual(
        harness.component.sourceTargetIntersections,
      );
    });
  });
});
