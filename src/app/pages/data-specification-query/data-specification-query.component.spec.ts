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
import { fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Params } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataElement,
  MdmResourcesConfiguration,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BroadcastService } from '../../core/broadcast.service';
import { StateRouterService } from '../../core/state-router.service';
import {
  DataElementSearchResult,
  DataSpecification,
  DataSpecificationQuery,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  QueryCondition,
} from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { createBroadcastServiceStub } from '../../testing/stubs/broadcast.stub';
import { createDataSpecificationServiceStub } from '../../testing/stubs/data-specifications.stub';
import { createStateRouterStub } from '../../testing/stubs/state-router.stub';
import { createToastrServiceStub } from '../../testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';

import { DataSpecificationQueryComponent } from './data-specification-query.component';

describe('DataSpecificationQueryComponent', () => {
  let harness: ComponentHarness<DataSpecificationQueryComponent>;

  const dataSpecificationStub = createDataSpecificationServiceStub();
  const toastrStub = createToastrServiceStub();
  const broadcastStub = createBroadcastServiceStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();
  const stateRouterStub = createStateRouterStub();

  const dataSpecificationId: Uuid = '1234';

  const setupComponentTest = async (queryType: DataSpecificationQueryType) => {
    const activatedRoute: ActivatedRoute = {
      params: of<Params>({
        dataSpecificationId,
        queryType,
      }),
    } as ActivatedRoute;

    return await setupTestModuleForComponent(DataSpecificationQueryComponent, {
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
        {
          provide: MdmResourcesConfiguration,
          useValue: mdmResourcesConfiguration,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
      ],
    });
  };

  describe('creation', () => {
    beforeEach(async () => {
      harness = await setupComponentTest('none');
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.status).toBe('init');
      expect(harness.component.dirty).toBeFalsy();
    });
  });

  describe('initialisation', () => {
    const type: DataSpecificationQueryType = 'cohort';
    const dataSpecification: DataSpecification = {
      id: dataSpecificationId,
      label: 'test',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'unsent',
    };

    const dataElements: DataElement[] = [
      {
        id: '1',
        label: 'element 1',
        domainType: CatalogueItemDomainType.DataElement,
      },
    ];

    const condition: QueryCondition = {
      condition: 'or',
      rules: [
        {
          field: 'test',
          operator: '=',
          value: 'value',
        },
        {
          field: 'other',
          operator: '=',
          value: 'something',
        },
      ],
    };

    const query: DataSpecificationQuery = {
      ruleId: '111',
      representationId: '222',
      type,
      condition,
    };

    beforeEach(async () => {
      harness = await setupComponentTest(type);
    });

    it('should show an error if data specification is missing', fakeAsync(() => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataSpecificationStub.get.mockImplementationOnce(() =>
        throwError(() => new Error()),
      );

      harness.component.ngOnInit();
      tick();

      expect(harness.component.status).toBe('error');
      expect(toastrSpy).toHaveBeenCalled();
    }));

    it('should load data specification which has no existing query', fakeAsync(() => {
      dataSpecificationStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(dataSpecificationId);
        return of(dataSpecification);
      });

      dataSpecificationStub.listDataElements.mockImplementationOnce((specification) => {
        expect(specification).toStrictEqual(dataSpecification);
        return of(dataElements);
      });

      dataSpecificationStub.getQuery.mockImplementationOnce((id, t) => {
        expect(id).toBe(dataSpecificationId);
        expect(t).toBe(type);
        return of(undefined);
      });

      harness.component.ngOnInit();
      tick();

      expect(harness.component.status).toBe('ready');
      expect(harness.component.dataElements).toStrictEqual(
        dataElements.map((de) => de as DataElementSearchResult),
      );
      expect(harness.component.query).toBeUndefined();
      expect(harness.component.condition.rules).toStrictEqual([]);
    }));

    it('should redirect back to data specification page if no data elements available', fakeAsync(() => {
      dataSpecificationStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(dataSpecificationId);
        return of(dataSpecification);
      });

      dataSpecificationStub.listDataElements.mockImplementationOnce((specification) => {
        expect(specification).toStrictEqual(dataSpecification);
        return of([]);
      });

      dataSpecificationStub.getQuery.mockImplementationOnce((id, t) => {
        expect(id).toBe(dataSpecificationId);
        expect(t).toBe(type);
        return of(undefined);
      });

      const routerSpy = jest.spyOn(stateRouterStub, 'navigateTo');

      harness.component.ngOnInit();
      tick();

      expect(routerSpy).toHaveBeenCalledWith([
        '/dataSpecifications/',
        dataSpecification.id,
      ]);
    }));

    it('should load data specification with existing query', fakeAsync(() => {
      dataSpecificationStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(dataSpecificationId);
        return of(dataSpecification);
      });

      dataSpecificationStub.listDataElements.mockImplementationOnce((specification) => {
        expect(specification).toStrictEqual(dataSpecification);
        return of(dataElements);
      });

      dataSpecificationStub.getQuery.mockImplementationOnce((id, t) => {
        expect(id).toBe(dataSpecificationId);
        expect(t).toBe(type);
        return of(query);
      });

      harness.component.ngOnInit();
      tick();

      expect(harness.component.status).toBe('ready');
      expect(harness.component.dataElements).toStrictEqual(
        dataElements.map((de) => de as DataElementSearchResult),
      );
      expect(harness.component.query).toStrictEqual(query);
      expect(harness.component.condition.rules).toStrictEqual(condition.rules);
    }));
  });

  describe('on query change', () => {
    beforeEach(() => {
      harness.component.dirty = false;
    });

    it('should record data is dirty when it has changed', () => {
      harness.component.original = JSON.stringify({
        condition: 'and',
        rules: [
          {
            field: 'test',
            operator: '=',
            value: 'foo',
          },
        ],
      });

      harness.component.onQueryChange({
        condition: 'and',
        rules: [
          {
            field: 'test',
            operator: '=',
            value: 'bar',
          },
        ],
      });

      expect(harness.component.dirty).toBeTruthy();
    });

    it('should record data is clean when there is no difference', () => {
      const query: QueryCondition = {
        condition: 'and',
        rules: [
          {
            field: 'test',
            operator: '=',
            value: 'foo',
          },
        ],
      };

      harness.component.original = JSON.stringify(query);

      harness.component.onQueryChange(query);

      expect(harness.component.dirty).toBeFalsy();
    });
  });

  describe('saving', () => {
    const type: DataSpecificationQueryType = 'cohort';
    const dataSpecification: DataSpecification = {
      id: dataSpecificationId,
      label: 'test',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'unsent',
    };

    const query: DataSpecificationQuery = {
      ruleId: '456',
      representationId: '789',
      type,
      condition: {
        condition: 'and',
        rules: [
          {
            field: 'test',
            operator: '=',
            value: 'foo',
          },
        ],
      },
    };

    beforeEach(() => {
      harness.component.dataSpecification = dataSpecification;
      harness.component.queryType = type;
      harness.component.query = query;
      harness.component.condition = query.condition;
      harness.component.dirty = true;
    });

    it('should save a query to the data specification', fakeAsync(() => {
      const toastrSpy = jest.spyOn(toastrStub, 'success');

      dataSpecificationStub.createOrUpdateQuery.mockImplementationOnce((id, pl) => {
        expect(id).toBe(dataSpecification.id);
        expect(pl.ruleId).toBe(query.ruleId);
        expect(pl.representationId).toBe(query.representationId);
        expect(pl.type).toBe(type);
        expect(pl.condition).toBe(query.condition);
        return of<DataSpecificationQuery>({
          ...(pl as Required<DataSpecificationQueryPayload>),
        });
      });

      harness.component.save();
      tick();

      expect(toastrSpy).toHaveBeenCalled();
      expect(harness.component.dirty).toBeFalsy();
    }));

    it('should show an error when query failed to save', fakeAsync(() => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataSpecificationStub.createOrUpdateQuery.mockImplementationOnce((id, pl) => {
        expect(id).toBe(dataSpecification.id);
        expect(pl.ruleId).toBe(query.ruleId);
        expect(pl.representationId).toBe(query.representationId);
        expect(pl.type).toBe(type);
        expect(pl.condition).toBe(query.condition);
        return throwError(() => new Error());
      });

      harness.component.save();
      tick();

      expect(toastrSpy).toHaveBeenCalled();
      expect(harness.component.dirty).toBeTruthy();
    }));
  });
});
