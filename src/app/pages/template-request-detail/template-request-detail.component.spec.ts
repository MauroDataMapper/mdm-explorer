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
import { ActivatedRoute } from '@angular/router';
import {
  CatalogueItemDomainType,
  DataElement,
  FolderDetail,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import {
  DataElementSearchResult,
  DataRequest,
  DataRequestQueryPayload,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { TemplateRequestDetailComponent } from './template-request-detail.component';

describe('TemplateRequestDetailComponent', () => {
  let harness: ComponentHarness<TemplateRequestDetailComponent>;

  const dataRequestsStub = createDataRequestsServiceStub();
  const toastrStub = createToastrServiceStub();

  const templateId = '123';
  const activatedRoute: ActivatedRoute = {
    params: of({
      requestId: templateId,
    }),
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(TemplateRequestDetailComponent, {
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
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.request).toBeUndefined();
    expect(harness.component.requestElements).toStrictEqual([]);
    expect(harness.component.cohortQuery.rules).toStrictEqual([]);
    expect(harness.component.dataQuery.rules).toStrictEqual([]);
    expect(harness.component.state).toBe('idle');
  });

  describe('initialisation', () => {
    const template: DataRequest = {
      id: templateId,
      label: 'template',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'submitted',
    };

    it('should load a template', () => {
      dataRequestsStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(templateId);
        expect(harness.component.state).toBe('loading');
        return of(template);
      });

      harness.component.ngOnInit();

      expect(harness.component.request).toBe(template);
      expect(harness.component.state).toBe('idle');
    });

    it('should display an error if failed to load template', () => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataRequestsStub.get.mockImplementationOnce(() =>
        throwError(() => new Error('get template failed'))
      );

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(toastrSpy).toHaveBeenCalled();
      expect(harness.component.request).toBeUndefined();
    });

    it('should load template data elements and queries', () => {
      const elements: DataElement[] = [
        {
          id: '1',
          domainType: CatalogueItemDomainType.DataElement,
          label: 'element 1',
        },
        {
          id: '2',
          domainType: CatalogueItemDomainType.DataElement,
          label: 'element 2',
        },
      ];

      const cohortQueryPayload: Required<DataRequestQueryPayload> = {
        ruleId: '1',
        representationId: '2',
        type: 'cohort',
        condition: { rules: [], condition: 'and' },
      };

      const dataQueryPayload: Required<DataRequestQueryPayload> = {
        ruleId: '1',
        representationId: '3',
        type: 'data',
        condition: { rules: [], condition: 'and' },
      };

      dataRequestsStub.get.mockImplementationOnce(() => of(template));

      dataRequestsStub.listDataElements.mockImplementationOnce((req) => {
        expect(req).toBe(template);
        expect(harness.component.state).toBe('loading');
        return of(elements);
      });

      dataRequestsStub.getQuery.mockImplementationOnce(() => of(cohortQueryPayload));
      dataRequestsStub.getQuery.mockImplementationOnce(() => of(dataQueryPayload));

      harness.component.ngOnInit();

      const expectedElements = elements.map((element) => {
        return (
          element
            ? {
                ...element,
                isSelected: false,
                isBookmarked: false,
              }
            : null
        ) as DataElementSearchResult;
      });

      expect(harness.component.requestElements).toStrictEqual(expectedElements);
      expect(harness.component.state).toBe('idle');
    });
  });

  describe('copy request', () => {
    const request: DataRequest = {
      id: '1',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'template 1',
      status: 'submitted',
    };

    const requestFolder: FolderDetail = {
      id: '2',
      domainType: CatalogueItemDomainType.Folder,
      label: 'my requests',
      availableActions: [],
    };

    beforeEach(() => {
      dataRequestsStub.getRequestsFolder.mockImplementationOnce(() => of(requestFolder));
      dataRequestsStub.forkWithDialogs.mockClear();
    });

    it('should copy a template to a new request', () => {
      dataRequestsStub.forkWithDialogs.mockImplementationOnce((req, options) => {
        expect(req).toBe(request);
        expect(options?.targetFolder).toBe(requestFolder);
        return of({
          ...request,
          id: '3',
          label: 'copied request',
          status: 'unsent',
        });
      });

      harness.component.request = request;
      harness.component.copy();

      expect(dataRequestsStub.forkWithDialogs).toHaveBeenCalled();
    });
  });
});
