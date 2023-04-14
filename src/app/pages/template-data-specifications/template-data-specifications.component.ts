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
import { DataSpecification } from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { SortByOption } from '../../data-explorer/sort-by/sort-by.component';
import { Sort } from '../../mauro/sort.type';
import { ResearchPluginService } from '../../mauro/research-plugin.service';

/**
 * These options must be of the form '{propertyToSortBy}-{order}' where propertyToSortBy
 * can be any property on the objects you are sorting and order must be of type
 * {@link SortOrder }
 */
export type TemplateDataSpecificationSortByOption = 'label-asc' | 'label-desc';

@Component({
  selector: 'mdm-template-data-specifications',
  templateUrl: './template-data-specifications.component.html',
  styleUrls: ['./template-data-specifications.component.scss'],
})
export class TemplateDataSpecificationsComponent implements OnInit {
  templateDataSpecifications: DataSpecification[] = [];
  filteredDataSpecifications: DataSpecification[] = [];
  sharedDataSpecifications: DataSpecification[] = [];
  communityDataSpecifications: DataSpecification[] = [];

  state: 'idle' | 'loading' = 'idle';

  sortByOptions: SortByOption[] = [
    { value: 'label-asc', displayName: 'Name (a-z)' },
    { value: 'label-desc', displayName: 'Name (z-a)' },
  ];
  sortByDefaultOption: SortByOption = this.sortByOptions[0];
  sortBy?: SortByOption;

  contentToDisplayOptions: SortByOption[] = [
    { value: 'Templates', displayName: 'Templates' },
    { value: 'Community', displayName: 'Community' },
  ];
  contentToDisplayDefaultOption = this.contentToDisplayOptions[0];
  contentToDisplay: SortByOption = this.contentToDisplayDefaultOption;

  constructor(
    private dataSpecification: DataSpecificationService,
    private toastr: ToastrService,
    private researchPlugin: ResearchPluginService
  ) {}

  ngOnInit(): void {
    this.state = 'loading';

    this.researchPlugin.listSharedDataSpecifications().subscribe((response) => {
      this.sharedDataSpecifications = response;
    });

    this.dataSpecification
      .listTemplates()
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem finding the templates.');
          return EMPTY;
        }),
        finalize(() => (this.state = 'idle'))
      )
      .subscribe((templateDataSpecifications) => {
        this.templateDataSpecifications = templateDataSpecifications;
        this.filterAndSortDataSpecifications();
      });
  }

  selectSortBy(selected: SortByOption) {
    this.filterAndSortDataSpecifications(selected);
  }

  copy(dataSpecification: DataSpecification) {
    this.dataSpecification
      .getDataSpecificationFolder()
      .pipe(
        switchMap((dataSpecificationFolder) =>
          this.dataSpecification.forkWithDialogs(dataSpecification, {
            targetFolder: dataSpecificationFolder,
          })
        )
      )
      .subscribe();
  }

  selectContentToDisplay(value: SortByOption) {
    this.contentToDisplay = value;
  }

  private filterAndSortDataSpecifications(sortBy?: SortByOption) {
    const filtered = this.templateDataSpecifications;

    this.sortBy = sortBy ?? this.sortByDefaultOption;
    const [property, order] = Sort.defineSortParams(this.sortBy.value);
    const sorted = filtered.sort((a, b) => Sort.compareByString(a, b, property, order));

    this.filteredDataSpecifications = sorted;
  }
}
