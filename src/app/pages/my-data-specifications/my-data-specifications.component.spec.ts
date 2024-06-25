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
import { MatDialog } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { BroadcastService } from '../../core/broadcast.service';
import { DataExplorerService } from '../../data-explorer/data-explorer.service';
import {
  DataSpecification,
  DataSpecificationStatus,
} from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { DataModelService } from '../../mauro/data-model.service';
import { SecurityService } from '../../security/security.service';
import { UserDetails } from '../../security/user-details.service';
import { createBroadcastServiceStub } from '../../testing/stubs/broadcast.stub';
import { createDataExplorerServiceStub } from '../../testing/stubs/data-explorer.stub';
import { createDataModelServiceStub } from '../../testing/stubs/data-model.stub';
import { createDataSpecificationServiceStub } from '../../testing/stubs/data-specifications.stub';
import { createMatDialogStub } from '../../testing/stubs/mat-dialog.stub';
import { createSecurityServiceStub } from '../../testing/stubs/security.stub';
import { createToastrServiceStub } from '../../testing/stubs/toastr.stub';
import { ComponentHarness, setupTestModuleForComponent } from '../../testing/testing.helpers';
import { MyDataSpecificationsComponent } from './my-data-specifications.component';
import { createDataSpecificationResearchPluginServiceStub } from 'src/app/testing/stubs/data-specification-research-plugin.stub';
import { DataSpecificationResearchPluginService } from 'src/app/mauro/data-specification-research-plugin.service';

describe('MyDataSpecificationsComponent', () => {
  let harness: ComponentHarness<MyDataSpecificationsComponent>;
  const securityStub = createSecurityServiceStub();
  const dataSpecificationStub = createDataSpecificationServiceStub();
  const dataModelsStub = createDataModelServiceStub();
  const toastrStub = createToastrServiceStub();
  const dataSpecificationResearchPluginStub = createDataSpecificationResearchPluginServiceStub();
  const dialogsStub = createMatDialogStub();
  const broadcastStub = createBroadcastServiceStub();
  const explorerStub = createDataExplorerServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyDataSpecificationsComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
        },
        {
          provide: DataModelService,
          useValue: dataModelsStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: DataSpecificationResearchPluginService,
          useValue: dataSpecificationResearchPluginStub,
        },
        {
          provide: MatDialog,
          useValue: dialogsStub,
        },
        {
          provide: BroadcastService,
          useValue: broadcastStub,
        },
        {
          provide: DataExplorerService,
          useValue: explorerStub,
        },
      ],
    });
  });

  const user = { email: 'test@test.com' } as UserDetails;

  const mockSignedInUser = () => {
    securityStub.getSignedInUser.mockReturnValueOnce(user);
  };

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.allDataSpecifications).toStrictEqual([]);
    expect(harness.component.filteredDataSpecifications).toStrictEqual([]);
    expect(harness.component.statusFilters).toStrictEqual([]);
  });

  describe('initialisation', () => {
    beforeEach(() => {
      dataSpecificationResearchPluginStub.getLatestModelDataSpecifications.mockClear();
      toastrStub.error.mockClear();
    });

    it('should do nothing if there is no user', () => {
      harness.component.ngOnInit();
      expect(
        dataSpecificationResearchPluginStub.getLatestModelDataSpecifications
      ).not.toHaveBeenCalled();
    });
  });

  it('should display all data specifications available to a user', () => {
    const dataSpecifications: DataSpecification[] = [
      {
        id: '1',
        label: 'data specification 1',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'draft',
      },
      {
        id: '2',
        label: 'data specification 2',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'draft',
      },
    ];

    mockSignedInUser();

    dataSpecificationResearchPluginStub.getLatestModelDataSpecifications.mockImplementationOnce(
      () => {
        expect(harness.component.state).toBe('loading');
        return of(dataSpecifications);
      }
    );

    harness.component.ngOnInit();

    expect(harness.component.state).toBe('idle');
    expect(harness.component.allDataSpecifications).toStrictEqual(dataSpecifications);
    expect(harness.component.filteredDataSpecifications).toStrictEqual(dataSpecifications); // No filters yet
  });

  it('should display an error if failed to get data specifications', () => {
    mockSignedInUser();

    dataSpecificationResearchPluginStub.getLatestModelDataSpecifications.mockImplementationOnce(
      () => throwError(() => new Error())
    );

    harness.component.ngOnInit();

    expect(harness.component.state).toBe('idle');
    expect(toastrStub.error).toHaveBeenCalled();
    expect(harness.component.allDataSpecifications).toStrictEqual([]);
    expect(harness.component.filteredDataSpecifications).toStrictEqual([]);
  });

  it('should handle having no data specifications available', () => {
    mockSignedInUser();

    dataSpecificationResearchPluginStub.getLatestModelDataSpecifications.mockImplementationOnce(
      () => {
        expect(harness.component.state).toBe('loading');
        return of([]);
      }
    );

    harness.component.ngOnInit();

    expect(harness.component.state).toBe('idle');
    expect(harness.component.allDataSpecifications).toStrictEqual([]);
    expect(harness.component.filteredDataSpecifications).toStrictEqual([]); // No filters yet
  });

  describe('filter by status', () => {
    const dataSpecifications: DataSpecification[] = [
      {
        id: '1',
        label: 'data specification 1',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'draft',
      },
      {
        id: '2',
        label: 'data specification 2',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'draft',
      },
      {
        id: '3',
        label: 'data specification 3',
        domainType: CatalogueItemDomainType.DataModel,
        status: 'finalised',
      },
    ];

    beforeEach(() => {
      harness.component.allDataSpecifications = dataSpecifications;
    });

    it('should display all data specifications if no filters are set', () => {
      const event = { value: 'all' } as MatSelectChange;

      harness.component.filterByStatus(event);

      expect(harness.component.statusFilters).toStrictEqual(['finalised', 'submitted', 'draft']);
      expect(harness.component.filteredDataSpecifications).toStrictEqual(dataSpecifications);
    });

    it.each<DataSpecificationStatus>(['draft', 'finalised'])(
      'should display only data specifications of status %p',
      (status) => {
        const event = { value: status } as MatSelectChange;

        harness.component.filterByStatus(event);

        expect(harness.component.statusFilters).toStrictEqual([status]);
        expect(harness.component.filteredDataSpecifications).toStrictEqual(
          dataSpecifications.filter((r) => r.status === status)
        );
      }
    );
  });
});
