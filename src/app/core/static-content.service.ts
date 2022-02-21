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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map, Observable } from 'rxjs';

/**
 * Defines the configuration needed for the {@link StaticContentService}.
 */
export interface StaticContentConfiguration {
  /**
   * The URL location where asset/static content is stored. Can be relative.
   */
  contentLocation: string;
}

export const STATIC_CONTENT_CONFIGURATION =
  new InjectionToken<StaticContentConfiguration>('StaticContentConfiguration');

/**
 * Service to manage static content in the application.
 *
 * The {@link STATIC_CONTENT_CONFIGURATION} is required to be injected for this service to work correctly.
 */
@Injectable({
  providedIn: 'root',
})
export class StaticContentService {
  private contentHeaders: HttpHeaders;

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer,
    @Inject(STATIC_CONTENT_CONFIGURATION) private config: StaticContentConfiguration
  ) {
    this.contentHeaders = new HttpHeaders({
      'Content-Type': 'text/html',
    });
  }

  /**
   * Get HTML content from a static resource.
   *
   * @param path The path to the static content to fetch.
   * @returns A observable returning a `SafeHtml` value, assuming that the content fetched is safe HTML and can be rendered.
   */
  getContent(path: string): Observable<SafeHtml> {
    const url = `${this.config.contentLocation}/${path}.html`;
    return this.http
      .get(url, { headers: this.contentHeaders, responseType: 'text' })
      .pipe(map((text) => this.sanitizer.bypassSecurityTrustHtml(text)));
  }
}
