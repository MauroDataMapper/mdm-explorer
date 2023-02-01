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
import { MockComponent, MockDirective } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { ActivatedRoute } from '@angular/router';
import { ClassifiersComponent } from 'src/app/shared/classifiers/classifiers.component';
import { DataElementComponent } from './data-element.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { SummaryMetadataComponent } from 'src/app/shared/summary-metadata/summary-metadata/summary-metadata.component';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { ToastrService } from 'ngx-toastr';
import { createBookmarkServiceStub } from 'src/app/testing/stubs/bookmark.stub';
import { ProfileService } from 'src/app/mauro/profile.service';
import { BreadcrumbComponent } from 'src/app/data-explorer/breadcrumb/breadcrumb.component';
import { BookmarkToggleComponent } from 'src/app/shared/bookmark-toggle/bookmark-toggle.component';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import {
  DataElementSearchResult,
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from 'src/app/data-explorer/data-explorer.types';
import { of } from 'rxjs';
import {
  Breadcrumb,
  CatalogueItemDomainType,
  DataElementDetail,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { createProfileServiceStub } from 'src/app/testing/stubs/profile.stub';
import { DataElementProfileComponent } from './data-element-profile/data-element-profile.component';
import { MatIcon } from '@angular/material/icon';
import { MatCard } from '@angular/material/card';
import { MatTooltip } from '@angular/material/tooltip';
import { createTerminologyServiceStub } from 'src/app/testing/stubs/terminology.stub';
import { TerminologyService } from 'src/app/mauro/terminology.service';
import { DataElementInRequestComponent } from 'src/app/shared/data-element-in-request/data-element-in-request.component';

describe('DataElementComponent', () => {
  let harness: ComponentHarness<DataElementComponent>;
  const dataModelStub = createDataModelServiceStub();
  const bookmarkStub = createBookmarkServiceStub();
  const toastrStub = createToastrServiceStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const profileStub = createProfileServiceStub();
  const terminologiesStub = createTerminologyServiceStub();
  const config: DataExplorerConfiguration = {
    rootDataModelPath: 'my test model',
    profileServiceName: 'Profile Service',
    profileNamespace: 'Profile Namespace',
  };

  const setupComponentTest = async () => {
    const activatedRoute: ActivatedRoute = {
      params: of({
        dataModelId: 'RouteDataModelId',
        dataClassId: 'RouteDataClassId',
        dataElementId: 'RouteDataElementId',
      }),
    } as unknown as ActivatedRoute;

    return await setupTestModuleForComponent(DataElementComponent, {
      declarations: [
        MockComponent(MatTabGroup),
        MockComponent(MatTab),
        MockComponent(MatIcon),
        MockComponent(MatCard),
        MockDirective(MatTooltip),
        BreadcrumbComponent,
        MockComponent(ClassifiersComponent),
        MockComponent(SummaryMetadataComponent),
        DataElementProfileComponent,
        BookmarkToggleComponent,
        MockComponent(DataElementInRequestComponent),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: DataModelService,
          useValue: dataModelStub,
        },
        {
          provide: BookmarkService,
          useValue: bookmarkStub,
        },
        {
          provide: ProfileService,
          useValue: profileStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
        {
          provide: TerminologyService,
          useValue: terminologiesStub,
        },
        {
          provide: DATA_EXPLORER_CONFIGURATION,
          useValue: config,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestsStub,
        },
      ],
    });
  };

  const setupDataModelService = () => {
    const dataElement: DataElementDetail = {
      domainType: CatalogueItemDomainType.DataElement,
      label: 'DataElementLabel',
      description: 'Data Element Description',
      id: 'DataElementId',
      model: 'DataModel',
      dataClass: 'DataClassId',
      breadcrumbs: [
        {
          id: 'Breadcrumb1',
          domainType: CatalogueItemDomainType.DataModel,
          label: 'Breadcrumb1Label',
        },
        {
          id: 'Breadcrumb2',
          domainType: CatalogueItemDomainType.DataClass,
          label: 'Breadcrumb2Label',
        },
        {
          id: 'Breadcrumb3',
          domainType: CatalogueItemDomainType.DataElement,
          label: 'Breadcrumb3Label',
        },
      ],
      availableActions: [],
    };
    dataModelStub.getDataElement.mockReturnValue(of(dataElement));
  };

  const setupProfileService = () => {
    const profile: Profile = {
      id: 'ProfileId',
      domainType: CatalogueItemDomainType.DataElement,
      label: 'ProfileLabel',
      sections: [
        {
          name: 'Identifiable Information',
          fields: [
            {
              fieldName: 'Identifiable Data',
              currentValue: 'Identifiable Data Value',
              dataType: 'string',
              metadataPropertyName: 'Metadata Property Name',
            },
          ],
        },
      ],
    };
    profileStub.get.mockReturnValue(of(profile));
  };

  const setupDataRequestsService = () => {
    dataRequestsStub.getRequestsIntersections.mockReturnValue(
      of({ dataAccessRequests: [], sourceTargetIntersections: [] })
    );
  };

  beforeEach(async () => {
    harness = await setupComponentTest();
    setupDataModelService();
    setupProfileService();
    setupDataRequestsService();
    bookmarkStub.isBookmarked.mockReturnValue(of(false));
  });

  it('should initialise', () => {
    const component = harness.component;
    component.ngOnInit();
    expect(component.isBookmarked).toBe(false);
    expect(component.dataClassId).toBe('RouteDataClassId');
    expect(component.dataElementId).toBe('RouteDataElementId');
    expect(component.dataElement?.id).toBe('DataElementId');
    expect(component.identifiableData).toBe('Identifiable Data Value');
    expect(component.researchProfile?.id).toBe('ProfileId');
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should display profile', () => {
    // find the profile html
    const dom = harness.fixture.nativeElement;
    const profile: Profile = {
      id: 'ProfileId',
      domainType: CatalogueItemDomainType.DataElement,
      label: 'ProfileLabel',
      sections: [
        {
          name: 'Identifiable Information',
          fields: [
            {
              fieldName: 'Identifiable Data',
              currentValue: 'Identifiable Data Value',
              dataType: 'string',
              metadataPropertyName: 'Metadata Property Name',
            },
          ],
        },
      ],
    };
    harness.component.researchProfile = profile;
    harness.detectChanges();
    const headingContainers = Array.from(
      dom.querySelectorAll('h2') as NodeList
    ) as HTMLElement[];
    const profileContainer = headingContainers.find((heading) =>
      heading.innerHTML.includes('Profile')
    );
    expect(profileContainer).toBeTruthy();
    // any further details of the profile display should be tested within the data-element-profile.component tests
  });

  it('should display breadcrumbs', () => {
    const component = harness.component;
    const dom = harness.fixture.nativeElement;
    harness.detectChanges();
    const breadcrumbContainer = dom.querySelector('h1') as HTMLElement;
    const breadcrumbs: Breadcrumb[] | undefined = component.dataElement?.breadcrumbs;
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const breadcrumbMatcher = new RegExp(
      `.*${breadcrumbs![1].label}.*\\&gt;.*${breadcrumbs![2].label}.*\\&gt;.*${
        component.dataElement?.label
      }.*`,
      's'
    );
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    expect(breadcrumbContainer.innerHTML).toMatch(breadcrumbMatcher);
  });

  describe('toggleBookmark', () => {
    const dataElement = { id: '1', label: 'label-1' } as DataElementDetail;
    const dataElementAsBookmarkAdded = {
      ...dataElement,
      isBookmarked: true,
      isSelected: false,
    } as DataElementSearchResult;

    const dataElementAsBookmarkRemoved = {
      ...dataElement,
      isBookmarked: false,
      isSelected: false,
    } as DataElementSearchResult;

    it('should not call the bookmark service if there is no dataElement', () => {
      harness.component.dataElement = undefined;

      harness.component.toggleBookmark(true);
      harness.component.toggleBookmark(false);

      expect(bookmarkStub.add).not.toHaveBeenCalled();
      expect(bookmarkStub.remove).not.toHaveBeenCalled();
    });

    it('should request that dataElement be added if selected is true and fire toastr success', () => {
      const selected = true;
      harness.component.dataElement = dataElement;

      bookmarkStub.add.mockImplementationOnce(() => {
        return of([]);
      });

      harness.component.toggleBookmark(selected);
      expect(bookmarkStub.add).toHaveBeenCalledWith(dataElementAsBookmarkAdded);
      expect(toastrStub.success).toHaveBeenCalled();
    });

    it('should request that dataElement be removed if selected is false and fire toastr success', () => {
      const selected = false;
      harness.component.dataElement = dataElement;

      bookmarkStub.remove.mockImplementationOnce(() => {
        return of([]);
      });

      harness.component.toggleBookmark(selected);
      expect(bookmarkStub.remove).toHaveBeenCalledWith([dataElementAsBookmarkRemoved]);
      expect(toastrStub.success).toHaveBeenCalled();
    });
  });

  it('should initialise', () => {
    const component = harness.component;
    bookmarkStub.isBookmarked.mockImplementationOnce(() => of(false));
    harness.detectChanges();
    expect(component.isBookmarked).toBe(false);
    expect(component.dataClassId).toBe('RouteDataClassId');
    expect(component.dataElementId).toBe('RouteDataElementId');
    expect(component.dataElement?.id).toBe('DataElementId');
    expect(component.identifiableData).toBe('Identifiable Data Value');
    expect(component.researchProfile?.id).toBe('ProfileId');
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
