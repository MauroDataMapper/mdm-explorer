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
import { HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController } from '@angular/common/http/testing';
import { getTestBed } from '@angular/core/testing';
import { RequestSettings } from '@maurodatamapper/mdm-resources';
import { BroadcastEvent, BroadcastService } from '../core/broadcast.service';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { MdmHttpClientService } from './mdm-http-client.service';

interface BroadcastServiceStub {
  dispatch: jest.Mock;
}

describe('MdmHttpClientService', () => {
  let service: MdmHttpClientService;
  let httpMock: HttpTestingController;

  const broadcastStub: BroadcastServiceStub = {
    dispatch: jest.fn(),
  };

  const url = 'http://localhost/api/test';

  beforeEach(() => {
    service = setupTestModuleForService(MdmHttpClientService, {
      providers: [
        {
          provide: BroadcastService,
          useValue: broadcastStub,
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

  it('should throw an exception when `withCredentials` is not provided', () => {
    expect(() => {
      service.process('url', {});
    }).toThrow();

    expect(() => {
      service.process('url', { withCredentials: false });
    }).toThrow();
  });

  it.each(['GET', 'POST', 'PUT', 'DELETE'])(
    'should return a valid HTTP response from a %p request',
    (httpMethod) => {
      const options: RequestSettings = {
        method: httpMethod,
        body: { message: 'Testing...' },
        withCredentials: true,
      };

      const expectedResponseBody = {
        message: 'Test worked',
      };

      service.process(url, options).subscribe((response) => {
        expect(response.status).toBe(200);
        expect(response.ok).toBeTruthy();
        expect(response.body).toEqual(expectedResponseBody);
      });

      const request = httpMock.expectOne(url);
      expect(request.request.method).toBe(httpMethod);
      request.flush(expectedResponseBody);
    },
  );

  it('should throw an error from a HTTPErrorResponse', () => {
    const options: RequestSettings = {
      method: 'GET',
      body: { message: 'Testing...' },
      withCredentials: true,
    };

    const expectedStatus = 500;
    const expectedResponseBody = {
      errorMessage: 'Something bad happened!',
    };

    service.process(url, options).subscribe({
      next: () => {
        throw new Error('Should not happen!');
      },
      error: (error: HttpErrorResponse) => {
        expect(error.status).toBe(expectedStatus);
        expect(error.ok).toBeFalsy();
        expect(error.error).toEqual(expectedResponseBody);
      },
    });

    const request = httpMock.expectOne(url);
    request.flush(expectedResponseBody, {
      status: 500,
      statusText: 'Server error',
    });
  });

  describe('Broadcasting HTTP errors', () => {
    const testHttpRequest = (
      options: RequestSettings,
      expectedStatus: number,
      expectedBroadcastEvent: BroadcastEvent,
    ) => {
      service.process(url, options).subscribe({
        next: () => {
          throw new Error('Should not happen!');
        },
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(expectedStatus);
        },
      });

      const request = httpMock.expectOne(url);
      request.flush(
        {},
        {
          status: expectedStatus,
          statusText: 'Failed',
        },
      );

      expect(broadcastStub.dispatch).toHaveBeenCalledWith(
        expectedBroadcastEvent,
        expect.any(Object),
      );
    };

    it('should broadcast "Application Offline" error', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
        },
        0,
        'http-application-offline',
      );
    });

    it('should broadcast "Not Authorized" error', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
        },
        401,
        'http-not-authorized',
      );
    });

    it('should broadcast "Server Timeout" error', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
        },
        504,
        'http-server-timeout',
      );
    });

    it('should broadcast "Not Found" error from HttpNotFound status', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
          handleGetErrors: true, // Triggers internal handling of error
        },
        404,
        'http-not-found',
      );
    });

    it('should broadcast "Not Found" error from HttpBadRequest status', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
          handleGetErrors: true, // Triggers internal handling of error
        },
        400,
        'http-not-found',
      );
    });

    it('should broadcast "Not Implemented" error', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
        },
        501,
        'http-not-implemented',
      );
    });

    it('should broadcast "Server Error" error', () => {
      testHttpRequest(
        {
          method: 'GET',
          body: { message: 'Testing...' },
          withCredentials: true,
        },
        500,
        'http-server-error',
      );
    });
  });
});
