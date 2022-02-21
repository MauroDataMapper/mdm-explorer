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
import { HttpTestingController } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { setupTestModuleForService } from '../testing/testing.helpers';
import {
  StaticContentConfiguration,
  StaticContentService,
  STATIC_CONTENT_CONFIGURATION,
} from './static-content.service';

describe('StaticContentService', () => {
  let service: StaticContentService;
  let httpMock: HttpTestingController;

  const config: StaticContentConfiguration = {
    contentLocation: '/assets/content',
  };

  beforeEach(() => {
    service = setupTestModuleForService(StaticContentService, {
      providers: [
        {
          provide: STATIC_CONTENT_CONFIGURATION,
          useValue: config,
        },
      ],
    });

    const injector = getTestBed();
    httpMock = injector.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each(['test', 'folder/page', 'outer/inner/page'])(
    'should return content when %p is requested',
    (path) => {
      const expectedUrl = `${config.contentLocation}/${path}.html`;
      const expectedContent = '<p>Test works!</p>';

      service.getContent(path).subscribe((content) => {
        expect(content).toBe(expectedContent);
      });

      const request = httpMock.expectOne(expectedUrl);
      expect(request.request.method).toBe('GET');
      request.flush(expectedContent);
    }
  );
});
