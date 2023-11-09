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
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MdmRestHandler, RequestSettings } from '@maurodatamapper/mdm-resources';
import { catchError, throwError } from 'rxjs';
import { BroadcastEvent, BroadcastService } from '../core/broadcast.service';

/**
 * An IMdmRestHandler implemented using Angular's HttpClient.
 */
@Injectable({
  providedIn: 'root',
})
export class MdmHttpClientService implements MdmRestHandler {
  constructor(
    private http: HttpClient,
    private broadcast: BroadcastService,
  ) {}

  process(url: string, options: RequestSettings) {
    if (
      options.withCredentials === undefined ||
      options.withCredentials === null ||
      (options.withCredentials !== undefined && options.withCredentials === false)
    ) {
      throw new Error('withCredentials is not provided!');
    }

    if (options.responseType) {
    } else {
      options.responseType = undefined;
    }

    options.headers = options.headers || {};
    // STOP IE11 from Caching HTTP GET
    options.headers['Cache-Control'] = 'no-cache';
    options.headers.Pragma = 'no-cache';

    return this.http
      .request(options.method as string, url, {
        body: options.body,
        headers: options.headers,
        withCredentials: options.withCredentials,
        observe: 'response',
        responseType: options.responseType,
      })
      .pipe(
        catchError((response: HttpErrorResponse) => {
          const event = this.getBroadcastEvent(response, options);
          if (event) {
            this.broadcast.dispatch<HttpErrorResponse>(event, response);
          }

          return throwError(() => response);
        }),
      );
  }

  private getBroadcastEvent(
    response: HttpErrorResponse,
    options: RequestSettings,
  ): BroadcastEvent | null {
    // For any GET requests that return 4XX response, automatically handle them unless overridden
    const handleGetErrors: boolean = options?.handleGetErrors ?? true;

    if (response.status === 0 || response.status === -1) {
      return 'http-application-offline';
    }

    if (response.status === 401 && !options.login) {
      return 'http-not-authorized';
    }

    if (response.status === 504) {
      return 'http-server-timeout';
    }

    if (response.status === 404 && options.method === 'GET' && handleGetErrors) {
      return 'http-not-found';
    }

    if (response.status === 501) {
      return 'http-not-implemented';
    }

    if (
      response.status >= 400 &&
      response.status < 500 &&
      options.method === 'GET' &&
      handleGetErrors
    ) {
      return 'http-not-found';
    }

    if (response.status >= 500) {
      return 'http-server-error';
    }

    return null;
  }
}
