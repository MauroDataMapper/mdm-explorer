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
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MockDirective } from 'ng-mocks';
import { AppComponent } from './app.component';
import { StateRouterService } from './core/state-router.service';
import { DataSpecificationService } from './data-explorer/data-specification.service';
import { MdmEndpointsService } from './mauro/mdm-endpoints.service';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';
import { createDataSpecificationServiceStub } from './testing/stubs/data-specifications.stub';
import {
  createMdmEndpointsStub,
  MdmEndpointsServiceStub,
} from './testing/stubs/mdm-endpoints.stub';
import { ComponentHarness, setupTestModuleForComponent } from './testing/testing.helpers';
import { createDataElementSearchServiceStub } from './testing/stubs/data-element-search.stub';
import { DataElementSearchService } from './data-explorer/data-element-search.service';
import { createThemeServiceStub } from './testing/stubs/theme.stub';
import { defaultTheme, ThemeService } from './shared/theme.service';
import { of } from 'rxjs';
import { createSecurityServiceStub } from './testing/stubs/security.stub';
import { SecurityService } from './security/security.service';
import { createSdeAuthenticationEndpointsStub } from './testing/stubs/sde/sde-authentication-endpoints.stub';
import { AuthenticationEndpointsShared } from '@maurodatamapper/sde-resources';

describe('AppComponent', () => {
  let harness: ComponentHarness<AppComponent>;
  const dataSpecificationStub = createDataSpecificationServiceStub();
  const endpointsStub: MdmEndpointsServiceStub = createMdmEndpointsStub();
  const dataElementSearchStub = createDataElementSearchServiceStub();
  const themesStub = createThemeServiceStub();
  const sdeSecurityStub = createSecurityServiceStub();
  const sdeAuthenticationEndpointsStub = createSdeAuthenticationEndpointsStub();

  themesStub.loadTheme.mockImplementation(() => of(defaultTheme));

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(AppComponent, {
      declarations: [HeaderComponent, FooterComponent, MockDirective(RouterOutlet)],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationStub,
        },
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: StateRouterService,
          useValue: jest.fn(),
        },
        {
          provide: DataElementSearchService,
          useValue: dataElementSearchStub,
        },
        {
          provide: ThemeService,
          useValue: themesStub,
        },
        {
          provide: SecurityService,
          useValue: sdeSecurityStub,
        },
        {
          provide: AuthenticationEndpointsShared,
          useValue: sdeAuthenticationEndpointsStub,
        },
      ],
    });
  });

  it('should create the app', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
  });

  it('should have expected title', () => {
    expect(harness.component.title).toEqual('mdm-explorer');
  });
});
