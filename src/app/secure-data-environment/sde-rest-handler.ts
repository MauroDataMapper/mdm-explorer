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
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { ISdeRestHandler } from './sde-rest-handler.interface';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { UserDetailsService } from '../security/user-details.service';
import { environment } from 'src/environments/environment';

export type HttpRequestDetail = {
  url: string;
  headers: HttpHeaders;
};

@Injectable({
  providedIn: 'root',
})
export class SdeRestHandler implements ISdeRestHandler {
  constructor(private httpClient: HttpClient, private user: UserDetailsService) { }

  get<T>(url: string): any {
    const httpRequestDetail = this.getHttpRequestDetail(url);
    return this.httpClient
      .get<T>(httpRequestDetail.url, { headers: httpRequestDetail.headers })
      .pipe(catchError((error: HttpErrorResponse) => this.handleError(error)));
  }

  post<T>(url: string, body: any): any {
    const httpRequestDetail = this.getHttpRequestDetail(url);

    return this.httpClient
      .post<T>(httpRequestDetail.url, body, { headers: httpRequestDetail.headers })
      .pipe(catchError((error) => this.handleError(error as HttpErrorResponse)));
  }

  put<T>(url: string, body: any): any {
    const httpRequestDetail = this.getHttpRequestDetail(url);

    return this.httpClient
      .put<T>(httpRequestDetail.url, body, { headers: httpRequestDetail.headers })
      .pipe(catchError((error) => this.handleError(error as HttpErrorResponse)));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error);
    } else {
      // The backends returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong
      console.error(`Backend returned code ${error.status}, body was: `, error.error);
    }

    return throwError(() => error);
  }

  private getHttpRequestDetail(url: string): HttpRequestDetail {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.user.get()?.sdeAuthToken ?? ''}`,
    });

    return { url: environment.sdeResearcherEndpoint + url, headers };
  }
}
