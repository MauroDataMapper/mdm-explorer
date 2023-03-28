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
import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, filter, forkJoin, of, switchMap } from 'rxjs';
import {
  CatalogueUser,
  CatalogueUserPayload,
  CatalogueUserContactPayload,
  CatalogueUserService,
} from 'src/app/mauro/catalogue-user.service';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';
import { DataSpecificationService } from 'src/app/data-explorer/data-specification.service';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import { FolderService } from 'src/app/mauro/folder.service';

export type MyAccountViewStatus = 'view' | 'edit' | 'updating';
@Component({
  selector: 'mdm-my-account',
  templateUrl: './my-account.component.html',
  styleUrls: ['./my-account.component.scss'],
})
export class MyAccountComponent implements OnInit {
  user?: CatalogueUser;

  basicInfoMode: MyAccountViewStatus = 'view';
  contactInfoMode: MyAccountViewStatus = 'view';

  constructor(
    private security: SecurityService,
    private catalogueUser: CatalogueUserService,
    private dataSpecification: DataSpecificationService,
    private stateRouter: StateRouterService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    private folder: FolderService,
    public dialog: DialogService
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

    this.contactInfoMode = 'updating';

    const dialog = this.dialog.openConfirmation({
      title: 'Account changes',
      okBtnTitle: 'Yes, continue.',
      btnType: 'primary',
      message:
        '<p>Changing your email address will require us to sign you out of this website to make changes to your account. Once successful you can then sign in again with your new email address.</p>' +
        '<p>Are you sure you would like to continue?</p>',
    });

    dialog
      .afterClosed()
      .pipe(
        filter((result) => {
          if (result?.status !== 'ok') {
            this.contactInfoMode = 'view';
          }

          return result?.status === 'ok';
        }),
        switchMap(() => {
          if (!this.user) {
            return EMPTY;
          }
          return this.catalogueUser.update(this.user.id, payload);
        }),
        catchError(() => {
          this.toastr.error('There was a problem updating your account details.');
          this.contactInfoMode = 'edit';
          return EMPTY;
        }),
        switchMap((user) => {
          return forkJoin([
            of(user),
            this.dataSpecification.getDataSpecificationFolder(),
          ]);
        }),
        switchMap(([user, folder]) => {
          if (!folder.id) {
            return EMPTY;
          }
          return this.folder.update(folder.id, {
            id: folder.id,
            label: this.dataSpecification.getDataSpecificationFolderName(
              user.emailAddress
            ),
          });
        })
      )
      .subscribe(() => {
        this.contactInfoMode = 'view';
        this.toastr.success(
          'Your account was updated. Please sign-in again with your new email address.',
          'Account updated'
        );
        this.signOut();
      });
  }

  signOut() {
    this.broadcast.dispatch('sign-out-user');
  }
}
