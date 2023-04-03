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
import { DataSpecificationElementAddDeleteEvent } from '../../shared/data-element-in-data-specification/data-element-in-data-specification.component';
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
} from '../data-explorer.types';
import { DataSchemaService } from '../data-schema.service';

import { DataSchemaRowComponent } from './data-schema-row.component';

describe('DataSchemaRowComponent', () => {
  let harness: ComponentHarness<DataSchemaRowComponent>;
  const dataSchemasStub = createDataSchemaServiceStub();

  const dataElements: DataElementSearchResult[] = [
    buildDataElement('element1'),
    buildDataElement('element2'),
  ];

  const dataSchema: DataSchema = {
    schema: buildDataClass('schema1'),
    dataClasses: [
      {
        dataClass: buildDataClass('class1'),
        dataElements,
      },
    ],
  };

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
    expect(harness.component.suppressViewDataSpecificationsDialogButton).toBe(false);
    expect(harness.component.canDelete).toBe(true);
    expect(harness.component.sourceTargetIntersections).toStrictEqual({
      dataSpecifications: [],
      sourceTargetIntersections: [],
    });
  });

  describe('initialisation', () => {
    it('should not set schema elements when no input set', () => {
      harness.component.ngOnInit();
      expect(harness.component.schemaElements).toStrictEqual([]);
    });

    it('should set schema elements when input is set', () => {
      dataSchemasStub.reduceDataElementsFromSchema.mockImplementationOnce(() => {
        return dataElements;
      });

      harness.component.dataSchema = dataSchema;
      harness.component.ngOnInit();

      expect(harness.component.schemaElements).toStrictEqual(dataElements);
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

  describe('ngOnModelChange', () => {
    it('should not raise a updateAllOrSomeChildrenSelected when model changes but has no data schema', () => {
      const emitSpy = jest.spyOn(
        harness.component.updateAllOrSomeChildrenSelected,
        'emit'
      );
      harness.component.onNgModelChange();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise a updateAllOrSomeChildrenSelected when has a data schema, and model changes', () => {
      const emitSpy = jest.spyOn(
        harness.component.updateAllOrSomeChildrenSelected,
        'emit'
      );

      harness.component.dataSchema = dataSchema;
      harness.component.onNgModelChange();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('update all children selected handler', () => {
    it('should not raise an event when there is no dataSchema', () => {
      const emitSpy = jest.spyOn(
        harness.component.updateAllOrSomeChildrenSelected,
        'emit'
      );
      harness.component.updateAllChildrenSelectedHandler();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise an event and state dataSchema is not selected when only some data elements are checked', () => {
      const emitSpy = jest.spyOn(
        harness.component.updateAllOrSomeChildrenSelected,
        'emit'
      );

      dataSchemasStub.reduceDataElementsFromSchema.mockImplementationOnce(() => {
        return dataElements;
      });

      harness.component.dataSchema = dataSchema;
      harness.component.ngOnInit();

      harness.component.schemaElements[0].isSelected = true;

      harness.component.updateAllChildrenSelectedHandler();

      expect(emitSpy).toHaveBeenCalled();
      expect(harness.component.dataSchema.schema.isSelected).toBe(false);
    });

    it('should raise an event and state dataSchema is selected when all data elements are checked', () => {
      const emitSpy = jest.spyOn(
        harness.component.updateAllOrSomeChildrenSelected,
        'emit'
      );

      dataSchemasStub.reduceDataElementsFromSchema.mockImplementationOnce(() => {
        return dataElements;
      });

      harness.component.dataSchema = dataSchema;
      harness.component.ngOnInit();

      harness.component.schemaElements.forEach((e) => (e.isSelected = true));

      harness.component.updateAllChildrenSelectedHandler();

      expect(emitSpy).toHaveBeenCalled();
      expect(harness.component.dataSchema.schema.isSelected).toBe(true);
    });
  });

  describe('event handlers', () => {
    const dataElement: DataElementInstance = {
      id: '111',
      label: 'element',
      model: '222',
      dataClass: '333',
      isBookmarked: false,
      isSelected: false,
    };

    it('should raise a data specification add or delete event', () => {
      const event: DataSpecificationElementAddDeleteEvent = {
        adding: true,
        dataModel: {
          label: 'model',
          domainType: CatalogueItemDomainType.DataModel,
        },
        dataElement,
      };

      const eventSpy = jest.spyOn(harness.component.dataSpecificationAddDelete, 'emit');

      harness.component.handleDataSpecificationAddDelete(event);
      expect(eventSpy).toHaveBeenCalledWith(event);
    });

    it('should raise a remove item event for an element', () => {
      const event: DataItemDeleteEvent = {
        dataElement: dataElement as DataElementSearchResult,
      };

      const expected: DataItemDeleteEvent = {
        ...event,
        dataSchema,
      };

      const eventSpy = jest.spyOn(harness.component.deleteItemEvent, 'emit');

      harness.component.dataSchema = dataSchema;
      harness.component.handleDeleteItemEvent(event);
      expect(eventSpy).toHaveBeenCalledWith(expected);
    });

    it('should raise a remove item event for a schema', () => {
      const expected: DataItemDeleteEvent = {
        dataSchema,
      };

      const eventSpy = jest.spyOn(harness.component.deleteItemEvent, 'emit');

      harness.component.dataSchema = dataSchema;
      harness.component.removeSchema();

      expect(eventSpy).toHaveBeenCalledWith(expected);
    });
  });
});
