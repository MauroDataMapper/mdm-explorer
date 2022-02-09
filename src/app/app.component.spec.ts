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
import { AppComponent } from './app.component';
import { StateRouterService } from './core/state-router.service';
import { MdmEndpointsService } from './mdm-rest-client/mdm-endpoints.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { createMdmEndpointsStub, MdmEndpointsServiceStub } from './testing/stubs/mdm-endpoints.stub';
import { ComponentHarness, setupTestModuleForComponent } from './testing/testing.helpers';

describe('AppComponent', () => {
  let harness: ComponentHarness<AppComponent>;
  const endpointsStub: MdmEndpointsServiceStub = createMdmEndpointsStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(
      AppComponent,
      {
        declarations: [
          HeaderComponent,
          FooterComponent
        ],
        providers: [
          {
            provide: MdmEndpointsService,
            useValue: endpointsStub
          },
          {
            provide: StateRouterService,
            useValue: jest.fn()
          }
        ]
      }
    );
  });

  it('should create the app', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  it('should have expected title', () => {
    expect(harness.component.title).toEqual('mdm-research-browser');
  });
});
