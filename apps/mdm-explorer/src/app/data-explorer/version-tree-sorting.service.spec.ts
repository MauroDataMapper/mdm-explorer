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

import { TestBed } from '@angular/core/testing';

import { VersionTreeSortingService } from './version-tree-sorting.service';
import { SimpleModelVersionTree } from '@maurodatamapper/mdm-resources';
import { VersionOption } from './version-selector/version-selector.component';

describe('VersionTreeSortingService', () => {
  let service: VersionTreeSortingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionTreeSortingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should order correctly simple model trees when there are no undefined', () => {
    // Arrange
    const unorderedData: SimpleModelVersionTree[] = [
      {
        id: '8de99c73-320f-41c3-b6d5-6466b53943c1',
        branch: undefined,
        modelVersion: '1.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V1.0.0',
      },
      {
        id: '2ea13db7-727d-47d1-b002-854c12f95b7d',
        branch: undefined,
        modelVersion: '2.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V2.0.0',
      },
      {
        id: 'a405f49c-2383-406f-bfd4-7410ebe35580',
        branch: undefined,
        modelVersion: '4.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V4.0.0',
      },
      {
        id: 'e376f54b-8caa-4fb9-b061-bf463ce47324',
        branch: undefined,
        modelVersion: '5.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V5.0.0',
      },
      {
        id: '7d1ad2f0-ef0f-425f-bae7-1827ffa6115f',
        branch: undefined,
        modelVersion: '6.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V6.0.0',
      },
      {
        id: 'dc22df14-c226-4814-b72f-f0fdb54c9b64',
        branch: undefined,
        modelVersion: '7.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V7.0.0',
      },
      {
        id: 'da09219e-9f62-4913-9508-2087283f6f8f',
        branch: undefined,
        modelVersion: '9.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V9.0.0',
      },
      {
        id: '7496fff5-1f21-4d07-a6ec-2d046e509570',
        branch: undefined,
        modelVersion: '10.0.0',
        documentationVersion: '1.0.0',
        displayName: ' V10.0.0',
      },
      {
        id: 'e35449d6-7923-4288-926c-53b034367215',
        branch: undefined,
        modelVersion: '8.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V8.0.0',
      },
      {
        id: 'b9d97561-83d1-4182-a53b-18b18776810f',
        branch: undefined,
        modelVersion: '3.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V3.0.0',
      },
    ];

    const orderedData: SimpleModelVersionTree[] = [
      {
        id: '8de99c73-320f-41c3-b6d5-6466b53943c1',
        branch: undefined,
        modelVersion: '1.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V1.0.0',
      },
      {
        id: '2ea13db7-727d-47d1-b002-854c12f95b7d',
        branch: undefined,
        modelVersion: '2.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V2.0.0',
      },
      {
        id: 'b9d97561-83d1-4182-a53b-18b18776810f',
        branch: undefined,
        modelVersion: '3.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V3.0.0',
      },
      {
        id: 'a405f49c-2383-406f-bfd4-7410ebe35580',
        branch: undefined,
        modelVersion: '4.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V4.0.0',
      },
      {
        id: 'e376f54b-8caa-4fb9-b061-bf463ce47324',
        branch: undefined,
        modelVersion: '5.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V5.0.0',
      },
      {
        id: '7d1ad2f0-ef0f-425f-bae7-1827ffa6115f',
        branch: undefined,
        modelVersion: '6.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V6.0.0',
      },
      {
        id: 'dc22df14-c226-4814-b72f-f0fdb54c9b64',
        branch: undefined,
        modelVersion: '7.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V7.0.0',
      },
      {
        id: 'e35449d6-7923-4288-926c-53b034367215',
        branch: undefined,
        modelVersion: '8.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V8.0.0',
      },
      {
        id: 'da09219e-9f62-4913-9508-2087283f6f8f',
        branch: undefined,
        modelVersion: '9.0.0',
        documentationVersion: '1.0.0',
        displayName: 'V9.0.0',
      },
      {
        id: '7496fff5-1f21-4d07-a6ec-2d046e509570',
        branch: undefined,
        modelVersion: '10.0.0',
        documentationVersion: '1.0.0',
        displayName: ' V10.0.0',
      },
    ];

    // Act
    const result = unorderedData.sort(service.compareModelVersion());

    // Assert
    expect(result).toEqual(orderedData);
  });

  it('should order correctly version options', () => {
    // Arrange
    const unorderedData: VersionOption[] = [
      {
        id: 'V11.0.0',
        displayName: 'V11.0.0',
      },
      {
        id: 'V2.1.1',
        displayName: 'V2.1.1',
      },
      {
        id: 'V1.0.0',
        displayName: 'V1.0.0',
      },
      {
        id: 'V2.1.0',
        displayName: 'V2.1.0',
      },
      {
        id: 'V10.0.0',
        displayName: 'V10.0.0',
      },
      {
        id: 'V2.0.0',
        displayName: 'V2.0.0',
      },
    ];

    const orderedData: VersionOption[] = [
      {
        id: 'V1.0.0',
        displayName: 'V1.0.0',
      },
      {
        id: 'V2.0.0',
        displayName: 'V2.0.0',
      },

      {
        id: 'V2.1.0',
        displayName: 'V2.1.0',
      },
      {
        id: 'V2.1.1',
        displayName: 'V2.1.1',
      },
      {
        id: 'V10.0.0',
        displayName: 'V10.0.0',
      },
      {
        id: 'V11.0.0',
        displayName: 'V11.0.0',
      },
    ];

    // Act
    const result = unorderedData.sort(service.compareVersionOptions());

    // Assert
    expect(result).toEqual(orderedData);
  });
});
