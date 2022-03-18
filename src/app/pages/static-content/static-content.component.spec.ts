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
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, convertToParamMap, Data, Params } from '@angular/router';
import { of, throwError } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { StaticContentService } from 'src/app/core/static-content.service';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
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

  const stateRouterStub = createStateRouterStub();

  const staticContentStub: StaticContentServiceStub = {
    getContent: jest.fn(),
  };

  const implementGetContent = (path: string, content: SafeHtml) => {
    staticContentStub.getContent.mockImplementationOnce((p) => {
      expect(p).toBe(path);
      return of(content);
    });
  };

  const implementErrorOnContent = () => {
    staticContentStub.getContent.mockImplementationOnce(() =>
      throwError(() => new Error())
    );
  };

  const setupComponentTest = async (params?: Params, data?: Data) => {
    const route: ActivatedRoute = {
      paramMap: of(convertToParamMap(params ?? {})),
      data: of(data ?? {}),
    } as ActivatedRoute;

    harness = await setupTestModuleForComponent(StaticContentComponent, {
      providers: [
        {
          provide: ActivatedRoute,
          useValue: route,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: StaticContentService,
          useValue: staticContentStub,
        },
      ],
    });
  };

  describe('creation', () => {
    beforeEach(async () => {
      await setupComponentTest();
    });

    it('should create', () => {
      expect(harness.isComponentCreated).toBeTruthy();
      expect(harness.component.content).toBe('');
    });
  });

  const testPaths = ['test-page', 'sub/folder/path', 'help/faq'];

  describe.each(testPaths)('static content for dynamic Url segment %p', (path) => {
    const params: Params = {
      path,
    };

    const expectedContent: SafeHtml = 'content';

    beforeEach(async () => {
      await setupComponentTest(params);
    });

    it('should display static content', () => {
      implementGetContent(path, expectedContent);
      harness.component.ngOnInit();
      expect(harness.component.content).toBe(expectedContent);
    });

    it('should redirect to "Not Found" if content cannot load', () => {
      implementErrorOnContent();
      harness.component.ngOnInit();
      expect(stateRouterStub.navigateToNotFound).toHaveBeenCalled();
    });
  });

  describe.each(testPaths)('static content for route data path %p', (path) => {
    const data: Data = {
      staticAssetPath: path,
    };

    const expectedContent: SafeHtml = 'content';

    beforeEach(async () => {
      await setupComponentTest(undefined, data);
    });

    it('should display static content', () => {
      implementGetContent(path, expectedContent);
      harness.component.ngOnInit();
      expect(harness.component.content).toBe(expectedContent);
    });

    it('should redirect to "Not Found" if content cannot load', () => {
      implementErrorOnContent();
      harness.component.ngOnInit();
      expect(stateRouterStub.navigateToNotFound).toHaveBeenCalled();
    });
  });
});
