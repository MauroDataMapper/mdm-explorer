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
import { UIRouterGlobals } from '@uirouter/angular';
import { of, throwError } from 'rxjs';
import { StaticContentService } from 'src/app/core/static-content.service';
import { createRouterGlobalsStub } from 'src/app/testing/stubs/state-router.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { StaticContentComponent } from './static-content.component';

interface StaticContentServiceStub {
  getContent: jest.Mock;
}

describe('ContentComponent', () => {
  let harness: ComponentHarness<StaticContentComponent>;

  const routerGlobalsStub = createRouterGlobalsStub();

  const staticContentStub: StaticContentServiceStub = {
    getContent: jest.fn(),
  };

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(StaticContentComponent, {
      providers: [
        {
          provide: UIRouterGlobals,
          useValue: routerGlobalsStub,
        },
        {
          provide: StaticContentService,
          useValue: staticContentStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  it('should do nothing when no path is provided', () => {
    expect(harness.component.content).toBe('');
  });

  it('should set the content when path is provided', () => {
    routerGlobalsStub.params.path = 'test/page';
    const expectedContent = '<p>Test content</p>';

    staticContentStub.getContent.mockImplementationOnce((path) => {
      if (!path) {
        return throwError(() => 'Error!');
      }
      return of(expectedContent);
    });

    harness.component.ngOnInit();

    expect(harness.component.content).toBe(expectedContent);
  });
});
