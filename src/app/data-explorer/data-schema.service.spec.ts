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
import { cold } from 'jest-marbles';
import { DataModelService } from '../mauro/data-model.service';
import { isDataModel } from '../mauro/mauro.types';
import { createDataModelServiceStub } from '../testing/stubs/data-model.stub';
import { buildDataClass, buildDataElement } from '../testing/stubs/data-schema.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import {
  DataClassWithElements,
  DataSpecification,
  DataSchema,
} from './data-explorer.types';
import { DataSchemaService } from './data-schema.service';

describe('DataSchemaService', () => {
  let service: DataSchemaService;
  const dataModelsStub = createDataModelServiceStub();

  const dataClass1Schema1: DataClassWithElements = {
    dataClass: buildDataClass('s1.class 1'),
    dataElements: [
      buildDataElement('s1.c1.element 1'),
      buildDataElement('s1.c1.element 2'),
    ],
  };

  const dataClass2Schema1: DataClassWithElements = {
    dataClass: buildDataClass('s1.class 2'),
    dataElements: [
      buildDataElement('s1.c2.element 1'),
      buildDataElement('s1.c2.element 2'),
    ],
  };

  const dataClass1Schema2: DataClassWithElements = {
    dataClass: buildDataClass('s2.class 1'),
    dataElements: [
      buildDataElement('s2.c1.element 1'),
      buildDataElement('s2.c1.element 2'),
    ],
  };

  const dataSchema1: DataSchema = {
    schema: buildDataClass('schema 1'),
    dataClasses: [dataClass1Schema1, dataClass2Schema1],
  };

  const dataSchema2: DataSchema = {
    schema: buildDataClass('schema 2'),
    dataClasses: [dataClass1Schema2],
  };

  const schemas: DataSchema[] = [dataSchema1, dataSchema2];

  beforeEach(() => {
    service = setupTestModuleForService(DataSchemaService, {
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
      ],
    });
  });

  beforeEach(() => {
    dataModelsStub.getDataClasses.mockClear();
    dataModelsStub.getDataElementsForDataClass.mockClear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all data classes from a list of schemas', () => {
    const expected = [dataClass1Schema1, dataClass2Schema1, dataClass1Schema2];
    const actual = service.reduceDataClassesFromSchemas(schemas);
    expect(actual).toStrictEqual(expected);
  });

  it('should get all data elements from a single schema', () => {
    const expected = [
      ...dataClass1Schema1.dataElements,
      ...dataClass2Schema1.dataElements,
    ];
    const actual = service.reduceDataElementsFromSchema(dataSchema1);
    expect(actual).toStrictEqual(expected);
  });

  it('should get all data elements from a list of schemas', () => {
    const expected = [
      ...dataClass1Schema1.dataElements,
      ...dataClass2Schema1.dataElements,
      ...dataClass1Schema2.dataElements,
    ];
    const actual = service.reduceDataElementsFromSchemas(schemas);
    expect(actual).toStrictEqual(expected);
  });

  it('should load all data elements for a data class', () => {
    dataModelsStub.getDataElementsForDataClass.mockImplementationOnce(() => {
      return cold('--a|', { a: dataClass1Schema1.dataElements });
    });

    const expected$ = cold('--a|', { a: dataClass1Schema1 });
    const actual$ = service.loadDataClassElements(dataClass1Schema1.dataClass);

    expect(actual$).toBeObservable(expected$);
    expect(actual$).toSatisfyOnFlush(() => {
      expect(dataModelsStub.getDataElementsForDataClass).toHaveBeenCalledWith(
        dataClass1Schema1.dataClass,
      );
    });
  });

  it('should load all data classes for a data schema', () => {
    dataModelsStub.getDataClasses.mockImplementationOnce(() => {
      return cold('--a|', { a: dataSchema1.dataClasses.map((dc) => dc.dataClass) });
    });

    dataModelsStub.getDataElementsForDataClass.mockImplementation((dc) => {
      return cold('--a|', {
        a: dataSchema1.dataClasses.find((dsc) => dsc.dataClass.label === dc.label)
          ?.dataElements,
      });
    });

    const expected$ = cold('-----(a|)', { a: dataSchema1.dataClasses });
    const actual$ = service.loadDataClasses(dataSchema1.schema);

    expect(actual$).toBeObservable(expected$);
    expect(actual$).toSatisfyOnFlush(() => {
      expect(dataModelsStub.getDataClasses).toHaveBeenCalledWith(dataSchema1.schema);
      expect(dataModelsStub.getDataElementsForDataClass).toHaveBeenNthCalledWith(
        1,
        dataClass1Schema1.dataClass,
      );
      expect(dataModelsStub.getDataElementsForDataClass).toHaveBeenNthCalledWith(
        2,
        dataClass2Schema1.dataClass,
      );
    });
  });

  it('should load all data schemas for a data specification', () => {
    const dataSpecification: DataSpecification = {
      id: '123',
      label: 'data specification',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'unsent',
    };

    dataModelsStub.getDataClasses.mockImplementation((arg) => {
      if (isDataModel(arg)) {
        return cold('--a|', { a: schemas.map((s) => s.schema) });
      }

      return cold('--a|', {
        a: schemas
          .find((s) => s.schema.label === arg.label)
          ?.dataClasses.map((dcwe) => dcwe.dataClass),
      });
    });

    dataModelsStub.getDataElementsForDataClass.mockImplementation((dc) => {
      // Infer schema number from label name, then match to array index
      const schemaIndex = Number(dc.label[1]) - 1;

      return cold('--a|', {
        a: schemas[schemaIndex].dataClasses.find(
          (dsc) => dsc.dataClass.label === dc.label,
        )?.dataElements,
      });
    });

    const expected$ = cold('-------(a|)', { a: schemas });
    const actual$ = service.loadDataSchemas(dataSpecification);
    expect(actual$).toBeObservable(expected$);
    expect(actual$).toSatisfyOnFlush(() => {
      // Data specification
      expect(dataModelsStub.getDataClasses).toHaveBeenNthCalledWith(1, dataSpecification);

      // Schemas
      expect(dataModelsStub.getDataClasses).toHaveBeenNthCalledWith(
        2,
        dataSchema1.schema,
      );
      expect(dataModelsStub.getDataClasses).toHaveBeenNthCalledWith(
        3,
        dataSchema2.schema,
      );

      // Classes
      expect(dataModelsStub.getDataElementsForDataClass).toHaveBeenNthCalledWith(
        1,
        dataClass1Schema1.dataClass,
      );
      expect(dataModelsStub.getDataElementsForDataClass).toHaveBeenNthCalledWith(
        2,
        dataClass2Schema1.dataClass,
      );
      expect(dataModelsStub.getDataElementsForDataClass).toHaveBeenNthCalledWith(
        3,
        dataClass1Schema2.dataClass,
      );
    });
  });
});
