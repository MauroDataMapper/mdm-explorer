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
import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Exporter, ExporterIndexResponse, Uuid } from '@maurodatamapper/mdm-resources';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import { ExporterName } from '../submission.resource';

@Injectable({
  providedIn: 'root',
})
export class DataExporterService {
  constructor(private endpoints: MdmEndpointsService) {}

  public exportDataSpecification(
    specificationId: Uuid,
    exporterName: ExporterName
  ): Observable<string> {
    return this.getExporter(exporterName).pipe(
      switchMap((exporter) => {
        return forkJoin([of(exporter), this.doExport(specificationId, exporter)]);
      }),
      map(([exporter, response]) => {
        return this.handleStandardExporterResponse(exporter as Exporter, response);
      })
    );
  }

  private getExporter(exporterName: ExporterName): Observable<Exporter> {
    return this.endpoints.dataModel.exporters().pipe(
      map((response: ExporterIndexResponse) => {
        const exporters = response.body as Exporter[];
        return exporters.find((exporter) => exporter.name === exporterName);
      })
    );
  }

  private doExport(
    specificationId: Uuid,
    exporter: Exporter
  ): Observable<HttpResponse<ArrayBuffer>> {
    const requestSettings = { responseType: 'arraybuffer' };
    return this.endpoints.dataModel.exportModel(
      specificationId,
      exporter.namespace,
      exporter.name,
      exporter.version,
      undefined, // options
      requestSettings
    );
  }

  private handleStandardExporterResponse(
    exporter: Exporter,
    response: HttpResponse<ArrayBuffer>
  ): string {
    if (response.body) {
      const file = new Blob([response.body], {
        type: exporter.fileType,
      });
      const link = this.createBlobLink(file);
      return link;
    }
    return 'no_link';
  }

  private createBlobLink(blob: Blob) {
    const url = (window.URL || window.webkitURL).createObjectURL(blob);
    return url;
  }
}
