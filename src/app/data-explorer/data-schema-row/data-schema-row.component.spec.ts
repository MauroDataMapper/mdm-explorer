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
import { RequestElementAddDeleteEvent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';
import {
  buildDataClass,
  buildDataElement,
  createDataSchemaServiceStub,
} from 'src/app/testing/stubs/data-schema.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import {
  DataElementInstance,
  DataElementSearchResult,
  DataItemDeleteEvent,
  DataSchema,
  SelectionChange,
} from '../data-explorer.types';
import { DataSchemaService } from '../data-schema.service';

import { DataSchemaRowComponent } from './data-schema-row.component';

describe('DataSchemaRowComponent', () => {
  let harness: ComponentHarness<DataSchemaRowComponent>;
  const dataSchemasStub = createDataSchemaServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DataSchemaRowComponent, {
      providers: [
        {
          provide: DataSchemaService,
          useValue: dataSchemasStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.dataSchema).toBeUndefined();
    expect(harness.component.suppressViewRequestsDialogButton).toBe(false);
    expect(harness.component.canDelete).toBe(true);
    expect(harness.component.sourceTargetIntersections).toStrictEqual({
      dataAccessRequests: [],
      sourceTargetIntersections: [],
    });
    expect(harness.component.allSelected).toBeUndefined();
  });

  describe('initialisation', () => {
    it('should not set schema elements when no input set', () => {
      harness.component.ngOnInit();
      expect(harness.component.schemaElements).toStrictEqual([]);
    });

    it('should set schema elements when input is set', () => {
      const dataElements: DataElementSearchResult[] = [
        buildDataElement('element1'),
        buildDataElement('element2'),
      ];

      const dataSchema: DataSchema = {
        schema: buildDataClass('schema1'),
        dataClasses: [
          {
            dataClass: buildDataClass('class1'),
            dataElements: dataElements,
          },
        ],
      };

      dataSchemasStub.reduceDataElementsFromSchema.mockImplementationOnce(() => {
        return dataElements;
      });

      harness.component.dataSchema = dataSchema;
      harness.component.ngOnInit();

      expect(harness.component.schemaElements).toStrictEqual(dataElements);
    });
  });

  describe('on changes', () => {
    it('should select schema when all of parent is selected', () => {
      expect(harness.component.schemaSelected).toStrictEqual({
        changedBy: { instigator: 'parent' },
        isSelected: false,
      });

      const allSelected: SelectionChange = {
        changedBy: {
          instigator: 'parent',
        },
        isSelected: true,
      };

      const changes: SimpleChanges = {
        allSelected: new SimpleChange(null, null, false),
      };

      harness.component.allSelected = allSelected;
      harness.component.ngOnChanges(changes);

      expect(harness.component.schemaSelected).toStrictEqual({
        changedBy: { instigator: 'parent' },
        isSelected: true,
      });
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

      const eventSpy = jest.spyOn(harness.component.modifyingElementsInRequest, 'emit');

      harness.component.onModifyingElementsInRequest(event);
      expect(eventSpy).toHaveBeenCalledWith(event);
    });

    it('should raise an event when parent is checked', () => {
      const parentEventSpy = jest.spyOn(harness.component.checkedParent, 'emit');
      harness.component.onCheckedParent();
      expect(parentEventSpy).toHaveBeenCalled();
    });

    it('should raise a remove item event for an element', () => {
      const dataSchema: DataSchema = {
        schema: buildDataClass('schema1'),
        dataClasses: [
          {
            dataClass: buildDataClass('class1'),
            dataElements: [],
          },
        ],
      };

      const event: DataItemDeleteEvent = {
        dataElement: dataElement as DataElementSearchResult,
      };

      const expected: DataItemDeleteEvent = {
        ...event,
        dataSchema,
      };

      const eventSpy = jest.spyOn(harness.component.removingItem, 'emit');

      harness.component.dataSchema = dataSchema;
      harness.component.onRemovingItem(event);
      expect(eventSpy).toHaveBeenCalledWith(expected);
    });

    it('should raise a remove item event for a schema', () => {
      const dataSchema: DataSchema = {
        schema: buildDataClass('schema1'),
        dataClasses: [
          {
            dataClass: buildDataClass('class1'),
            dataElements: [],
          },
        ],
      };

      const expected: DataItemDeleteEvent = {
        dataSchema,
      };

      const eventSpy = jest.spyOn(harness.component.removingItem, 'emit');

      harness.component.dataSchema = dataSchema;
      harness.component.onRemovingSchema();

      expect(eventSpy).toHaveBeenCalledWith(expected);
    });

    it.each([true, false])(
      'should raise an event when schema checked to %p',
      (checked) => {
        const eventSpy = jest.spyOn(harness.component.schemaCheckedEvent, 'emit');

        harness.component.dataSchema = {
          schema: buildDataClass('schema'),
          dataClasses: [],
        };

        const event = { checked } as MatCheckboxChange;
        harness.component.onSchemaChecked(event);

        expect(eventSpy).toHaveBeenCalled();
        expect(harness.component.schemaSelected).toStrictEqual({
          changedBy: { instigator: 'parent' },
          isSelected: checked,
        });
      }
    );

    it.each([true, false])(
      'should raise an event when one class is checked to %p',
      (checked) => {
        const schemaCheckedEventSpy = jest.spyOn(
          harness.component.schemaCheckedEvent,
          'emit'
        );

        harness.component.dataSchema = {
          schema: buildDataClass('schema'),
          dataClasses: [
            {
              dataClass: buildDataClass('class '),
              dataElements: [],
            },
          ],
        };
        harness.component.ngOnInit();

        harness.component.dataSchema.dataClasses.forEach(
          (dc) => (dc.dataClass.isSelected = checked)
        );
        harness.component.onSelectClass();

        expect(harness.component.schemaSelected).toStrictEqual({
          changedBy: { instigator: 'child' },
          isSelected: checked,
        });
        expect(schemaCheckedEventSpy).toHaveBeenCalledWith(checked);
      }
    );
  });
});
