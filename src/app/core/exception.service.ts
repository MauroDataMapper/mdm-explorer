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
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, OperatorFunction } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExceptionService {
  constructor() {}

  catchAndReportPipeError(errors: any[]) {
    return catchError((err) => {
      // err could be an http response error or a simple error message from a throw:
      let message: string | null = null;
      if (err.status) {
        message = (err as HttpErrorResponse).error.errors[0].message;
      }
      errors[errors.length] = message || (err as string);
      return [];
    }) as OperatorFunction<any, any>;
  }
}
