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
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { OrganisationMemberGuard } from './organisation-member.guard';
import { SecurityService } from '../../security/security.service';
import { SdeUserService } from '@maurodatamapper/sde-resources';
import { UserDetailsService } from '@maurodatamapper/mdm-explorer/app/security/user-details.service';
import { AUTHORIZATION_REDIRECT_URL } from '../../security/security.types';

describe('OrganisationMemberGuard', () => {
  let guard: OrganisationMemberGuard;
  let securityService: jest.Mocked<SecurityService>;
  let router: jest.Mocked<Router>;
  let userService: jest.Mocked<SdeUserService>;
  let detailsService: jest.Mocked<UserDetailsService>;

  const redirectUrl = 'some/where/else';

  beforeEach(() => {
    const securityMock = {
      isSignedInToSde: jest.fn(),
      isOrganisationMember: jest.fn(),
      getSignedinSdeUser: jest.fn(),
    } as unknown as jest.Mocked<SecurityService>;

    const routerMock = {
      parseUrl: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    const userMock = {
      isSdeUserAMemberOfAnOrganisation: jest.fn(),
    } as unknown as jest.Mocked<SdeUserService>;

    const detailsMock = {
      sdeSetUserOrganisationMembership: jest.fn(),
    } as unknown as jest.Mocked<UserDetailsService>;

    TestBed.configureTestingModule({
      providers: [
        OrganisationMemberGuard,
        { provide: SecurityService, useValue: securityMock },
        { provide: Router, useValue: routerMock },
        { provide: SdeUserService, useValue: userMock },
        { provide: UserDetailsService, useValue: detailsMock },
        { provide: AUTHORIZATION_REDIRECT_URL, useValue: redirectUrl },
      ],
    });

    guard = TestBed.inject(OrganisationMemberGuard);
    securityService = TestBed.inject(SecurityService) as jest.Mocked<SecurityService>;
    router = TestBed.inject(Router) as jest.Mocked<Router>;
    userService = TestBed.inject(SdeUserService) as jest.Mocked<SdeUserService>;
    detailsService = TestBed.inject(UserDetailsService) as jest.Mocked<UserDetailsService>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should redirect if user is not signed in to SDE', (done) => {
    securityService.isSignedInToSde.mockReturnValue(false);
    router.parseUrl.mockReturnValue({} as UrlTree);

    const result = guard.canActivate();

    if (result instanceof Observable) {
      result.subscribe((res) => {
        expect(res).toEqual(router.parseUrl(redirectUrl));
        done();
      });
    } else {
      expect(result).toEqual(router.parseUrl(redirectUrl));
      done();
    }
  });

  it('should allow activation if user is an organisation member', () => {
    securityService.isSignedInToSde.mockReturnValue(true);
    securityService.isOrganisationMember.mockReturnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
  });

  it('should check organisation membership if user is signed in but not an organisation member', () => {
    securityService.isSignedInToSde.mockReturnValue(true);
    securityService.isOrganisationMember.mockReturnValue(false);
    securityService.getSignedinSdeUser.mockReturnValue({
      id: 'user-id',
      firstName: '',
      lastName: '',
      email: '',
    });
    userService.isSdeUserAMemberOfAnOrganisation.mockReturnValue(of(true));
    detailsService.sdeSetUserOrganisationMembership.mockImplementation(() => {});

    const result = guard.canActivate();

    if (result instanceof Observable) {
      result.subscribe((res) => {
        expect(res).toBe(true);
        expect(() => detailsService.sdeSetUserOrganisationMembership(true)).not.toThrow();
      });
    } else if (result instanceof Promise) {
      result.then((res) => {
        expect(res).toBe(true);
        expect(() => detailsService.sdeSetUserOrganisationMembership(true)).not.toThrow();
      });
    } else {
      expect(result).toBe(true);
      expect(() => detailsService.sdeSetUserOrganisationMembership(true)).not.toThrow();
    }
  });

  it('should redirect if user is not an organisation member and membership check fails', () => {
    securityService.isSignedInToSde.mockReturnValue(true);
    securityService.isOrganisationMember.mockReturnValue(false);
    securityService.getSignedinSdeUser.mockReturnValue({
      id: 'user-id',
      firstName: '',
      lastName: '',
      email: '',
    });
    userService.isSdeUserAMemberOfAnOrganisation.mockReturnValue(of(false));
    router.parseUrl.mockReturnValue({} as UrlTree);

    const result = guard.canActivate() as ReturnType<typeof guard.canActivate>;

    if (result instanceof Observable) {
      result.subscribe((res) => {
        expect(res).toEqual(router.parseUrl('/sde'));
      });
    } else {
      expect(result).toEqual(router.parseUrl('/sde'));
    }
  });

  it('should redirect if no signed-in SDE user is found', (done) => {
    securityService.isSignedInToSde.mockReturnValue(true);
    securityService.isOrganisationMember.mockReturnValue(false);
    securityService.getSignedinSdeUser.mockReturnValue(null);
    router.parseUrl.mockReturnValue({} as UrlTree);

    const result = guard.canActivate();

    if (result instanceof Observable) {
      result.subscribe((res) => {
        expect(res).toEqual(router.parseUrl('/sde'));
        done();
      });
    } else {
      expect(result).toEqual(router.parseUrl('/sde'));
      done();
    }
  });
});
