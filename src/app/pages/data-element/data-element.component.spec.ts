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
import { MockComponent } from 'ng-mocks';
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
import { DataModelService } from 'src/app/mauro/data-model.service';
import { BookmarkService, Bookmark } from 'src/app/data-explorer/bookmark.service';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import {
  DataExplorerConfiguration,
  DATA_EXPLORER_CONFIGURATION,
} from 'src/app/data-explorer/data-explorer.types';
import { EMPTY, of } from 'rxjs';
import {
  Breadcrumb,
  CatalogueItemDomainType,
  DataElementDetail,
  Profile,
} from '@maurodatamapper/mdm-resources';
import { createProfileServiceStub } from 'src/app/testing/stubs/profile.stub';
import { DataElementProfileComponent } from './data-element-profile/data-element-profile.component';

describe('DataElementComponent', () => {
  let harness: ComponentHarness<DataElementComponent>;
  const dataModelStub = createDataModelServiceStub();
  const bookmarkStub = createBookmarkServiceStub();
  const toastrStub = createToastrServiceStub();
  const dataRequestsStub = createDataRequestsServiceStub();
  const profileStub = createProfileServiceStub();
  const config: DataExplorerConfiguration = {
    rootDataModelPath: 'my test model',
    profileServiceName: 'Profile Service',
    profileNamespace: 'Profile Namespace',
  };
  const bookmarks: Bookmark[] = [
    {
      id: 'BookmarkId1',
      dataModelId: 'DataModelId1',
      dataClassId: 'DataClassId1',
      label: 'BookmarkLabel1',
    },
    {
      id: 'BookmarkId2',
      dataModelId: 'DataModelId2',
      dataClassId: 'DataClassId2',
      label: 'BookmarkLabel2',
    },
  ];

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
        BreadcrumbComponent,
        MockComponent(ClassifiersComponent),
        MockComponent(SummaryMetadataComponent),
        DataElementProfileComponent,
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

  const setupBookmarks = () => {
    bookmarkStub.index.mockReturnValue(of(bookmarks));
    bookmarkStub.add.mockImplementation((bookmark) => {
      bookmarks.push(bookmark);
      return of(bookmark);
    });
    bookmarkStub.remove.mockImplementation((bookmark) => {
      const idx = bookmarks.findIndex((element) => element.id === bookmark.id);
      if (idx > -1) {
        bookmarks.splice(idx, 1);
        return of(bookmark);
      } else {
        return EMPTY;
      }
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

  beforeEach(async () => {
    harness = await setupComponentTest();
    setupBookmarks();
    setupDataModelService();
    setupProfileService();
  });

  it('should display profile', () => {
    // find the profile html
    const dom = harness.fixture.nativeElement;
    harness.component.researchProfile = undefined;
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

  it('should display data element description', () => {
    const component = harness.component;
    const dom = harness.fixture.nativeElement;
    harness.detectChanges();
    const descriptionContainer = (dom.querySelectorAll('h2') as HTMLElement[])[0]
      .nextSibling?.nextSibling as HTMLElement;
    const descriptionHtml = descriptionContainer.innerHTML;
    const descriptionMatcher = new RegExp(
      `.*Description.*${component.dataElement?.description}.*`
    );
    expect(descriptionHtml).toMatch(descriptionMatcher);
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

  it('should display data element label', () => {
    const component = harness.component;
    const dom = harness.fixture.nativeElement;
    harness.detectChanges();
    const labelContainer = (dom.querySelectorAll('h2') as HTMLElement[])[0]
      .nextSibling as HTMLElement;
    const labelHtml = labelContainer.innerHTML;
    const labelMatcher = new RegExp(`.*Label.*${component.dataElement?.label}.*`);
    expect(labelHtml).toMatch(labelMatcher);
  });

  it('should add and remove bookmark', () => {
    const component = harness.component;
    harness.detectChanges();
    toastrStub.success.mockClear();

    component.toggleBookmark(true);
    expect(component.bookmarks.length).toBe(3);
    component.toggleBookmark(false);
    expect(component.bookmarks.length).toBe(2);
    component.toggleBookmark(false);
    expect(component.bookmarks.length).toBe(2);

    expect(toastrStub.success.mock.calls[0][0]).toBe(
      `${component.dataElement?.label} added to bookmarks`
    );
    expect(toastrStub.success.mock.calls[1][0]).toBe(
      `${component.dataElement?.label} removed from bookmarks`
    );
    expect(toastrStub.success.mock.calls.length).toBe(2);
  });

  it('should initialise', () => {
    const component = harness.component;
    harness.detectChanges();
    expect(component.bookmarks.length).toBe(2);
    expect(component.bookmarks[0].id).toBe('BookmarkId1');
    expect(component.bookmarks[1].id).toBe('BookmarkId2');
    expect(component.dataClassId).toBe('RouteDataClassId');
    expect(component.dataElementId).toBe('RouteDataElementId');
    expect(component.dataElement?.id).toBe('DataElementId');
    expect(component.identifiableData).toBe('Identifiable Data Value');
    expect(component.isBookmarked()).toBeFalsy();
    expect(component.researchProfile?.id).toBe('ProfileId');
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
