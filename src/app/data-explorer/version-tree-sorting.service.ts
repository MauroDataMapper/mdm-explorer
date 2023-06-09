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

import { Injectable } from '@angular/core';
import { SimpleModelVersionTree } from '@maurodatamapper/mdm-resources';
import { VersionOption } from './version-selector/version-selector.component';

@Injectable({
  providedIn: 'root',
})
export class VersionTreeSortingService {
  constructor() {}

  /**
   * Sorts the version tree by version number. In a {@link SimpleModelVersionTree}
   * the model version is optional. It will only be present on finalised models.
   * This function will not sort undefined model versions.
   * At this moment that is acceptable because this only will run when the data specification
   * is submitted. At that point the model version will be defined.
   *
   * @returns A function that can be used to sort the version tree.
   */
  public compareModelVersion =
    () => (a: SimpleModelVersionTree, b: SimpleModelVersionTree) => {
      // Order ascending when not undefined
      if (!a.modelVersion || !b.modelVersion) {
        return 0;
      }

      // Split into parts
      const aParts = a.modelVersion.split('.');
      const bParts = b.modelVersion.split('.');

      return this.orderParts(aParts, bParts);
    };

  /**
   * Sorts version options by display name.
   *
   * @returns A function that can be used to sort the version options.
   */
  public compareVersionOptions = () => (a: VersionOption, b: VersionOption) => {
    // Order ascending
    // Split into parts
    const aParts = a.displayName.replace('V', '').split('.');
    const bParts = b.displayName.replace('V', '').split('.');

    return this.orderParts(aParts, bParts);
  };

  private orderParts(aParts: string[], bParts: string[]): number {
    // Compare each part
    for (let i = 0; i < aParts.length; i++) {
      if (+aParts[i] > +bParts[i]) {
        return 1;
      }
      if (+aParts[i] < +bParts[i]) {
        return -1;
      }
    }

    // All parts are equal
    return 0;
  }
}
