import { SortOrder } from '../data-explorer/data-explorer.types';

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
export class Sort {
  static ascString(a: string, b: string): number {
    return a > b ? 1 : b > a ? -1 : 0;
  }

  static descString(a: string, b: string): number {
    return a > b ? -1 : b > a ? 1 : 0;
  }

  /**
   * Compare two objects by string property.
   *
   * @param a The first object.
   * @param b The second object.
   * @param property The name of the property to sort by.
   * @param order The sort order.
   * @returns A numeric value that can used to determine if a is less than, greater than, or equal to b.
   */
  static compareByString(a: any, b: any, property: string, order: SortOrder): number {
    return order === 'desc'
      ? this.descString(a[property] as string, b[property] as string)
      : this.ascString(a[property] as string, b[property] as string);
  }

  /**
   * Splits a string into the sort parameters it represents.
   *
   * @param value A string value in the format "{property}-{order}" e.g. "label-desc".
   * @returns A tuple containing the property name, then the sort order.
   */
  static defineSortParams(value: string): [string, SortOrder] {
    const parts = value.split('-');
    const sort = parts[0];
    const order = parts[1] as SortOrder;
    return [sort, order];
  }
}
