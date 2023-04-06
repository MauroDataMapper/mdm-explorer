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
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { MockComponent } from 'ng-mocks';
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { DataElementRowComponent } from '../data-element-row/data-element-row.component';
import {
  DataClassWithElements,
  DataElementInstance,
  DataElementSearchResult,
  DataItemDeleteEvent,
} from '../data-explorer.types';

import { DataClassRowComponent } from './data-class-row.component';

describe('DataClassRowComponent', () => {
  let harness: ComponentHarness<DataClassRowComponent>;

  const dataClassWithElements: DataClassWithElements = {
    dataClass: {
      label: 'class',
      domainType: CatalogueItemDomainType.DataClass,
      isSelected: false,
    },
    dataElements: [
      {
        id: '1',
        label: 'element 1',
        domainType: CatalogueItemDomainType.DataElement,
        model: '2',
        dataClass: '3',
        isSelected: false,
        isBookmarked: false,
      },
      {
        id: '2',
        label: 'element 2',
        domainType: CatalogueItemDomainType.DataElement,
        model: '2',
        dataClass: '3',
        isSelected: false,
        isBookmarked: false,
      },
    ],
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataClassRowComponent, {
      declarations: [MockComponent(DataElementRowComponent)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.dataClassWithElements).toBeUndefined();
    expect(harness.component.suppressViewRequestsDialogButton).toBe(false);
    expect(harness.component.canDelete).toBe(true);
    expect(harness.component.sourceTargetIntersections).toStrictEqual({
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    });
    expect(harness.component.expanded).toBe(true);
    expect(harness.component.allChildrenSelected).toBe(false);
  });

  describe('initialisation', () => {
    it('should not set classElements without dataClassWithElementsSet', () => {
      harness.component.ngOnInit();
      expect(harness.component.classElements).toStrictEqual([]);
    });

    it('should set class elements', () => {
      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.ngOnInit();
      expect(harness.component.classElements).toStrictEqual(
        dataClassWithElements.dataElements
      );
    });
  });

  describe('ngOnModelChange', () => {
    it('should not raise a updateAllChildrenSelected when model changes but has no data class', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.ngModelOnChange();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise a updateAllChildrenSelected when has a data class, and model changes', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.ngModelOnChange();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('update all children selected handler', () => {
    it('should not raise an event when there are no dataClassWithElements', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.updateAllChildrenSelectedHandler();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise an event and state dataClass is not selected when only some data elements are checked', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.ngOnInit();

      harness.component.classElements[0].isSelected = true;

      harness.component.updateAllChildrenSelectedHandler();

      expect(emitSpy).toHaveBeenCalled();
      expect(harness.component.dataClassWithElements.dataClass.isSelected).toBe(false);
    });

    it('should raise an event and state dataClass is selected when all data elements are checked', () => {
      const emitSpy = jest.spyOn(harness.component.updateAllChildrenSelected, 'emit');
      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.ngOnInit();

      harness.component.classElements.forEach((e) => (e.isSelected = true));

      harness.component.updateAllChildrenSelectedHandler();

      expect(emitSpy).toHaveBeenCalled();
      expect(harness.component.dataClassWithElements.dataClass.isSelected).toBe(true);
    });
  });

  it.each([true, false])(
    'should correctly set expanded state when initial state is %p',
    (initialState) => {
      harness.component.expanded = initialState;
      harness.component.toggleExpanded();
      expect(harness.component.expanded).toBe(!initialState);
    }
  );

  describe('event handlers', () => {
    const dataElement: DataElementInstance = {
      id: '111',
      label: 'element',
      model: '222',
      dataClass: '333',
      isBookmarked: false,
      isSelected: false,
    };

    it('should raise a request add or delete event', () => {
      const event: RequestElementAddDeleteEvent = {
        adding: true,
        dataModel: {
          label: 'model',
          domainType: CatalogueItemDomainType.DataModel,
        },
        dataElement,
      };

      const eventSpy = jest.spyOn(harness.component.requestAddDelete, 'emit');

      harness.component.handleRequestAddDelete(event);
      expect(eventSpy).toHaveBeenCalledWith(event);
    });

    it('should raise a remove element event', () => {
      const event: DataItemDeleteEvent = {
        dataElement: dataElement as DataElementSearchResult,
      };

      const expected: DataItemDeleteEvent = {
        ...event,
        dataClassWithElements,
      };

      const eventSpy = jest.spyOn(harness.component.deleteItemEvent, 'emit');

      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.handleDeleteItemEvent(event);
      expect(eventSpy).toHaveBeenCalledWith(expected);
    });

    it('should raise a remove class event', () => {
      const expected: DataItemDeleteEvent = {
        dataClassWithElements,
      };

      const eventSpy = jest.spyOn(harness.component.deleteItemEvent, 'emit');

      harness.component.dataClassWithElements = dataClassWithElements;
      harness.component.removeClass();
      expect(eventSpy).toHaveBeenCalledWith(expected);
    });
  });
});
