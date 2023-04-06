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
import { of } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { StaticContentService } from 'src/app/core/static-content.service';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createStaticContentStub } from 'src/app/testing/stubs/static-content.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let harness: ComponentHarness<HomeComponent>;
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const staticContentStub = createStaticContentStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(HomeComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
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
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('initialisation', () => {
    it('should redirect to the dashboard page if a user is signed in', () => {
      securityStub.isSignedIn.mockImplementationOnce(() => {
        return true;
      });

      harness.component.ngOnInit();

      expect(stateRouterStub.navigateToKnownPath).toHaveBeenCalledWith('/dashboard');
    });

    it('should call the staticContentService to grab the static home page if user not signed in', () => {
      const expectedContent = '<div>Some safe html</div>';
      securityStub.isSignedIn.mockImplementationOnce(() => {
        return false;
      });

      staticContentStub.getContent.mockImplementationOnce(() => {
        return of(expectedContent);
      });

      harness.component.ngOnInit();

      expect(staticContentStub.getContent).toHaveBeenCalledWith('home');
      expect(harness.component.content).toEqual(expectedContent);
    });
  });
});
