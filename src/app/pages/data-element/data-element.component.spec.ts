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
import { BreadcrumbComponent } from 'src/app/shared/breadcrumb/breadcrumb.component';
import { createDataModelServiceStub } from 'src/app/testing/stubs/data-model.stub';
import { DataModelService } from 'src/app/mauro/data-model.service';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { ToastrService } from 'ngx-toastr';
import { createBookmarkServiceStub } from 'src/app/testing/stubs/bookmark.stub';
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { ProfileService } from 'src/app/data-explorer/profile.service';

describe('DataElementComponent', () => {
  let harness: ComponentHarness<DataElementComponent>;
  const dataModelStub = createDataModelServiceStub();
  const bookmarkStub = createBookmarkServiceStub();
  const toastrStub = createToastrServiceStub();

  const setupComponentTest = async () => {
    const activatedRoute: ActivatedRoute = {} as ActivatedRoute;

    return await setupTestModuleForComponent(DataElementComponent, {
      declarations: [
        MockComponent(MatTabGroup),
        MockComponent(MatTab),
        MockComponent(BreadcrumbComponent),
        MockComponent(ClassifiersComponent),
        MockComponent(SummaryMetadataComponent),
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
          useValue: jest.fn(),
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
      ],
    });
  };

  beforeEach(async () => {
    harness = await setupComponentTest();
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
