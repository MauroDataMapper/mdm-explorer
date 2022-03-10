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
import { TestBed } from '@angular/core/testing';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { HeaderComponent } from './header.component';
import { arrowDirection, ArrowPipe } from '../pipes/arrow.pipe';

describe('HeaderComponent', () => {
  let harness: ComponentHarness<HeaderComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [ArrowPipe],
      declarations: [ArrowPipe],
    });
    harness = await setupTestModuleForComponent(HeaderComponent);
    TestBed.inject(ArrowPipe);
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.links).toEqual([]);
    expect(harness.component.includeSignIn).toBeFalsy();
    expect(harness.component.isSignedIn).toBeFalsy();
  });

  it('should include sign-in when link provided', () => {
    harness.component.signInLink = {
      routeName: 'test',
      label: 'Sign in',
    };

    expect(harness.component.includeSignIn).toBeTruthy();
  });

  it('should be signed in when user provided', () => {
    harness.component.signedInUser = {
      id: '1',
      userName: 'test',
      firstName: 'Test',
      lastName: 'Person',
      email: 'test@test.com',
    };

    expect(harness.component.isSignedIn).toBeTruthy();
  });

  it('should display Sign In link when not signed in', () => {
    const dom = harness.fixture.nativeElement;
    harness.component.signInLink = {
      routeName: 'test',
      label: 'Sign in',
    };
    harness.detectChanges();
    const signInElement = dom.querySelector('#signIn');
    const signOutElement = dom.querySelector('.mdm-header__overlayUserInitials');
    const bookmarks = dom.querySelector('#app.container.my-bookmarks');
    const requests = dom.querySelector('#app.container.my-requests');
    expect(signInElement).toBeTruthy();
    expect(signOutElement).toBeFalsy();
    expect(bookmarks).toBeFalsy();
    expect(requests).toBeFalsy();
  });

  it('should display Sign Out link, bookmarks and requests when signed in', () => {
    const dom = harness.fixture.nativeElement;
    harness.component.signInLink = {
      routeName: 'test',
      label: 'Sign in',
    };
    harness.component.signedInUser = {
      id: '1',
      userName: 'test',
      firstName: 'Test',
      lastName: 'Person',
      email: 'test@test.com',
    };
    harness.component.rightLinks = [
      {
        label: 'Bookmarks',
        routeName: 'app.container.my-bookmarks',
        imageSrc: '',
      },
    ];
    harness.component.accountLink = {
      label: 'My requests',
      routeName: 'app.container.my-requests',
      arrow: 'angle-down',
    };
    harness.detectChanges();
    // check that the elements have the correct existence
    const signInElement = dom.querySelector('#signIn');
    const signOutElement = dom.querySelector('.mdm-header__overlayUserInitials');
    const bookmarks = dom.querySelector('#app\\.container\\.my-bookmarks');
    const requests = dom.querySelector('#app\\.container\\.my-requests');
    expect(signInElement).toBeFalsy();
    expect(signOutElement).toBeTruthy();
    expect(bookmarks).toBeTruthy();
    expect(requests).toBeTruthy();
    // check that the user initials are correct
    expect(signOutElement.innerHTML).toBe(' TP ');
  });
});
