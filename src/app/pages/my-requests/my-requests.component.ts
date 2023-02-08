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
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, throwError } from 'rxjs';
import {
  DataRequest,
  DataRequestStatus,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { Sort } from 'src/app/mauro/sort.type';
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
  state: 'idle' | 'loading' = 'idle';

  constructor(
    private security: SecurityService,
    private dataRequests: DataRequestsService,
    private toastr: ToastrService
  ) {}

  get hasMultipleRequestStatus() {
    const statuses = this.allRequests.map((req) => req.status);
    const distinct = new Set(statuses);
    return distinct.size > 1;
  }

  ngOnInit(): void {
    this.initialiseRequests();
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

  initialiseRequests() {
    this.state = 'loading';
    this.getUserRequests().subscribe((requests) => {
      this.allRequests = requests.sort((a, b) => Sort.ascString(a.label, b.label));
      this.filterRequests();
    });
  }

  /**
   * Opens a dialog for the user to update a request.
   * Then, updates {@link allRequests} and {@link filteredRequests}.
   *
   * @param name The name of the request to update.
   * @param id The request to update.
   * @param description The description of the request to update.
   * @returns void
   */
  editRequest(name: string, id?: string, description?: string) {
    if (!id) {
      return;
    }

    this.dataRequests.updateWithDialog(id, name, description).subscribe((response) => {
      if (!response) {
        return;
      }
      // Update the list with the new content.
      // All requests...
      this.updateRequestList(id, this.allRequests, response.label, response.description);
      // Filtered requests
      this.updateRequestList(
        id,
        this.filteredRequests,
        response.label,
        response.description
      );
    });
  }

  private updateRequestList(
    requestId: string,
    listToUpdate: DataRequest[],
    newLabel: string,
    newDescription?: string
  ) {
    const allRequestsUpdatedIndex = listToUpdate.findIndex((r) => r.id === requestId);
    if (allRequestsUpdatedIndex < 0) {
      return;
    }
    listToUpdate[allRequestsUpdatedIndex].label = newLabel;
    listToUpdate[allRequestsUpdatedIndex].description = newDescription;
  }

  private getUserRequests() {
    const user = this.security.getSignedInUser();
    if (!user) {
      return throwError(() => new Error('Cannot find user'));
    }

    return this.dataRequests.list().pipe(
      catchError(() => {
        this.toastr.error('There was a problem finding your requests.');
        return EMPTY;
      }),
      finalize(() => (this.state = 'idle'))
    );
  }

  private filterRequests() {
    this.state = 'loading';
    this.filteredRequests =
      this.statusFilters.length === 0
        ? this.allRequests
        : this.allRequests.filter((req) => this.statusFilters.includes(req.status));

    this.state = 'idle';
  }
}
