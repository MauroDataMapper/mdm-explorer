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
import { NgModule } from '@angular/core';
import { DataElementSearchResultComponent } from './data-element-search-result/data-element-search-result.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SortByComponent } from './sort-by/sort-by.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { PAGINATION_CONFIG } from './data-explorer.types';
import { RequestStatusChipComponent } from './request-status-chip/request-status-chip.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DataElementRowComponent } from './data-element-row/data-element-row.component';
import { DataClassRowComponent } from './data-class-row/data-class-row.component';
import { DataSchemaRowComponent } from './data-schema-row/data-schema-row.component';
import { CreateRequestDialogComponent } from './create-request-dialog/create-request-dialog.component';
import { RequestCreatedDialogComponent } from './request-created-dialog/request-created-dialog.component';
import { RequestUpdatedDialogComponent } from './request-updated-dialog/request-updated-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { IdentifiableDataIconComponent } from './identifiable-data-icon/identifiable-data-icon.component';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { CatalogueSearchFormComponent } from './catalogue-search-form/catalogue-search-form.component';
import { OkCancelDialogComponent } from './ok-cancel-dialog/ok-cancel-dialog.component';
import { QueryBuilderComponent } from '../data-explorer/querybuilder/querybuilder.component';
import { QueryBuilderModule } from 'angular2-query-builder';
import { MeqlPipe } from './pipes/meql.pipe';
import { MeqlOutputComponent } from './meql-output/meql-output.component';
import { DataRequestRowComponent } from './data-request-row/data-request-row.component';
import { DataQueryRowComponent } from './data-query-row/data-query-row.component';

@NgModule({
  declarations: [
    DataElementSearchResultComponent,
    DataElementRowComponent,
    DataClassRowComponent,
    DataSchemaRowComponent,
    RequestStatusChipComponent,
    PaginationComponent,
    SortByComponent,
    ContactFormComponent,
    FeedbackDialogComponent,
    BreadcrumbComponent,
    CreateRequestDialogComponent,
    RequestCreatedDialogComponent,
    RequestUpdatedDialogComponent,
    SuccessDialogComponent,
    IdentifiableDataIconComponent,
    SearchFiltersComponent,
    CatalogueSearchFormComponent,
    OkCancelDialogComponent,
    QueryBuilderComponent,
    MeqlPipe,
    MeqlOutputComponent,
    DataRequestRowComponent,
    DataQueryRowComponent,
  ],
  imports: [CoreModule, SharedModule, QueryBuilderModule],
  exports: [
    DataElementSearchResultComponent,
    DataElementRowComponent,
    DataClassRowComponent,
    DataSchemaRowComponent,
    PaginationComponent,
    SortByComponent,
    ContactFormComponent,
    FeedbackDialogComponent,
    RequestStatusChipComponent,
    BreadcrumbComponent,
    IdentifiableDataIconComponent,
    SearchFiltersComponent,
    CatalogueSearchFormComponent,
    QueryBuilderComponent,
    MeqlOutputComponent,
    DataRequestRowComponent,
    DataQueryRowComponent,
  ],
  providers: [
    {
      provide: PAGINATION_CONFIG,
      useValue: {
        defaultPageSize: 10,
        maxPagesToShow: 5,
      },
    },
  ],
})
export class DataExplorerModule {}
