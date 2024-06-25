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
import { FileProperties, ISubmissionState } from '../type-declarations/submission.resource';

@Injectable({
  providedIn: 'root',
})
export class SubmissionStateService {
  private _state: ISubmissionState;

  constructor() {
    this._state = {} as ISubmissionState;
  }

  get(): ISubmissionState {
    return { ...this._state };
  }

  /**
   * @description Set the fields in the state object that match the properties in newState. For example,
   * if the state object is { a: 1, b: 2 } and newState is { b: 3 }, the state object will
   * be updated to { a: 1, b: 3 }.
   * @param newState - The new state to set
   */
  set(newState: Partial<ISubmissionState>): void {
    this._state = { ...this._state, ...newState };
  }

  getStepInputFromShape(
    inputShape: (keyof Partial<ISubmissionState>)[]
  ): Partial<ISubmissionState> {
    return inputShape.reduce((acc, key) => {
      if (this._state[key] !== undefined) {
        acc[key] = this._state[key] as string & FileProperties & boolean;
      }
      return acc;
    }, {} as Partial<ISubmissionState>);
  }
}
