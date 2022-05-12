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
import { catchError, EMPTY, switchMap } from 'rxjs';
import {
  CatalogueUser,
  CatalogueUserPayload,
  CatalogueUserContactPayload,
  CatalogueUserService,
} from 'src/app/mauro/catalogue-user.service';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'mdm-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit {
  user?: CatalogueUser;
  basicInfoMode: 'view' | 'edit' | 'updating' = 'view';
  contactInfoMode: 'view' | 'edit' | 'updating' = 'view';

  constructor(
    private security: SecurityService,
    private catalogueUser: CatalogueUserService,
    private dataRequests: DataRequestsService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    public dialog: MatDialog
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

  editContactInfo() {
    this.contactInfoMode = 'edit';
  }

  cancelEditContactInfo() {
    this.contactInfoMode = 'view';
  }

  updateContactInfo(payload: CatalogueUserContactPayload) {
    if (!this.user) {
      return;
    }

    const oldEmail = this.user.emailAddress;
    this.contactInfoMode = 'updating';

    const dialog = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Logout warning!',
        okBtnTitle: 'Yes, confirm logout. ',
        btnType: 'primary',
        message: 'Changing your email will log you out!',
      },
    });

    dialog.afterClosed().subscribe((result: { status: string }) => {
      if (result?.status !== 'ok') {
        this.cancelEditContactInfo();

        return;
      }

      if (!this.user) {
        return;
      }

      this.catalogueUser
        .updateContactInfo(this.user.id, payload)
        .pipe(
          catchError(() => {
            this.toastr.error('There was a problem updating your account details.');
            this.contactInfoMode = 'edit';
            console.log('Errored out on user request');
            return EMPTY;
          }),
          switchMap((user) => {
            this.user = user;
            return this.dataRequests.getRequestsFolder(oldEmail);
          }),
          switchMap((folder) => {
            return this.dataRequests.updateRequestsFolder(
              folder.id!, // eslint-disable-line @typescript-eslint/no-non-null-assertion
              this.user!.emailAddress // eslint-disable-line @typescript-eslint/no-non-null-assertion
            );
          })
        )
        .subscribe(() => {
          this.contactInfoMode = 'view';
          this.toastr.success('Your account was updated.');
          this.signOut();
        });
    });
  }

  signOut() {
    this.broadcast.dispatch('sign-out-user');
  }
}
