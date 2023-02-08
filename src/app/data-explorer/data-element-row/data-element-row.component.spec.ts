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
import { SimpleChange, SimpleChanges } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { MockComponent } from 'ng-mocks';
import {
  CreateRequestEvent,
  DataElementInRequestComponent,
  RequestElementAddDeleteEvent,
} from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  DataElementSearchResult,
  DataItemDeleteEvent,
  SelectableDataElementSearchResultCheckedEvent,
  SelectionChange,
} from '../data-explorer.types';
import { DataElementRowComponent } from './data-element-row.component';

describe('DataElementRowComponent_DataElementInRequest', () => {
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
      declarations: [MockComponent(DataElementInRequestComponent)],
    });
  });

  /* Disabled for now. Unable to identify button. This needs to be restored.
  it('should raise a delete event when "Remove" button is clicked', () => {
    const component = harness.component;
    const emitSpy = jest.spyOn(component.delete, 'emit');
    const dom = harness.fixture.debugElement;
    harness.detectChanges();
    const button: DebugElement = dom.query(
      (de) => de.name === 'button' && de.nativeElement.innerHTML === ' Remove '
    );
    const event: DataElementDeleteEvent = {
      item: component.item!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };

    button.triggerEventHandler('click', event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });
  */

  it('should raise a updateAllChildrenSelected event when ngModelChange is triggered', () => {
    // Arrange
    const component = harness.component;
    const emitSpy = jest.spyOn(component.updateAllChildrenSelected, 'emit');

    // Act
    component.onNgModelChange();

    // Assert
    expect(emitSpy).toHaveBeenCalled();
  });

  describe('on changes', () => {
    it('should select data element when parent data class is selected', () => {
      harness.component.item = item;
      expect(harness.component.item.isSelected).toBe(false);

      const classSelected: SelectionChange = {
        changedBy: {
          instigator: 'parent',
        },
        isSelected: true,
      };

      const changes: SimpleChanges = {
        classSelected: new SimpleChange(null, null, false),
      };

      const checkedEventSpy = jest.spyOn(harness.component.checkedParent, 'emit');

      harness.component.classSelected = classSelected;
      harness.component.ngOnChanges(changes);

      expect(harness.component.item.isSelected).toBe(true);
      expect(checkedEventSpy).toHaveBeenCalled();
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

    it('should raise a request add or delete event', () => {
      const event: RequestElementAddDeleteEvent = {
        adding: true,
        dataModel: {
          label: 'model',
          domainType: CatalogueItemDomainType.DataModel,
        },
        dataElement: item,
      };

      const eventSpy = jest.spyOn(harness.component.modifyingElementsInRequest, 'emit');

      harness.component.onModifyingElementsInRequest(event);
      expect(eventSpy).toHaveBeenCalledWith(event);
    });

    it('should raise a remove element event', () => {
      const event: DataItemDeleteEvent = {
        dataElement: item,
      };

      const eventSpy = jest.spyOn(harness.component.removingElement, 'emit');

      harness.component.item = item;
      harness.component.onRemovingElement();
      expect(eventSpy).toHaveBeenCalledWith(event);
    });
  });
});
