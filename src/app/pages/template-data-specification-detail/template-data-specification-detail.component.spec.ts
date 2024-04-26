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
  FolderDetail,
  MdmResourcesConfiguration,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import {
  DataSpecification,
  DataSpecificationQueryPayload,
  DataSchema,
} from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { DataSchemaService } from '../../data-explorer/data-schema.service';
import { createDataSpecificationServiceStub } from '../../testing/stubs/data-specifications.stub';
import { createDataSchemaServiceStub } from '../../testing/stubs/data-schema.stub';
import { createToastrServiceStub } from '../../testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';

import { TemplateDataSpecificationDetailComponent } from './template-data-specification-detail.component';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';

describe('TemplateDataSpecificationDetailComponent', () => {
  let harness: ComponentHarness<TemplateDataSpecificationDetailComponent>;

  const dataSpecificationStub = createDataSpecificationServiceStub();
  const dataSchemaStub = createDataSchemaServiceStub();
  const toastrStub = createToastrServiceStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();
  const securityStub = createSecurityServiceStub();

  const templateId = '123';
  const activatedRoute: ActivatedRoute = {
    params: of({
      dataSpecificationId: templateId,
    }),
  } as unknown as ActivatedRoute;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      TemplateDataSpecificationDetailComponent,
      {
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
            provide: DataSchemaService,
            useValue: dataSchemaStub,
          },
          {
            provide: ToastrService,
            useValue: toastrStub,
          },
          {
            provide: MdmResourcesConfiguration,
            useValue: mdmResourcesConfiguration,
          },
          {
            provide: SecurityService,
            useValue: securityStub,
          },
        ],
      }
    );
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.dataSpecification).toBeUndefined();
    expect(harness.component.dataSchemas).toStrictEqual([]);
    expect(harness.component.cohortQuery.rules).toStrictEqual([]);
    expect(harness.component.dataQuery.rules).toStrictEqual([]);
    expect(harness.component.state).toBe('idle');
  });

  describe('initialisation', () => {
    const template: DataSpecification = {
      id: templateId,
      label: 'template',
      domainType: CatalogueItemDomainType.DataModel,
      status: 'finalised',
    };

    it('should load a template', () => {
      dataSpecificationStub.get.mockImplementationOnce((id) => {
        expect(id).toBe(templateId);
        expect(harness.component.state).toBe('loading');
        return of(template);
      });

      harness.component.ngOnInit();

      expect(harness.component.dataSpecification).toBe(template);
      expect(harness.component.state).toBe('idle');
    });

    it('should display an error if failed to load template', () => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataSpecificationStub.get.mockImplementationOnce(() =>
        throwError(() => new Error('get template failed'))
      );

      harness.component.ngOnInit();

      expect(harness.component.state).toBe('idle');
      expect(toastrSpy).toHaveBeenCalled();
      expect(harness.component.dataSpecification).toBeUndefined();
    });

    it('should load template data schemas and queries', () => {
      const dataSchemas: DataSchema[] = [
        {
          schema: { label: 'dataSchema', domainType: CatalogueItemDomainType.DataClass },
          dataClasses: [
            {
              dataClass: {
                label: 'dataClass',
                domainType: CatalogueItemDomainType.DataClass,
              },
              dataElements: [
                {
                  id: '1',
                  domainType: CatalogueItemDomainType.DataElement,
                  label: 'element 1',
                  isSelected: false,
                  model: 'model',
                  dataClass: 'dataClass',
                  isBookmarked: false,
                },
                {
                  id: '2',
                  domainType: CatalogueItemDomainType.DataElement,
                  label: 'element 2',
                  isSelected: false,
                  model: 'model',
                  dataClass: 'dataClass',
                  isBookmarked: false,
                },
              ],
            },
          ],
        },
      ];

      const cohortQueryPayload: Required<DataSpecificationQueryPayload> = {
        ruleId: '1',
        representationId: '2',
        type: 'cohort',
        condition: { entity: 'coretable', rules: [], condition: 'and' },
      };

      const dataQueryPayload: Required<DataSpecificationQueryPayload> = {
        ruleId: '1',
        representationId: '3',
        type: 'data',
        condition: { entity: 'coretable', rules: [], condition: 'and' },
      };

      dataSpecificationStub.get.mockImplementationOnce(() => of(template));

      dataSchemaStub.loadDataSchemas.mockImplementationOnce((specification) => {
        expect(specification).toBe(template);
        expect(harness.component.state).toBe('loading');
        return of(dataSchemas);
      });

      dataSpecificationStub.getQuery.mockImplementationOnce(() => of(cohortQueryPayload));
      dataSpecificationStub.getQuery.mockImplementationOnce(() => of(dataQueryPayload));

      harness.component.ngOnInit();

      expect(harness.component.dataSchemas).toStrictEqual(dataSchemas);
      expect(harness.component.state).toBe('idle');
    });
  });

  describe('copy data specification', () => {
    const dataSpecification: DataSpecification = {
      id: '1',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'template 1',
      status: 'finalised',
    };

    const dataSpecificationFolder: FolderDetail = {
      id: '2',
      domainType: CatalogueItemDomainType.Folder,
      label: 'my data specifications',
      availableActions: [],
    };

    beforeEach(() => {
      dataSpecificationStub.getDataSpecificationFolder.mockImplementationOnce(() =>
        of(dataSpecificationFolder)
      );
      dataSpecificationStub.forkWithDialogs.mockClear();
    });

    it('should copy a template to a new data specification', () => {
      dataSpecificationStub.forkWithDialogs.mockImplementationOnce((req, options) => {
        expect(req).toBe(dataSpecification);
        expect(options?.targetFolder).toBe(dataSpecificationFolder);
        return of({
          ...dataSpecification,
          id: '3',
          label: 'copied data specification',
          status: 'unsent',
        });
      });

      harness.component.dataSpecification = dataSpecification;
      harness.component.copy();

      expect(dataSpecificationStub.forkWithDialogs).toHaveBeenCalled();
    });
  });
});
