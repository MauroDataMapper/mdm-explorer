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
import { Component, Input, OnInit } from '@angular/core';
import { Uuid } from '@maurodatamapper/mdm-resources';
import {
  SummaryMetadata,
  SummaryMetadataReport,
  SummaryMetadataService,
} from 'src/app/catalogue/summary-metadata-service';

@Component({
  selector: 'mdm-summary-metadata-report',
  templateUrl: './summary-metadata-report.component.html',
  styleUrls: ['./summary-metadata-report.component.scss'],
})
export class SummaryMetadataReportComponent implements OnInit {
  @Input() catalogueItemDomainType = '';
  @Input() catalogueItemId: Uuid = '';
  @Input() summaryMetadata?: SummaryMetadata;

  summaryMetadataReports: SummaryMetadataReport[] = [];

  constructor(private summaryMetadataService: SummaryMetadataService) {}

  ngOnInit(): void {
    if (this.summaryMetadata) {
      this.summaryMetadataService
        .listReports(
          this.catalogueItemDomainType,
          this.catalogueItemId,
          this.summaryMetadata.id
        )
        .subscribe((data) => {
          this.summaryMetadataReports = data.items;
        });
    }
  }
}
