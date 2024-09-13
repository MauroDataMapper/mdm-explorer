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
import { ISubmissionState } from '../../../data-explorer/specification-submission/type-declarations/submission.resource';

export type StateServiceSetFn = (state: Partial<ISubmissionState>) => void;
export type StateServiceSetMockedFn = jest.MockedFunction<StateServiceSetFn>;

export type StateServiceGetFn = () => ISubmissionState;
export type StateServiceGetMockedFn = jest.MockedFunction<StateServiceGetFn>;

export type StateServiceGetStepInputFromShapeFn = (
  shape: (keyof ISubmissionState)[]
) => Partial<ISubmissionState>;
export type StateServiceGetStepInputFromShapeMockedFn =
  jest.MockedFunction<StateServiceGetStepInputFromShapeFn>;

export type StateServiceClearFn = () => void;
export type StateServiceClearMockedFn = jest.MockedFunction<StateServiceClearFn>;

export interface StateServiceStub {
  set: StateServiceSetMockedFn;
  get: StateServiceGetMockedFn;
  clear: StateServiceClearMockedFn;
  getStepInputFromShape: StateServiceGetStepInputFromShapeMockedFn;
}

export const createStateServiceStub = (): StateServiceStub => {
  return {
    set: jest.fn() as StateServiceSetMockedFn,
    get: jest.fn() as StateServiceGetMockedFn,
    clear: jest.fn() as StateServiceClearMockedFn,
    getStepInputFromShape: jest.fn() as StateServiceGetStepInputFromShapeMockedFn,
  };
};
