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
import { ComponentType } from 'ngx-toastr';
import { Observable } from 'rxjs';

export type MatDialogRefCloseFn<R = any> = (dialogResult?: R) => void;

export interface MatDialogRefStub<R = any> {
  close: jest.MockedFunction<MatDialogRefCloseFn<R>>;
}

export type MatDialogOpenedAfterClosedFn<R = any> = () => Observable<R | undefined>;

export interface MatDialogOpenedStub<R = any> {
  afterClosed: jest.MockedFunction<MatDialogOpenedAfterClosedFn<R>>;
}

export type MatDialogOpenFn<T> = (component: ComponentType<T>) => MatDialogOpenedStub;

export interface MatDialogStub<T, R = any> {
  /**
   * Use this to access the inner {@link MatDialogOpenedStub} to mock implement
   * the `afterClosed()` functions.
   */
  usage: MatDialogOpenedStub<R>;
  open: MatDialogOpenFn<T>;
}

export const createMatDialogRefStub = <R = any>(): MatDialogRefStub<R> => {
  return {
    close: jest.fn() as jest.MockedFunction<MatDialogRefCloseFn<R>>,
  };
};

/**
 * Create a stub for mocking a {@link MatDialog}.
 *
 * @returns A {@link MatDialogStub} object with the mocks.
 *
 * To create the mock implementations, use the {@link usage} object to affect the
 * returned mock from the {@link open()} function.
 *
 * @example
 *
 * ```ts
 * // Create the overall dialog stub to add to the TestMed module
 * const dialogStub = createMatDialogStub();
 *
 * // In tests, add mock implementations to the afterClosed() mock to affect
 * // what the dialog should return in each test scenario
 * dialogStub.usage.afterClosed.mockImplementationOnce(() => {
 *   return of({ status: 'ok' })
 * })
 * ```
 */
export const createMatDialogStub = <T, R = any>(): MatDialogStub<T, R> => {
  const usage: MatDialogOpenedStub<R> = {
    afterClosed: jest.fn() as jest.MockedFunction<MatDialogOpenedAfterClosedFn<R>>,
  };

  return {
    usage,
    open: () => {
      return usage;
    },
  };
};
