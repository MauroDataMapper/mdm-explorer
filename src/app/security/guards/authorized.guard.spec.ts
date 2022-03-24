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
import { Router, UrlTree } from '@angular/router';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { SecurityService } from '../security.service';
import { AUTHORIZATION_REDIRECT_URL } from '../security.types';

import { AuthorizedGuard } from './authorized.guard';

describe('AuthorizedGuard', () => {
  let guard: AuthorizedGuard;

  const redirectUrl = 'some/where/else';
  const securityStub = createSecurityServiceStub();

  const routerStub = {
    parseUrl: jest.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: Router,
          useValue: routerStub,
        },
        {
          provide: AUTHORIZATION_REDIRECT_URL,
          useValue: redirectUrl,
        },
      ],
    });
    guard = TestBed.inject(AuthorizedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow activation when user is signed in', () => {
    securityStub.isSignedIn.mockImplementationOnce(() => true);
    const actual = guard.canActivate();
    expect(actual).toBe(true);
  });

  it('should redirect when user is not signed in', () => {
    const expectedUrlTree: UrlTree = {
      fragment: redirectUrl,
    } as UrlTree;

    securityStub.isSignedIn.mockImplementationOnce(() => false);
    routerStub.parseUrl.mockImplementationOnce(() => expectedUrlTree);

    const actual = guard.canActivate();
    expect(actual).toBe(expectedUrlTree);
  });
});
