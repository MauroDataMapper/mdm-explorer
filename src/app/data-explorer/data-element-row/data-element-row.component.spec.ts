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
import {
  CreateRequestEvent,
  RequestElementAddDeleteEvent,
} from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementSearchResult } from '../data-explorer.types';

import { DataElementRowComponent } from './data-element-row.component';

// Test output emitters including interaction with DataElementInRequest component
describe('DataElementRowComponent_DataElementInRequest', () => {
  let harness: ComponentHarness<DataElementRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementRowComponent);
    const component = harness.component;
    component.item = {
      isSelected: false,
      id: 'Id',
      model: 'ModelId',
      dataClass: 'ClassId',
      label: 'Label',
      isBookmarked: false,
    };
    component.sourceTargetIntersections = {
      dataAccessRequests: [
        {
          id: 'Access Request Id',
          label: 'My Request',
          domainType: CatalogueItemDomainType.DataModel,
        },
      ],
      sourceTargetIntersections: [
        {
          sourceDataModelId: 'DataModelId',
          targetDataModelId: 'Access Request Id',
          intersects: ['Id'],
        },
      ],
    };
  });

  it('should initialise', () => {
    harness.detectChanges();
    const dom = harness.fixture.nativeElement;
    const dataElementComponent = dom.querySelector('mdm-data-element-in-request');

    expect(dataElementComponent).toBeTruthy();
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

  it('should raise a checked event when checkbox is checked', () => {
    const component = harness.component;
    const emitSpy = jest.spyOn(component.checked, 'emit');
    const dom = harness.fixture.debugElement;
    harness.detectChanges();
    const checkboxElement = dom.query((de) => de.name === 'mat-checkbox');
    const event: MatCheckboxChange = {
      source: checkboxElement.nativeElement,
      checked: true,
    };
    expect(component.item?.isSelected).toBe(false);
    checkboxElement.triggerEventHandler('change', event);
    expect(emitSpy).toHaveBeenCalledWith({ item: component.item, checked: true });
    expect(component.item!.isSelected).toBe(true); // eslint-disable-line @typescript-eslint/no-non-null-assertion

    emitSpy.mockReset();
    event.checked = false;
    checkboxElement.nativeElement.value = false;
    checkboxElement.triggerEventHandler('change', event);
    expect(emitSpy).toHaveBeenCalledWith({ item: component.item, checked: false });
    expect(component.item!.isSelected).toBe(false); // eslint-disable-line @typescript-eslint/no-non-null-assertion
  });

  it('should raise an event when data-element-in-request emits a requestAddDelete event', () => {
    const component = harness.component;

    harness.detectChanges();
    const dom = harness.fixture.debugElement;
    const dataElementInRequestComponent = dom.query(
      (de) => de.name === 'mdm-data-element-in-request'
    );
    const emitSpy = jest.spyOn(component.requestAddDelete, 'emit');
    const event: RequestElementAddDeleteEvent = {
      adding: false,
      dataModel: {
        id: 'id',
        label: 'label',
        domainType: CatalogueItemDomainType.DataModel,
      },
      dataElement: component.item!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };
    dataElementInRequestComponent.triggerEventHandler('requestAddDelete', event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should raise an event when data-element-in-request emits a createRequestClicked event', () => {
    const component = harness.component;

    harness.detectChanges();
    const dom = harness.fixture.debugElement;
    const dataElementInRequestComponent = dom.query(
      (de) => de.name === 'mdm-data-element-in-request'
    );
    const emitSpy = jest.spyOn(component.requestCreated, 'emit');
    const event: CreateRequestEvent = {
      item: component.item!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
    };
    dataElementInRequestComponent.triggerEventHandler('createRequestClicked', event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });
});

describe('DataElementRowComponent', () => {
  let harness: ComponentHarness<DataElementRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataElementRowComponent);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.item).toBeUndefined();
  });

  it('should not raise an event when checked but has no item', () => {
    const emitSpy = jest.spyOn(harness.component.checked, 'emit');
    const event = {} as MatCheckboxChange;
    harness.component.itemChecked(event);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it.each([true, false])(
    'should raise an event when has an item and checked is %p',
    (checked) => {
      const emitSpy = jest.spyOn(harness.component.checked, 'emit');
      const event = { checked } as MatCheckboxChange;
      const item: DataElementSearchResult = {
        id: '1',
        model: '2',
        dataClass: '3',
        label: 'test',
        isBookmarked: false,
        isSelected: false,
      };

      harness.component.item = item;
      harness.component.itemChecked(event);

      expect(emitSpy).toHaveBeenCalled();
    }
  );
});
