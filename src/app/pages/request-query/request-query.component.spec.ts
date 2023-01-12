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
import { BroadcastService } from 'src/app/core/broadcast.service';
import {
  DataElementSearchResult,
  DataRequest,
  DataRequestQuery,
  DataRequestQueryPayload,
  DataRequestQueryType,
  QueryCondition,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { createBroadcastServiceStub } from 'src/app/testing/stubs/broadcast.stub';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { RequestQueryComponent } from './request-query.component';

describe('RequestQueryComponent', () => {
  let harness: ComponentHarness<RequestQueryComponent>;

  const dataRequestsStub = createDataRequestsServiceStub();
  const toastrStub = createToastrServiceStub();
  const broadcastStub = createBroadcastServiceStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();

  const requestId: Uuid = '1234';

  const setupComponentTest = async (queryType: DataRequestQueryType) => {
    const activatedRoute: ActivatedRoute = {
      params: of<Params>({
        requestId,
        queryType,
      }),
    } as ActivatedRoute;

    return await setupTestModuleForComponent(RequestQueryComponent, {
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
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
    const type: DataRequestQueryType = 'cohort';
    const dataRequest: DataRequest = {
      id: requestId,
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

    const query: DataRequestQuery = {
      ruleId: '111',
      representationId: '222',
      type,
      condition,
    };

    beforeEach(async () => {
      harness = await setupComponentTest(type);
    });

    it('should show an error if request is missing', fakeAsync(() => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataRequestsStub.get.mockImplementationOnce(() => throwError(() => new Error()));

      harness.component.ngOnInit();
      tick();

      expect(harness.component.status).toBe('error');
      expect(toastrSpy).toHaveBeenCalled();
    }));

    it('should load request which has no existing query', fakeAsync(() => {
      dataRequestsStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(requestId);
        return of(dataRequest);
      });

      dataRequestsStub.listDataElements.mockImplementationOnce((req) => {
        expect(req).toStrictEqual(dataRequest);
        return of(dataElements);
      });

      dataRequestsStub.getQuery.mockImplementationOnce((id, t) => {
        expect(id).toBe(requestId);
        expect(t).toBe(type);
        return of(undefined);
      });

      harness.component.ngOnInit();
      tick();

      expect(harness.component.status).toBe('ready');
      expect(harness.component.dataElements).toStrictEqual(
        dataElements.map((de) => de as DataElementSearchResult)
      );
      expect(harness.component.query).toBeUndefined();
      expect(harness.component.condition.rules).toStrictEqual([]);
    }));

    it('should load request with existing query', fakeAsync(() => {
      dataRequestsStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(requestId);
        return of(dataRequest);
      });

      dataRequestsStub.listDataElements.mockImplementationOnce((req) => {
        expect(req).toStrictEqual(dataRequest);
        return of(dataElements);
      });

      dataRequestsStub.getQuery.mockImplementationOnce((id, t) => {
        expect(id).toBe(requestId);
        expect(t).toBe(type);
        return of(query);
      });

      harness.component.ngOnInit();
      tick();

      expect(harness.component.status).toBe('ready');
      expect(harness.component.dataElements).toStrictEqual(
        dataElements.map((de) => de as DataElementSearchResult)
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
    const type: DataRequestQueryType = 'cohort';
    const dataRequest: DataRequest = {
      id: requestId,
      label: 'test',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'unsent',
    };

    const query: DataRequestQuery = {
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
      harness.component.dataRequest = dataRequest;
      harness.component.queryType = type;
      harness.component.query = query;
      harness.component.condition = query.condition;
      harness.component.dirty = true;
    });

    it('should save a query to the data request', fakeAsync(() => {
      const toastrSpy = jest.spyOn(toastrStub, 'success');

      dataRequestsStub.createOrUpdateQuery.mockImplementationOnce((id, pl) => {
        expect(id).toBe(dataRequest.id);
        expect(pl.ruleId).toBe(query.ruleId);
        expect(pl.representationId).toBe(query.representationId);
        expect(pl.type).toBe(type);
        expect(pl.condition).toBe(query.condition);
        return of<DataRequestQuery>({
          ...(pl as Required<DataRequestQueryPayload>),
        });
      });

      harness.component.save();
      tick();

      expect(toastrSpy).toHaveBeenCalled();
      expect(harness.component.dirty).toBeFalsy();
    }));

    it('should show an error when query failed to save', fakeAsync(() => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataRequestsStub.createOrUpdateQuery.mockImplementationOnce((id, pl) => {
        expect(id).toBe(dataRequest.id);
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
