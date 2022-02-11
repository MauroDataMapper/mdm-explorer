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
import { RawParams, TransitionOptions } from '@uirouter/angular';
import { KnownRouterState } from 'src/app/core/state-router.service';

export type TransitionFn = (name: string, params?: RawParams, options?: TransitionOptions) => any;
export type TransitionMockedFn = jest.MockedFunction<TransitionFn>;

export type TransitionToFn = (name: KnownRouterState, params?: RawParams, options?: TransitionOptions) => any;
export type TransitionToMockedFn = jest.MockedFunction<TransitionToFn>;

export interface StateRouterServiceStub {
  transition: TransitionMockedFn;
  transitionTo: TransitionToMockedFn;
}

export const createStateRouterStub = (): StateRouterServiceStub => {
  return {
    transition: jest.fn() as TransitionMockedFn,
    transitionTo: jest.fn() as TransitionToMockedFn
  };
};
