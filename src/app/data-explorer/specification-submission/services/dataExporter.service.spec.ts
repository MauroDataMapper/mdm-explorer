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

import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { DataExporterService } from './dataExporter.service';
import { createMdmEndpointsStub } from 'src/app/testing/stubs/mdm-endpoints.stub';
import { MdmEndpointsService } from 'src/app/mauro/mdm-endpoints.service';
import { cold } from 'jest-marbles';
import { ExporterName } from '../type-declarations/submission.resource';
import { HttpEventType, HttpHeaders, HttpResponse } from '@angular/common/http';
import { createDataSpecificationServiceStub } from 'src/app/testing/stubs/data-specifications.stub';
import { DataSpecificationService } from '../../data-specification.service';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';

describe('DataExporterService', () => {
  const exporterNamespace = 'uk.ac.ox.softeng.maurodatamapper.plugins.explorer.provider.exporter';

  let service: DataExporterService;
  const endpointsStub = createMdmEndpointsStub();
  const dataSpecificationServiceStub = createDataSpecificationServiceStub();

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'mockedObjectURL');
  });

  beforeEach(() => {
    service = setupTestModuleForService(DataExporterService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: DataSpecificationService,
          useValue: dataSpecificationServiceStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  test.each([
    [ExporterName.DataModelSqlExporterService, '123'],
    [ExporterName.DataModelPdfExporterService, '456'],
  ])('should export data specification', (exporterName, dataId) => {
    endpointsStub.dataModel.exporters.mockImplementation(() => {
      return cold('a|', {
        a: {
          body: [
            {
              name: 'DataModelSqlExporterService',
              version: '1.0',
              displayName: 'SQL DataModel Exporter',
              namespace: exporterNamespace,
              allowsExtraMetadataKeys: true,
              knownMetadataKeys: [],
              providerType: 'DataModelExporter',
              fileExtension: 'sql',
              contentType: 'application/mauro.datamodel+sql',
              canExportMultipleDomains: false,
            },
            {
              name: 'DataModelPdfExporterService',
              version: '1.0',
              displayName: 'PDF Data Specification Exporter',
              namespace: exporterNamespace,
              allowsExtraMetadataKeys: true,
              knownMetadataKeys: [],
              providerType: 'DataModelExporter',
              fileExtension: 'pdf',
              contentType: 'application/mauro.datamodel+pdf',
              canExportMultipleDomains: false,
            },
          ],
        },
      });
    });

    endpointsStub.dataModel.exportModel.mockImplementationOnce((id, namespace, name, version) => {
      const expectedBody = {
        id: dataId,
        name: exporterName.toString(),
        namespace: exporterNamespace,
        version: '1.0',
      };

      const body = {
        id,
        name,
        namespace,
        version,
      };

      expect(body).toEqual(expectedBody);

      const response = {
        body,
        status: 200,
        headers: new HttpHeaders(),
        statusText: 'OK',
        type: HttpEventType.Response,
        url: '',
        clone: () => new HttpResponse<ArrayBuffer>(),
      };

      return cold('a|', { a: response });
    });

    dataSpecificationServiceStub.get.mockReturnValueOnce(
      cold('(a|)', {
        a: {
          label: 'label',
          modelVersion: 'version',
          description: 'description',
          status: 'finalised',
          domainType: 'DataModel' as CatalogueItemDomainType,
        },
      })
    );

    const expected$ = cold('-(a|)', {
      a: expect.objectContaining({
        filename:
          exporterName === ExporterName.DataModelPdfExporterService
            ? expect.stringMatching(/^label_\d{8}T\d{6}\.pdf$/)
            : expect.stringMatching(/^label_\d{8}T\d{6}\.sql$/),
        url: 'mockedObjectURL',
      }),
    });

    const actual$ = service.exportDataSpecification(dataId, exporterName);

    expect(actual$).toBeObservable(expected$);
  });
});
