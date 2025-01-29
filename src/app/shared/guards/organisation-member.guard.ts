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
import { Inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { map, Observable } from 'rxjs';
import { AuthorizedGuard } from '../../security/guards/authorized.guard';
import { UserService } from '@maurodatamapper/sde-resources';
import { AUTHORIZATION_REDIRECT_URL } from '../../security/security.types';
import { SecurityService } from '../../security/security.service';
import { UserDetailsService } from 'src/app/security/user-details.service';

@Injectable({
  providedIn: 'root',
})
export class OrganisationMemberGuard extends AuthorizedGuard {
  constructor(
    protected override security: SecurityService,
    protected override router: Router,
    protected userService: UserService,
    protected detailsService: UserDetailsService,
    @Inject(AUTHORIZATION_REDIRECT_URL) protected override redirectUrl: string
  ) {
    super(security, router, redirectUrl);
  }
  override canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (!this.getSecurityService().isSignedIn) {
      return this.redirect(this.getAuthorizationRedirectUrl());
    }

    if (this.getSecurityService().isOrganisationMember()) {
      return true;
    } else {
      return this.userService.isCurrentUserAMemberOfAnOrganisation().pipe(
        map((bool: boolean) => {
          if (bool) {
            this.detailsService.sdeSetUserOrganisationMembership(bool);
            return true;
          }
          // redirect to requests page
          return this.redirect('/sde');
        })
      );
    }
  }
}
