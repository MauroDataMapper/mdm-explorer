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
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
  Branchable,
  CatalogueItem,
  Modelable,
  SecurableModel,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs/internal/Observable';
import { filter, map, mergeMap } from 'rxjs/operators';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogConfig,
  DialogResult,
} from '../confirmation-dialog.component';
import { DialogStatus } from '../constants/dialog-status';

declare module '@angular/material/dialog/dialog' {
  interface MatDialog {
    /**
     * Extension method to open a modal dialog containing the `ConfirmationDialogComponent`.
     *
     * @param config The dialog configuration to supply.
     * @returns Reference to the newly opened dialog.
     *
     * A complete `ModalDialogRef` object is returned to handle specific dialog actions. If requiring simpler
     * confirmation dialogs, consider using `openConfirmationAsync()` instead.
     *
     * @see `ConfirmationDialogComponent`
     * @see `ConfirmationDialogConfig`
     * @see `ConfirmationDialogResult`
     */
    openConfirmation(
      config: MatDialogConfig<ConfirmationDialogConfig>
    ): MatDialogRef<ConfirmationDialogComponent, DialogResult>;

    /**
     * Extension method to open a modal dialog containing the `ConfirmationDialogComponent` and asynchronously
     * return the success result.
     *
     * @param config The dialog configuration to supply.
     * @returns An `Observable<void>` to subscribe to for acting when the user clicks "OK".
     *
     * An observable is returned so that the actions to perform after selecting "OK" can be carried out when ready. In the case
     * when the dialog is cancelled, these actions will not be carried out.
     *
     * @example
     *
     * ```ts
     * dialog.openConfirmationAsync(config)
     *  .subscribe(() => {
     *    // Clicked 'OK', do something here...
     *  })
     * ```
     *
     * @see `openConfirmation()`
     * @see `openDoubleConfirmationAsync()`
     */
    openConfirmationAsync(
      config: MatDialogConfig<ConfirmationDialogConfig>
    ): Observable<void>;

    /**
     * Extension method to open two modal dialogs in succession containing the `ConfirmationDialogComponent` and asynchronously
     * return the success result. This is usually used for deletion scenarios to be sure the user wants something to
     * happen.
     *
     * @param firstConfig The dialog configuration to supply to the first dialog.
     * @param finalConfig The dialog configuration to suppy to the final dialog.
     * @returns An `Observable<void>` to subscribe to for acting when the user clicks "OK" to both dialogs.
     *
     * An observable is returned so that the actions to perform after selecting "OK" can be carried out when ready. In the case
     * when the dialog is cancelled, these actions will not be carried out.
     *
     * @example
     *
     * ```ts
     * dialog.openDoubleConfirmationAsync(config1, config2)
     *  .subscribe(() => {
     *    // Clicked 'OK', do something here...
     *  })
     * ```
     *
     * @see `openConfirmation()`
     * @see `openConfirmationAsync()`
     */
    openDoubleConfirmationAsync(
      firstConfig: MatDialogConfig<ConfirmationDialogConfig>,
      finalConfig: MatDialogConfig<ConfirmationDialogConfig>
    ): Observable<void>;
  }
}

MatDialog.prototype.openConfirmationAsync = function (
  this: MatDialog,
  config: MatDialogConfig<ConfirmationDialogConfig>
): Observable<void> {
  return this.openConfirmation(config)
    .afterClosed()
    .pipe(
      filter((result) => (result?.status ?? DialogStatus.Close) === DialogStatus.Ok),
      map(() => {})
    );
};

MatDialog.prototype.openDoubleConfirmationAsync = function (
  this: MatDialog,
  firstConfig: MatDialogConfig<ConfirmationDialogConfig>,
  finalConfig: MatDialogConfig<ConfirmationDialogConfig>
): Observable<void> {
  return this.openConfirmation(firstConfig)
    .afterClosed()
    .pipe(
      filter((result) => (result?.status ?? DialogStatus.Close) === DialogStatus.Ok),
      mergeMap(() => {
        return this.openConfirmation(finalConfig)
          .afterClosed()
          .pipe(
            filter((result2) => result2!.status === DialogStatus.Ok),
            map(() => {})
          );
      })
    );
};
