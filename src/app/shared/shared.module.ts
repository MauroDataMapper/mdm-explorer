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
import { AlertComponent } from './alert/alert.component';
import { ClassifiersComponent } from './classifiers/classifiers.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { SafePipe } from './pipes/safe.pipe';
import { ArrowDirective } from './directives/arrow.directive';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { BookmarkToggleComponent } from './bookmark-toggle/bookmark-toggle.component';
import { CoreModule } from '../core/core.module';
import { SummaryMetadataComponent } from './summary-metadata/summary-metadata/summary-metadata.component';
import { SummaryMetadataReportComponent } from './summary-metadata/summary-metadata-report/summary-metadata-report.component';
import { SummaryMetadataChartComponent } from './summary-metadata/summary-metadata-chart/summary-metadata-chart.component';
import { NgChartsModule } from 'ng2-charts';
import { CallToActionComponent } from './call-to-action/call-to-action.component';
import { DataElementInDataSpecificationComponent } from './data-element-in-data-specification/data-element-in-data-specification.component';
import { DataElementMultiSelectComponent } from './data-element-multi-select/data-element-multi-select.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { AutocompleteSelectComponent } from './autocomplete-select/autocomplete-select.component';
import { BackLinkComponent } from './back-link/back-link.component';
import { HeaderAndContentBoxComponent } from './header-and-content-box/header-and-content-box.component';
import {
  DataViewModePipe,
  DialogIsEditablePipe,
  DataDialogComponent,
  DataTableControlComponent,
  ChangeRequestStatusComponent,
  ListComponent,
  RequestButtonLabelPipe,
  IsDatePipe,
  IsRequestStatusPipe,
  IsStringPipe,
  SetDisplayValuePipe,
  RequestsListComponent,
  RequestUpdatesListComponent,
  RequestDialogComponent,
} from '@maurodatamapper/sde-resources';

@NgModule({
  declarations: [
    AlertComponent,
    ClassifiersComponent,
    FooterComponent,
    HeaderComponent,
    SafePipe,
    ArrowDirective,
    BookmarkToggleComponent,
    SummaryMetadataChartComponent,
    SummaryMetadataComponent,
    SummaryMetadataReportComponent,
    LoadingSpinnerComponent,
    CallToActionComponent,
    DataElementInDataSpecificationComponent,
    DataElementMultiSelectComponent,
    ConfirmationDialogComponent,
    AutocompleteSelectComponent,
    BackLinkComponent,
    HeaderAndContentBoxComponent,
  ],
  imports: [CoreModule, NgChartsModule],
  exports: [
    AlertComponent,
    ClassifiersComponent,
    FooterComponent,
    HeaderComponent,
    LoadingSpinnerComponent,
    ArrowDirective,
    BookmarkToggleComponent,
    SummaryMetadataChartComponent,
    SummaryMetadataComponent,
    SummaryMetadataReportComponent,
    CallToActionComponent,
    DataElementInDataSpecificationComponent,
    DataElementMultiSelectComponent,
    AutocompleteSelectComponent,
    BackLinkComponent,
    HeaderAndContentBoxComponent,
    DataViewModePipe,
    DialogIsEditablePipe,
    DataDialogComponent,
    DataTableControlComponent,
    ChangeRequestStatusComponent,
    ListComponent,
    RequestButtonLabelPipe,
    SetDisplayValuePipe,
    RequestsListComponent,
    RequestUpdatesListComponent,
    RequestDialogComponent,
  ],
  providers: [
    IsRequestStatusPipe,
    IsDatePipe,
    IsStringPipe,
    SetDisplayValuePipe,
    RequestButtonLabelPipe,
  ],
})
export class SharedModule {}
