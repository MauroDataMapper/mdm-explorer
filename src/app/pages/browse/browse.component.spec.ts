/*
Copyright 2022 University of Oxford
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
import { HttpErrorResponse } from '@angular/common/http';
import { MatSelectionList, MatSelectionListChange } from '@angular/material/list';
import {
  CatalogueItemDomainType,
  DataClass,
  DataModelDetail,
} from '@maurodatamapper/mdm-resources';
import { MockComponent } from 'ng-mocks';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { CatalogueService } from 'src/app/catalogue/catalogue.service';
import { DataModelService } from 'src/app/catalogue/data-model.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { createCatalogueServiceStub } from 'src/app/testing/stubs/catalogue.stub';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { BrowseComponent } from './browse.component';

describe('BrowseComponent', () => {
  let harness: ComponentHarness<BrowseComponent>;
  const dataModelStub = createDataModelServiceStub();
  const catalogueStub = createCatalogueServiceStub();
  const stateRouterStub = createStateRouterStub();

  const toastrStub = {
    error: jest.fn(),
  };

  const rootDataModel: DataModelDetail = {
    id: '123',
    label: 'test model',
    domainType: CatalogueItemDomainType.DataModel,
    availableActions: ['show'],
    finalised: false,
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BrowseComponent, {
      declarations: [MockComponent(MatSelectionList)],
      providers: [
        {
          provide: DataModelService,
          useValue: dataModelStub,
        },
        {
          provide: CatalogueService,
          useValue: catalogueStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
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
  });

  describe('initialisation', () => {
    beforeEach(() => {
      toastrStub.error.mockClear();
    });

    it('should display an error when root data model is missing', () => {
      catalogueStub.getRootDataModel.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      harness.component.ngOnInit();

      expect(toastrStub.error).toHaveBeenCalled();
      expect(catalogueStub.getRootDataModel).toHaveBeenCalled();
      expect(dataModelStub.getDataClasses).not.toHaveBeenCalled();
    });

    it('should display an error when parent data classes is missing', () => {
      catalogueStub.getRootDataModel.mockImplementationOnce(() => of(rootDataModel));

      dataModelStub.getDataClasses.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      harness.component.ngOnInit();

      expect(toastrStub.error).toHaveBeenCalled();
      expect(catalogueStub.getRootDataModel).toHaveBeenCalled();
      expect(dataModelStub.getDataClasses).toHaveBeenCalled();
    });

    it('should display the initial parent data classes', () => {
      const dataClasses: DataClass[] = [
        {
          id: '1',
          label: 'class 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '2',
          label: 'class 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      catalogueStub.getRootDataModel.mockImplementationOnce(() => of(rootDataModel));
      dataModelStub.getDataClasses.mockImplementationOnce(() => of(dataClasses));

      harness.component.ngOnInit();

      expect(toastrStub.error).not.toHaveBeenCalled();
      expect(harness.component.parentDataClasses).toBe(dataClasses);
      expect(harness.component.selected).not.toBeDefined();
    });
  });

  describe('select parent data class', () => {
    const parentDataClass: DataClass = {
      id: '1',
      label: 'class 1',
      domainType: CatalogueItemDomainType.DataClass,
    };

    // Fake enough of a MatSelectedListChange object to make the test work
    const event = {
      options: [
        {
          value: parentDataClass,
        },
      ],
    } as MatSelectionListChange;

    beforeEach(() => {
      toastrStub.error.mockClear();
      harness.component.parentDataClasses = [parentDataClass];
    });

    it('should display an error when child data classes are missing', () => {
      dataModelStub.getDataClasses.mockImplementationOnce(() =>
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      harness.component.selectParentDataClass(event);

      expect(harness.component.selected).toBe(parentDataClass);
      expect(harness.component.childDataClasses).toEqual([]);
      expect(toastrStub.error).toHaveBeenCalled();
    });

    it('should display child data classes once a parent is selected', () => {
      const dataClasses: DataClass[] = [
        {
          id: '2',
          label: 'child 1',
          domainType: CatalogueItemDomainType.DataClass,
        },
        {
          id: '3',
          label: 'child 2',
          domainType: CatalogueItemDomainType.DataClass,
        },
      ];

      dataModelStub.getDataClasses.mockImplementationOnce(() => of(dataClasses));

      harness.component.selectParentDataClass(event);

      expect(harness.component.selected).toBe(parentDataClass);
      expect(harness.component.childDataClasses).toBe(dataClasses);
      expect(toastrStub.error).not.toHaveBeenCalled();
    });
  });

  describe('select child data class', () => {
    const parentDataClass: DataClass = {
      id: '1',
      label: 'class 1',
      domainType: CatalogueItemDomainType.DataClass,
    };

    const childDataClass: DataClass = {
      id: '2',
      label: 'class 2',
      domainType: CatalogueItemDomainType.DataClass,
    };

    // Fake enough of a MatSelectedListChange object to make the test work
    const event = {
      options: [
        {
          value: childDataClass,
        },
      ],
    } as MatSelectionListChange;

    beforeEach(() => {
      harness.component.parentDataClasses = [parentDataClass];
      harness.component.childDataClasses = [childDataClass];
    });

    it('should select the given child data class', () => {
      harness.component.selectChildDataClass(event);
      expect(harness.component.selected).toBe(childDataClass);
    });
  });

  describe('view details', () => {
    it('should do nothing if there is no child data class selected', () => {
      harness.component.viewDetails();
      expect(stateRouterStub.transitionTo).not.toHaveBeenCalled();
    });

    it('should do nothing if the selected child data class has no parent', () => {
      harness.component.selected = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
      };

      harness.component.viewDetails();
      expect(stateRouterStub.transitionTo).not.toHaveBeenCalled();
    });

    it('should transition to the search results page when a selection is made', () => {
      harness.component.selected = {
        id: '1',
        label: 'test',
        domainType: CatalogueItemDomainType.DataClass,
        parentDataClass: '2',
      };

      harness.component.viewDetails();
      expect(stateRouterStub.transitionTo).toHaveBeenCalledWith(
        'app.container.search-results',
        {
          dataClassId: harness.component.selected.id,
        }
      );
    });
  });
});
