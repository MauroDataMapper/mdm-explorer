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
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { UIRouterGlobals } from '@uirouter/angular';
import { ClipboardService } from 'ngx-clipboard';
import { ToastrService } from 'ngx-toastr';
import { ErrorData } from './error.model';

@Component({
  selector: 'mdm-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent implements OnInit {

  lastHttpError: HttpErrorResponse | undefined;

  heading = '';
  message = '';
  resolution = '';

  showDetails = false;

  data: ErrorData[] = [];

  constructor(
    protected uiRouterGlobals: UIRouterGlobals,
    protected clipboard: ClipboardService,
    protected toastr: ToastrService) { }

  ngOnInit(): void {
    this.lastHttpError = this.uiRouterGlobals.params.lastError;
  }

  toggleShowDetails() {
    this.showDetails = !this.showDetails;
  }

  copyToClipboard() {
    if (this.clipboard.copyFromContent(this.getLastErrorAsMarkdown())) {
      this.toastr.success('Copied information to clipboard');
    }
  }

  private getLastErrorAsMarkdown() {
    const json = JSON.stringify(this.lastHttpError, null, 2);
    const jsonMd = '```json\n' + json + '\n```';

    return ''.concat(
      `## ${this.heading}\n\n`,
      `${this.message}\n\n`,
      '## Details\n\n',
      jsonMd,
      '\n');
  }
}
