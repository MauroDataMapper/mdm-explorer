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
import { catchError, EMPTY } from 'rxjs';
import {
  CatalogueUser,
  CatalogueUserPayload,
  CatalogueUserService,
} from 'src/app/catalogue/catalogue-user.service';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit {
  user?: CatalogueUser;
  basicInfoMode: 'view' | 'edit' | 'updating' = 'view';

  constructor(
    private security: SecurityService,
    private catalogueUser: CatalogueUserService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService,
    private broadcast: BroadcastService
  ) {}

  ngOnInit(): void {
    const userDetails = this.security.getSignedInUser();
    if (!userDetails) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }

    this.catalogueUser
      .get(userDetails.id)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem finding your account details.');
          return EMPTY;
        })
      )
      .subscribe((user) => {
        this.user = user;
      });
  }

  editBasicInfo() {
    this.basicInfoMode = 'edit';
  }

  cancelEditBasicInfo() {
    this.basicInfoMode = 'view';
  }

  updateBasicInfo(payload: CatalogueUserPayload) {
    if (!this.user) {
      return;
    }

    this.basicInfoMode = 'updating';

    this.catalogueUser
      .update(this.user.id, payload)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem updating your account details.');
          this.basicInfoMode = 'edit';
          return EMPTY;
        })
      )
      .subscribe((user) => {
        this.user = user;
        this.basicInfoMode = 'view';
        this.toastr.success('Your account was updated.');
      });
  }

  signOut() {
    this.broadcast.dispatch('sign-out-user');
  }
}
