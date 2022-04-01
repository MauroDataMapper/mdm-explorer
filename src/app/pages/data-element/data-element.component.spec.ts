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
import { MdmEndpointsService } from '../../mdm-rest-client/mdm-endpoints.service';
import { createMdmEndpointsStub } from 'src/app/testing/stubs/mdm-endpoints.stub';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { SummaryMetadataComponent } from 'src/app/shared/summary-metadata/summary-metadata/summary-metadata.component';

describe('DataElementComponent', () => {
  let harness: ComponentHarness<DataElementComponent>;
  const endpointsStub = createMdmEndpointsStub();

  const setupComponentTest = async () => {
    const activatedRoute: ActivatedRoute = {} as ActivatedRoute;

    return await setupTestModuleForComponent(DataElementComponent, {
      declarations: [
        MockComponent(MatTabGroup),
        MockComponent(MatTab),
        MockComponent(ClassifiersComponent),
        MockComponent(SummaryMetadataComponent),
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
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
