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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatSelectionListChange } from '@angular/material/list';
import { DataElement } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize } from 'rxjs';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import {
  DataRequest,
  DataRequestStatus,
} from 'src/app/data-explorer/data-explorer.types';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-my-requests',
  templateUrl: './my-requests.component.html',
  styleUrls: ['./my-requests.component.scss'],
})
export class MyRequestsComponent implements OnInit {
  allRequests: DataRequest[] = [];
  filteredRequests: DataRequest[] = [];
  statusFilters: DataRequestStatus[] = [];
  request?: DataRequest;
  requestElements: DataElement[] = [];
  state: 'idle' | 'loading' = 'idle';

  constructor(
    private security: SecurityService,
    private userRequests: UserRequestsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (!user) {
      return;
    }

    this.state = 'loading';

    this.userRequests
      .list(user.email)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem finding your requests.');
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe((requests) => {
        this.allRequests = requests;
        this.filterRequests();
        this.setRequest(
          this.filteredRequests.length > 0 ? this.filteredRequests[0] : undefined
        );
      });
  }

  selectRequest(event: MatSelectionListChange) {
    const selected = event.options[0].value as DataRequest;
    this.setRequest(selected);
  }

  filterByStatus(event: MatCheckboxChange) {
    const status = event.source.value as DataRequestStatus;
    if (event.checked) {
      this.statusFilters = [...this.statusFilters, status];
    } else {
      this.statusFilters = this.statusFilters.filter((s) => s !== status);
    }

    this.filterRequests();
  }

  private filterRequests() {
    this.filteredRequests = this.allRequests.filter((req) => {
      return this.statusFilters.length > 0
        ? this.statusFilters.includes(req.status)
        : true;
    });
  }

  private setRequest(request?: DataRequest) {
    this.request = request;
    if (!this.request) {
      this.requestElements = [];
      return;
    }

    this.state = 'loading';

    this.userRequests
      .getRequestDataElements(this.request)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem locating your request details.');
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe((dataElements) => {
        this.requestElements = dataElements;
      });
  }
}
