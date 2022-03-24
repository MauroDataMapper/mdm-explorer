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
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { BookmarkComponent } from './bookmark.component';
import { MdmEndpointsService } from '../../mdm-rest-client/mdm-endpoints.service';
import { createMdmEndpointsStub } from 'src/app/testing/stubs/mdm-endpoints.stub';

describe('BookmarkComponent', () => {
  let harness: ComponentHarness<BookmarkComponent>;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BookmarkComponent, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });
});
