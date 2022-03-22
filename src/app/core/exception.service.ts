import { Injectable } from '@angular/core';
import { catchError, EMPTY, from, Observable, of, OperatorFunction } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExceptionService {
  constructor() {}

  catchAndReportPipeError(errors: any[]) {
    return catchError((err) => {
      errors[errors.length] = err as string;
      return [];
    });
  }
}
