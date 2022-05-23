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
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  CatalogueUserService,
  ChangePasswordPayload,
} from 'src/app/mauro/catalogue-user.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';

@Component({
  selector: 'mdm-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  userDetails?: UserDetails | null;
  isUpdating = false;

  constructor(
    private security: SecurityService,
    private catalogueUser: CatalogueUserService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userDetails = this.security.getSignedInUser();
    if (!this.userDetails) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }
  }

  cancel() {
    this.stateRouter.navigateToKnownPath('/account');
  }

  changePassword(payload: ChangePasswordPayload) {
    if (!this.userDetails) {
      return;
    }

    this.isUpdating = true;

    this.catalogueUser
      .changePassword(this.userDetails.id, payload)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem changing your password.');
          return EMPTY;
        }),
        finalize(() => (this.isUpdating = false))
      )
      .subscribe(() => {
        this.toastr.success(
          'Your password was changed successfully, and will take affect the next time you sign in.',
          'Password changed'
        );
        this.stateRouter.navigateToKnownPath('/account');
      });
  }
}
