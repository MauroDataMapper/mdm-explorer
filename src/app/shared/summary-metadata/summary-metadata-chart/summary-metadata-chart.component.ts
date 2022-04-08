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
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import {
  SummaryMetadata,
  SummaryMetadataReport,
} from 'src/app/mauro/summary-metadata.service';

@Component({
  selector: 'mdm-summary-metadata-chart',
  templateUrl: './summary-metadata-chart.component.html',
  styleUrls: ['./summary-metadata-chart.component.scss'],
})
export class SummaryMetadataChartComponent implements OnInit {
  @Input() summaryMetadata?: SummaryMetadata;
  @Input() summaryMetadataReport?: SummaryMetadataReport;

  public displayChart = false;

  public barChartOptions: ChartOptions = {
    responsive: true,
  };

  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartData = {
    datasets: [],
    labels: [],
  };

  constructor() {}

  ngOnInit(): void {
    if (this.summaryMetadata && this.summaryMetadataReport) {
      if (
        this.summaryMetadata.summaryMetadataType &&
        this.summaryMetadata.summaryMetadataType.toLowerCase() === 'map'
      ) {
        this.handleMap();
      }
    }
  }

  private handleMap(): void {
    const data: any[] = [];
    const labels: any[] = [];

    if (this.summaryMetadataReport && this.summaryMetadataReport.reportValue) {
      const p = JSON.parse(this.summaryMetadataReport.reportValue); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      for (const key in p) {
        if (p.hasOwnProperty(key)) {
          data.push(p[key]);
          labels.push(key);
        }
      }
    }

    this.barChartData = {
      datasets: [{ data }],
      labels,
    };

    this.displayChart = true;
  }
}
