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
import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions, ChartType, ChartData } from 'chart.js';
import { SummaryMetadata, SummaryMetadataReport } from '@maurodatamapper/mdm-explorer/app/mauro/summary-metadata.service';

@Component({
  selector: 'mdm-summary-metadata-chart',
  templateUrl: './summary-metadata-chart.component.html',
  styleUrls: ['./summary-metadata-chart.component.scss'],
})
export class SummaryMetadataChartComponent implements OnInit {
  @Input() summaryMetadata?: SummaryMetadata;
  @Input() summaryMetadataReport?: SummaryMetadataReport;

  public displayChart = false;
  colours: string[] = [
    '#F0561D99',
    '#5E40BE99',
    '#37A3A399',
    '#DCA61499',
    '#63993D99',
    '#CA6C0F99',
    '#0066CC99',

    '#F0561D99',
    '#B6A6E999',
    '#9AD8D899',
    '#FFE07299',
    '#AFDC8F99',
    '#F8AE5499',
    '#92C5F999',

    '#731F0099',
    '#21134D99',
    '#004D4D99',
    '#96640F99',
    '#204D0099',
    '#732E0099',
    '#00336699',
  ];

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

    const backgroundColor: any[] = new Array(data.length);

    for (let dp = 0; dp < data.length; dp++) {
      backgroundColor[dp] = this.colours[dp % this.colours.length];
    }

    this.barChartData = {
      datasets: [{ data, backgroundColor, borderColor: backgroundColor }],
      labels,
    };

    this.displayChart = true;
  }
}
