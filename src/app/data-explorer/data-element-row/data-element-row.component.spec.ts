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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { MockComponent } from 'ng-mocks';
import {
  DataElementInDataSpecificationComponent,
  DataSpecificationElementAddDeleteEvent,
} from '../../shared/data-element-in-data-specification/data-element-in-data-specification.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  DataElementSearchResult,
  DataItemDeleteEvent,
  SelectableDataElementSearchResultCheckedEvent,
} from '../data-explorer.types';
import { DataElementRowComponent } from './data-element-row.component';

describe('DataElementRowComponent', () => {
  let harness: ComponentHarness<DataElementRowComponent>;

  const item: DataElementSearchResult = {
    id: '111',
    label: 'element',
    model: '222',
    dataClass: '333',
    isSelected: false,
    isBookmarked: false,
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementRowComponent, {
      declarations: [MockComponent(DataElementInDataSpecificationComponent)],
    });
  });

  describe('initialisation', () => {
    it.each([
      ['nested', true],
      ['default', false],
    ])('should set padding to %p when input set to %p', (expected, value) => {
      harness.component.nestedPadding = value;
      harness.component.ngOnInit();
      expect(harness.component.padding).toBe(expected);
    });
  });

  describe('onNgModelChange', () => {
    it('should not raise an updateAllChildrenSelected event when ngModelChange is triggered but there is no item', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.onNgModelChange();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise an updateAllChildrenSelected event when ngModelChange is triggered', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.item = item;
      harness.component.onNgModelChange();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('event handlers', () => {
    it.each([true, false])('should raise an event when item checked to %p', (checked) => {
      const eventSpy = jest.spyOn(harness.component.checked, 'emit');
      const event = { checked } as MatCheckboxChange;
      const expected: SelectableDataElementSearchResultCheckedEvent = {
        item,
        checked,
      };

      harness.component.item = item;
      harness.component.itemChecked(event);

      expect(eventSpy).toHaveBeenCalledWith(expected);
    });

    it('should raise a data specification add or delete event', () => {
      const event: DataSpecificationElementAddDeleteEvent = {
        adding: true,
        dataModel: {
          label: 'model',
          domainType: CatalogueItemDomainType.DataModel,
        },
        dataElement: item,
      };

      const eventSpy = jest.spyOn(harness.component.dataSpecificationAddDelete, 'emit');

      harness.component.handleDataSpecificationAddDelete(event);
      expect(eventSpy).toHaveBeenCalledWith(event);
    });

    it('should raise a remove element event', () => {
      const event: DataItemDeleteEvent = {
        dataElement: item,
      };

      const eventSpy = jest.spyOn(harness.component.deleteItemEvent, 'emit');

      harness.component.item = item;
      harness.component.removeElement();
      expect(eventSpy).toHaveBeenCalledWith(event);
    });
  });
});
