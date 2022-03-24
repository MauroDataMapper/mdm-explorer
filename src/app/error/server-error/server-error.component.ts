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
import { Component } from '@angular/core';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { ErrorComponent } from '../error.component';
import { ErrorService } from '../error.service';

@Component({
  selector: 'mdm-server-error',
  templateUrl: '../error.component.html',
  styleUrls: ['../error.component.scss'],
})
export class ServerErrorComponent extends ErrorComponent {
  constructor(clipboard: ClipboardService, toastr: ToastrService, error: ErrorService) {
    super(clipboard, toastr, error);

    this.heading = 'Server Error';
    this.message = 'We\'re sorry, but the server responded with an error message.';
    this.resolution =
      'This may be a temporary issue, so you might like to try again later';

    this.data.push({
      name: 'Reason',
      value: this.lastHttpError?.error?.reason,
      code: false,
    });
    this.data.push({
      name: 'Status',
      value: this.lastHttpError?.error?.status,
      code: false,
    });
    this.data.push({
      name: 'Error Code',
      value: this.lastHttpError?.error?.errorCode,
      code: false,
    });
    this.data.push({ name: 'Path', value: this.lastHttpError?.error?.path, code: false });
    this.data.push({
      name: 'Dev Mode',
      value: this.lastHttpError?.error?.devMode,
      code: false,
    });
    this.data.push({
      name: 'Message',
      value: this.lastHttpError?.error?.message,
      code: false,
    });
    this.data.push({
      name: 'Exception',
      value: this.lastHttpError?.error?.exception,
      code: true,
    });
  }
}
