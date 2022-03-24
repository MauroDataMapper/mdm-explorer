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
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { PaginationService } from '../pagination.service';

@Component({
  selector: 'mdm-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() currentPage = 1;

  @Input() pageSize = 0;

  @Input() totalResults = 0;

  @Output() selected = new EventEmitter<number>();

  totalPages = 0;

  pages: number[] = [];

  constructor(private pagination: PaginationService) {}

  ngOnInit(): void {
    this.setPages();
  }

  ngOnChanges(): void {
    this.setPages();
  }

  select(page: number) {
    if (page === this.currentPage) {
      return;
    }

    this.selected.emit(page);
  }

  private setPages() {
    if (this.pageSize === 0 || this.totalResults === 0) {
      return;
    }

    this.totalPages = this.pagination.getTotalNumberOfPages(
      this.totalResults,
      this.pageSize
    );
    this.pages = this.pagination.getPageNumbers(this.currentPage, this.totalPages);
  }
}
