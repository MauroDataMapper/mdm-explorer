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
import { MatCheckboxChange } from '@angular/material/checkbox';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  createMdmEndpointsStub,
  MdmEndpointsServiceStub,
} from 'src/app/testing/stubs/mdm-endpoints.stub';
import { DataElementSearchResult } from '../data-explorer.types';
import { DataElementSearchResultComponent } from './data-element-search-result.component';
import { createDataElementSearchServiceStub } from 'src/app/testing/stubs/data-element-search.stub';
import { DataElementSearchService } from '../data-element-search.service';
import { MatDialog } from '@angular/material/dialog';
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';

describe('DataElementSearchResultComponent', () => {
  let harness: ComponentHarness<DataElementSearchResultComponent>;
  const endpointsStub: MdmEndpointsServiceStub = createMdmEndpointsStub();
  const dataElementsSearchStub = createDataElementSearchServiceStub();
  const matDialogStub = createMatDialogStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementSearchResultComponent, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: DataElementSearchService,
          useValue: dataElementsSearchStub,
        },
        {
          provide: MatDialog,
          useValue: matDialogStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.item).toBeUndefined();
  });

  it('should not emit a checked event with no item', () => {
    const emitSpy = jest.spyOn(harness.component.checked, 'emit');
    const event = {} as MatCheckboxChange;
    harness.component.itemChecked(event);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it.each([true, false])('should emit a checked event when checked is %p', (checked) => {
    const emitSpy = jest.spyOn(harness.component.checked, 'emit');
    const event = { checked } as MatCheckboxChange;
    const item: DataElementSearchResult = {
      id: '1',
      label: 'test',
      breadcrumbs: [],
      dataClass: '2',
      model: '3',
      isSelected: false,
      isBookmarked: false,
    };

    harness.component.item = item;
    harness.component.itemChecked(event);

    expect(emitSpy).toHaveBeenCalledWith({ item, checked });
  });

  it('should emit a checked event when the checkbox value changes', () => {
    const item: DataElementSearchResult = {
      id: '1',
      label: 'test',
      breadcrumbs: [],
      dataClass: '2',
      model: '3',
      isSelected: false,
      isBookmarked: false,
    };

    harness.component.item = item;
    harness.detectChanges();
    const dom = harness.fixture.debugElement;
    const checkbox = dom.query((el) => el.name === 'mat-checkbox');
    const emitSpy = jest.spyOn(harness.component.checked, 'emit');
    const event = { checked: true } as MatCheckboxChange;

    checkbox.triggerEventHandler('change', event);
    expect(emitSpy).toHaveBeenCalledWith({ item, checked: true });
  });

  it('should not emit a bookmark event with no item', () => {
    const emitSpy = jest.spyOn(harness.component.bookmark, 'emit');
    harness.component.toggleBookmark(true);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'should emit a bookmark event when selected is %p',
    (selected) => {
      const emitSpy = jest.spyOn(harness.component.bookmark, 'emit');
      const item: DataElementSearchResult = {
        id: '1',
        label: 'test',
        breadcrumbs: [],
        dataClass: '2',
        model: '3',
        isSelected: false,
        isBookmarked: false,
      };

      harness.component.item = item;
      harness.component.toggleBookmark(selected);

      expect(emitSpy).toHaveBeenCalledWith({ item, selected });
    }
  );
});
