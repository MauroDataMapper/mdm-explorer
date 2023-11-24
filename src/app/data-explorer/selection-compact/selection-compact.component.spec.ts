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
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { RouterLinkWithHref } from '@angular/router';
import { MockComponent, MockDirective, ngMocks } from 'ng-mocks';
import { DataElementMultiSelectComponent } from 'src/app/shared/data-element-multi-select/data-element-multi-select.component';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementSearchResult } from '../data-explorer.types';
import { SelectionExpandedDialogComponent } from '../selection-expanded-dialog/selection-expanded-dialog.component';
import { SelectionService } from '../selection.service';

import { SelectionCompactComponent } from './selection-compact.component';

describe('SearchFiltersComponent', () => {
  let harness: ComponentHarness<SelectionCompactComponent>;
  let selectionService: SelectionService;
  const dialogStub = createMatDialogStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(SelectionCompactComponent, {
      providers: [
        {
          provide: MatDialog,
          useValue: dialogStub,
        },
      ],
      declarations: [
        MockComponent(DataElementMultiSelectComponent),
        MockComponent(MatIcon),
        MockDirective(RouterLinkWithHref),
      ],
    });
    selectionService = harness.fixture.componentRef.injector.get(SelectionService);
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

    it('should clear the selection', () => {
      let selectedElements: DataElementSearchResult[] | undefined;
      harness.component.selectedElements$.subscribe((v) => (selectedElements = v));
      expect(selectedElements).not.toHaveLength(0);

      const spy = jest.spyOn(selectionService, 'clearSelection');

      harness.component.clearSelection();

      expect(selectedElements).toHaveLength(0);
      expect(spy).toHaveBeenCalled();
    });

    it('should open the expanded dialog', () => {
      const spy = jest.spyOn(dialogStub, 'open');

      harness.component.showExpandedSelection();

      expect(spy).toHaveBeenCalledWith(
        SelectionExpandedDialogComponent,
        expect.anything(),
      );
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
