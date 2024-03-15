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
import { QueryBuilderWrapperComponent } from './query-builder-wrapper/query-builder-wrapper.component';
import { MeqlPipe } from './pipes/meql.pipe';
import { MeqlOutputComponent } from './meql-output/meql-output.component';
import { DataSpecificationRowComponent } from './data-specification-row/data-specification-row.component';
import { DataQueryRowComponent } from './data-query-row/data-query-row.component';
import { NumberFormatDirective } from './query-builder-wrapper/directives/number-format.directive';
import { EditDataSpecificationDialogComponent } from './edit-data-specification-dialog/edit-data-specification-dialog.component';
import { SelectionExpandedDialogComponent } from './selection-expanded-dialog/selection-expanded-dialog.component';
import { SelectionCompactComponent } from './selection-compact/selection-compact.component';
import { ShareDataSpecificationDialogComponent } from './share-data-specification-dialog/share-data-specification-dialog.component';
import { FilterByComponent } from './filter-by/filter-by.component';
import { VersionSelectorComponent } from './version-selector/version-selector.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';
import { QueryInputDirective } from './query-builder/query-input.directive';
import { QueryOperatorDirective } from './query-builder/query-operator.directive';
import { QueryFieldDirective } from './query-builder/query-field.directive';
import { QueryEntityDirective } from './query-builder/query-entity.directive';
import { QueryButtonGroupDirective } from './query-builder/query-button-group.directive';
import { QuerySwitchGroupDirective } from './query-builder/query-switch-group.directive';
import { QueryRemoveButtonDirective } from './query-builder/query-remove-button.directive';
import { QueryEmptyWarningDirective } from './query-builder/query-empty-warning.directive';
import { QueryArrowIconDirective } from './query-builder/query-arrow-icon.directive';
import { LetDirective } from '../shared/directives/let.directive';
import { EntitySelectorDialogComponent } from './query-builder/dialogs/entity-selector-dialog/entity-selector-dialog.component';
import { HasFieldsPipe } from './query-builder/pipes/has-fields-pipe';
import { ArrowFormatPipe } from './query-builder/pipes/arrow-format-pipe';

const queryBuilderModules = [
  QueryBuilderComponent,
  QueryInputDirective,
  QueryOperatorDirective,
  QueryFieldDirective,
  QueryEntityDirective,
  QueryButtonGroupDirective,
  QuerySwitchGroupDirective,
  QueryRemoveButtonDirective,
  QueryEmptyWarningDirective,
  QueryArrowIconDirective,
  EntitySelectorDialogComponent,
  HasFieldsPipe,
  ArrowFormatPipe,
];

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
    QueryBuilderWrapperComponent,
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
    LetDirective,
    ...queryBuilderModules,
  ],
  imports: [CoreModule, SharedModule],
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
    QueryBuilderWrapperComponent,
    MeqlOutputComponent,
    DataSpecificationRowComponent,
    DataQueryRowComponent,
    NumberFormatDirective,
    SelectionCompactComponent,
    FilterByComponent,
    LetDirective,
    ...queryBuilderModules,
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
