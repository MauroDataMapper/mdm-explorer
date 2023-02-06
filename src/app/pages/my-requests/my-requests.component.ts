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
import { MatSelectChange } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, throwError } from 'rxjs';
import {
  DataRequest,
  DataRequestStatus,
  SortOrder,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { SortByOption } from 'src/app/data-explorer/sort-by/sort-by.component';
import { Sort } from 'src/app/mauro/sort.type';
import { SecurityService } from 'src/app/security/security.service';

/**
 * These options must be of the form '{propertyToSortBy}-{order}' where propertyToSortBy
 * can be any property on the objects you are sorting and order must be of type
 * {@link SortOrder }
 */
export type DataRequestSortByOption = 'label-asc' | 'label-desc';

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

  sortByOptions: SortByOption[] = [
    { value: 'label-asc', displayName: 'Name (a-z)' },
    { value: 'label-desc', displayName: 'Name (z-a)' },
  ];
  sortByDefaultOption: SortByOption = this.sortByOptions[0];
  sortBy?: SortByOption;

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

  filterByStatus(event: MatSelectChange) {
    const filters = event.value === 'all' ? ['submitted', 'unsent'] : [event.value];
    this.filterAndSortRequests(filters, this.sortBy);
  }

  initialiseRequests() {
    this.state = 'loading';
    this.getUserRequests()
      .pipe(finalize(() => (this.state = 'idle')))
      .subscribe((requests) => {
        this.allRequests = requests;
        this.filterAndSortRequests();
      });
  }

  selectSortBy(selected: SortByOption) {
    this.filterAndSortRequests(this.statusFilters, selected);
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
      })
    );
  }

  private filterAndSortRequests(filters?: DataRequestStatus[], sortBy?: SortByOption) {
    this.statusFilters = filters ?? ['submitted', 'unsent'];
    const filtered =
      this.statusFilters.length === 0
        ? this.allRequests
        : this.allRequests.filter((req) => this.statusFilters.includes(req.status));

    this.sortBy = sortBy ?? this.sortByDefaultOption;
    const [property, order] = Sort.defineSortParams(this.sortBy.value);
    const sorted = filtered.sort((a, b) => Sort.compareByString(a, b, property, order));

    this.filteredRequests = sorted;
  }
}
