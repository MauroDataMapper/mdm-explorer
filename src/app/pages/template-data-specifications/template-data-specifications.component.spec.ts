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
import {
  CatalogueItemDomainType,
  FolderDetail,
  MdmResourcesConfiguration,
} from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { DataSpecification } from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { createDataSpecificationServiceStub } from '../../testing/stubs/data-specifications.stub';
import { createToastrServiceStub } from '../../testing/stubs/toastr.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';

import { TemplateDataSpecificationsComponent } from './template-data-specifications.component';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';

describe('TemplateDataSpecificationsComponent', () => {
  let harness: ComponentHarness<TemplateDataSpecificationsComponent>;

  const dataSpecificationStub = createDataSpecificationServiceStub();
  const toastrStub = createToastrServiceStub();
  const securityStub = createSecurityServiceStub();
  const mdmResourcesConfiguration = new MdmResourcesConfiguration();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(TemplateDataSpecificationsComponent, {
      providers: [
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: MdmResourcesConfiguration,
          useValue: mdmResourcesConfiguration,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.templateDataSpecifications).toStrictEqual([]);
    expect(harness.component.state).toBe('idle');
  });

  describe('initialisation', () => {
    it('should list all templates', () => {
      const templates: DataSpecification[] = [
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

      dataSpecificationStub.listTemplates.mockImplementationOnce(() => of(templates));

      harness.component.ngOnInit();

      expect(harness.component.templateDataSpecifications).toStrictEqual(templates);
    });

    it('it should raise error if failed to get templates', () => {
      const toastrSpy = jest.spyOn(toastrStub, 'error');

      dataSpecificationStub.listTemplates.mockImplementationOnce(() =>
        throwError(() => new Error('list templates failed'))
      );

      harness.component.ngOnInit();

      expect(toastrSpy).toHaveBeenCalled();
    });
  });

  describe('copy data specification', () => {
    const dataSpecification: DataSpecification = {
      id: '1',
      domainType: CatalogueItemDomainType.DataModel,
      label: 'template 1',
      status: 'submitted',
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
      dataSpecificationStub.forkWithDialogs.mockImplementationOnce(
        (specification, options) => {
          expect(specification).toBe(dataSpecification);
          expect(options?.targetFolder).toBe(dataSpecificationFolder);
          return of({
            ...dataSpecification,
            id: '3',
            label: 'copied data specification',
            status: 'unsent',
          });
        }
      );

      harness.component.copy(dataSpecification);

      expect(dataSpecificationStub.forkWithDialogs).toHaveBeenCalled();
    });
  });
});
