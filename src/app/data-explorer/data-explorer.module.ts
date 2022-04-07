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
import { NgModule } from '@angular/core';
import { CoreModule } from '../core/core.module';
import { SortByComponent } from './sort-by/sort-by.component';
import { SharedModule } from '../shared/shared.module';
import { DataElementSearchResultComponent } from './data-element-search-result/data-element-search-result.component';
import { PaginationComponent } from './pagination/pagination.component';
import { ContactFormComponent } from './contact-form/contact-form.component';
import { FeedbackDialogComponent } from './feedback-dialog/feedback-dialog.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { PAGINATION_CONFIG } from './data-explorer.types';

@NgModule({
  declarations: [
    DataElementSearchResultComponent,
    PaginationComponent,
    SortByComponent,
    ContactFormComponent,
    FeedbackDialogComponent,
    ConfirmComponent,
  ],
  imports: [CoreModule, SharedModule],
  exports: [
    DataElementSearchResultComponent,
    PaginationComponent,
    SortByComponent,
    ContactFormComponent,
    FeedbackDialogComponent,
  ],
  providers: [
    {
      provide: PAGINATION_CONFIG,
      useValue: {
        defaultPageSize: 10,
        maxPagesToShow: 10,
      },
    },
  ],
})
export class DataExplorerModule {}