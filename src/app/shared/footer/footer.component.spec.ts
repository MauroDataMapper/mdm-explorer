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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MockDirective } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  let harness: ComponentHarness<FooterComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(FooterComponent, {
      declarations: [MockDirective(RouterLink)],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {},
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness?.isComponentCreated).toBeTruthy();
    expect(harness.component.copyright).toBe(
      ' - Researcher interface. Powered by Mauro Data Mapper.',
    );
    expect(harness.component.year).toBe(new Date().getFullYear());
  });

  it('should display footer links', () => {
    harness.component.links = [
      {
        label: 'Privacy policy',
        routerLink: 'app.container.privacy',
        target: '_self',
      },
      {
        label: 'Terms and conditions',
        href: 'https://localhost/terms-and-conditions',
        target: '_self',
      },
      {
        label: 'Cookies',
        routerLink: 'app.container.cookies',
        target: '_self',
      },
    ];
    harness.detectChanges();
    const dom = harness.fixture.nativeElement;
    const privacyPolicy = dom.querySelector('#app\\.container\\.privacy');
    const termsAndConditions = dom.querySelector(
      'a[href="https://localhost/terms-and-conditions"]',
    );
    const cookies = dom.querySelector('#app\\.container\\.cookies');
    expect(privacyPolicy).toBeTruthy();
    expect(termsAndConditions).toBeTruthy();
    expect(cookies).toBeTruthy();
    expect(privacyPolicy.innerHTML).toBe('Privacy policy');
    expect(termsAndConditions.innerHTML).toBe('Terms and conditions');
    expect(cookies.innerHTML).toBe('Cookies');
  });
});
