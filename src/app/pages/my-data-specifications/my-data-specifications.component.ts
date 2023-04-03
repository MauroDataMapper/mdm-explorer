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
  DataSpecification,
  DataSpecificationStatus,
} from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { SortByOption } from '../../data-explorer/sort-by/sort-by.component';
import { Sort } from '../../mauro/sort.type';
import { SecurityService } from '../../security/security.service';

/**
 * These options must be of the form '{propertyToSortBy}-{order}' where propertyToSortBy
 * can be any property on the objects you are sorting and order must be of type
 * {@link SortOrder }
 */
export type DataSpecificationSortByOption = 'label-asc' | 'label-desc';

@Component({
  selector: 'mdm-my-data-specifications',
  templateUrl: './my-data-specifications.component.html',
  styleUrls: ['./my-data-specifications.component.scss'],
})
export class MyDataSpecificationsComponent implements OnInit {
  allDataSpecifications: DataSpecification[] = [];
  filteredDataSpecifications: DataSpecification[] = [];
  statusFilters: DataSpecificationStatus[] = [];
  state: 'idle' | 'loading' = 'idle';

  sortByOptions: SortByOption[] = [
    { value: 'label-asc', displayName: 'Name (a-z)' },
    { value: 'label-desc', displayName: 'Name (z-a)' },
  ];
  sortByDefaultOption: SortByOption = this.sortByOptions[0];
  sortBy?: SortByOption;

  constructor(
    private security: SecurityService,
    private dataSpecification: DataSpecificationService,
    private toastr: ToastrService
  ) {}

  get hasMultipleStatuses() {
    const statuses = this.allDataSpecifications.map(
      (specification) => specification.status
    );
    const distinct = new Set(statuses);
    return distinct.size > 1;
  }

  ngOnInit(): void {
    this.initialiseDataSpecifications();
  }

  filterByStatus(event: MatSelectChange) {
    const filters = event.value === 'all' ? ['submitted', 'unsent'] : [event.value];
    this.filterAndSortDataSpecifications(filters, this.sortBy);
  }

  initialiseDataSpecifications() {
    this.state = 'loading';
    this.getUserDataSpecifications()
      .pipe(finalize(() => (this.state = 'idle')))
      .subscribe((dataSpecifications) => {
        this.allDataSpecifications = dataSpecifications;
        this.filterAndSortDataSpecifications();
      });
  }

  selectSortBy(selected: SortByOption) {
    this.filterAndSortDataSpecifications(this.statusFilters, selected);
  }

  private getUserDataSpecifications() {
    const user = this.security.getSignedInUser();
    if (!user) {
      return throwError(() => new Error('Cannot find user'));
    }

    return this.dataSpecification.list().pipe(
      catchError(() => {
        this.toastr.error('There was a problem finding your data specifications.');
        return EMPTY;
      })
    );
  }

  private filterAndSortDataSpecifications(
    filters?: DataSpecificationStatus[],
    sortBy?: SortByOption
  ) {
    this.statusFilters = filters ?? ['submitted', 'unsent'];
    const filtered =
      this.statusFilters.length === 0
        ? this.allDataSpecifications
        : this.allDataSpecifications.filter((specification) =>
            this.statusFilters.includes(specification.status)
          );

    this.sortBy = sortBy ?? this.sortByDefaultOption;
    const [property, order] = Sort.defineSortParams(this.sortBy.value);
    const sorted = filtered.sort((a, b) => Sort.compareByString(a, b, property, order));

    this.filteredDataSpecifications = sorted;
  }
}
