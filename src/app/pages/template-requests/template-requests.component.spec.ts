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
import { CatalogueItemDomainType, FolderDetail } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { DataRequest } from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { TemplateRequestsComponent } from './template-requests.component';

describe('TemplateRequestsComponent', () => {
  let harness: ComponentHarness<TemplateRequestsComponent>;

  const dataRequestsStub = createDataRequestsServiceStub();
  const toastrStub = createToastrServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(TemplateRequestsComponent, {
      providers: [
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
    expect(harness.component.templateRequests).toStrictEqual([]);
    expect(harness.component.state).toBe('idle');
  });

  describe('initialisation', () => {
    it('should list all templates', () => {
      const templates: DataRequest[] = [
        {
          id: '1',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'template 1',
          status: 'submitted',
        },
        {
          id: '2',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'template 2',
          status: 'submitted',
        },
      ];

      dataRequestsStub.listTemplates.mockImplementationOnce(() => of(templates));

      harness.component.ngOnInit();

      expect(harness.component.templateRequests).toStrictEqual(templates);
    });

    it('it should raise error if failed to get templates', () => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataRequestsStub.listTemplates.mockImplementationOnce(() =>
        throwError(() => new Error('list templates failed'))
      );

      harness.component.ngOnInit();

      expect(toastrSpy).toHaveBeenCalled();
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

      harness.component.copy(request);

      expect(dataRequestsStub.forkWithDialogs).toHaveBeenCalled();
    });
  });
});
