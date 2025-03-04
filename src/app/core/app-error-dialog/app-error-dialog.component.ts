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
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BroadcastService } from 'src/app/core/broadcast.service';

export interface AppErrorDialogData {
  error: any;
}

@Component({
  selector: 'mdm-app-error-dialog',
  templateUrl: './app-error-dialog.component.html',
  styleUrls: ['./app-error-dialog.component.scss'],
})
export class AppErrorDialogComponent implements OnInit {
  error: any;

  title = 'Application error';
  subText = 'We\'re sorry, but this application encountered an error which prevents it from operating.';
  suggestionText = 'Attempt to rectify the error (or contact your administrator), then reload this page to try again.';
  buttonText = '';
  signOutUrl?: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: AppErrorDialogData,
    private broadcast: BroadcastService,
  ) { }

  ngOnInit(): void {
    this.error = this.data.error;

    // If this error looks like the user has lost access then tell them and 
    // sign out the user when the dialog closes.
    if (this.error.status === 400 || this.error.status === 401) {
      this.title = 'Not signed in';
      this.subText = 'It appears that you have been automatically signed out and will now need to sign in again to continue';
      this.suggestionText = '';
      this.error.message = '';
      this.buttonText = 'Close';
    }
  }

  signOut() {
    this.broadcast.dispatch('sign-out-user');
  }
}
