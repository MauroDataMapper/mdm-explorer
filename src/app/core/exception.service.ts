import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, EMPTY, from, Observable, of, OperatorFunction } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExceptionService {
  constructor() {}

  catchAndReportPipeError(errors: any[]) {
    return catchError((err) => {
      //err could be an http response error or a simple error message from a throw:
      let message: string | null = null;
      if (err.status) {
        message = (err as HttpErrorResponse).error.errors[0].message;
      }
      errors[errors.length] = message || (err as string);
      return [];
    });
  }
}
