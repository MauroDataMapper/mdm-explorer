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
import { DataSpecificationStatusChipComponent } from './data-specification-status-chip/data-specification-status-chip.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { DataElementRowComponent } from './data-element-row/data-element-row.component';
import { DataClassRowComponent } from './data-class-row/data-class-row.component';
import { DataSchemaRowComponent } from './data-schema-row/data-schema-row.component';
import { CreateDataSpecificationDialogComponent } from './create-data-specification-dialog/create-data-specification-dialog.component';
import { DataSpecificationCreatedDialogComponent } from './data-specification-created-dialog/data-specification-created-dialog.component';
import { DataSpecificationUpdatedDialogComponent } from './data-specification-updated-dialog/data-specification-updated-dialog.component';
import { SuccessDialogComponent } from './success-dialog/success-dialog.component';
import { IdentifiableDataIconComponent } from './identifiable-data-icon/identifiable-data-icon.component';
import { SearchFiltersComponent } from './search-filters/search-filters.component';
import { CatalogueSearchFormComponent } from './catalogue-search-form/catalogue-search-form.component';
import { OkCancelDialogComponent } from './ok-cancel-dialog/ok-cancel-dialog.component';
import { QueryBuilderComponent } from '../data-explorer/querybuilder/querybuilder.component';
import { QueryBuilderModule } from 'angular2-query-builder';
import { MeqlPipe } from './pipes/meql.pipe';
import { MeqlOutputComponent } from './meql-output/meql-output.component';
import { DataSpecificationRowComponent } from './data-specification-row/data-specification-row.component';
import { DataQueryRowComponent } from './data-query-row/data-query-row.component';
import { NumberFormatDirective } from './querybuilder/directives/number-format.directive';
import { EditDataSpecificationDialogComponent } from './edit-data-specification-dialog/edit-data-specification-dialog.component';
import { SelectionExpandedDialogComponent } from './selection-expanded-dialog/selection-expanded-dialog.component';
import { SelectionCompactComponent } from './selection-compact/selection-compact.component';
import { ShareDataSpecificationDialogComponent } from './share-data-specification-dialog/share-data-specification-dialog.component';
import { FilterByComponent } from './filter-by/filter-by.component';
import { VersionSelectorComponent } from './version-selector/version-selector.component';

@NgModule({
  declarations: [
    DataElementSearchResultComponent,
    DataElementRowComponent,
    DataClassRowComponent,
    DataSchemaRowComponent,
    DataSpecificationStatusChipComponent,
    PaginationComponent,
    SortByComponent,
    ContactFormComponent,
    FeedbackDialogComponent,
    BreadcrumbComponent,
    CreateDataSpecificationDialogComponent,
    DataSpecificationCreatedDialogComponent,
    DataSpecificationUpdatedDialogComponent,
    SuccessDialogComponent,
    IdentifiableDataIconComponent,
    SearchFiltersComponent,
    CatalogueSearchFormComponent,
    OkCancelDialogComponent,
    QueryBuilderComponent,
    MeqlPipe,
    MeqlOutputComponent,
    DataSpecificationRowComponent,
    DataQueryRowComponent,
    NumberFormatDirective,
    EditDataSpecificationDialogComponent,
    SelectionExpandedDialogComponent,
    SelectionCompactComponent,
    ShareDataSpecificationDialogComponent,
    FilterByComponent,
    VersionSelectorComponent,
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
    DataSpecificationStatusChipComponent,
    BreadcrumbComponent,
    IdentifiableDataIconComponent,
    SearchFiltersComponent,
    CatalogueSearchFormComponent,
    QueryBuilderComponent,
    MeqlOutputComponent,
    DataSpecificationRowComponent,
    DataQueryRowComponent,
    NumberFormatDirective,
    SelectionCompactComponent,
    FilterByComponent,
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
