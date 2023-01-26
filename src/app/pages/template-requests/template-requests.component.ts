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
import { catchError, EMPTY, finalize, switchMap } from 'rxjs';
import { DataRequest } from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';

@Component({
  selector: 'mdm-template-requests',
  templateUrl: './template-requests.component.html',
  styleUrls: ['./template-requests.component.scss'],
})
export class TemplateRequestsComponent implements OnInit {
  templateRequests: DataRequest[] = [];
  state: 'idle' | 'loading' = 'idle';

  constructor(private dataRequests: DataRequestsService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.state = 'loading';

    this.dataRequests
      .listTemplates()
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem finding the templates.');
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe((templateRequests) => {
        this.templateRequests = templateRequests;
      });
  }

  copy(request: DataRequest) {
    this.dataRequests
      .getRequestsFolder()
      .pipe(
        switchMap((requestFolder) =>
          this.dataRequests.forkWithDialogs(request, {
            targetFolder: requestFolder,
          })
        )
      )
      .subscribe();
  }
}
