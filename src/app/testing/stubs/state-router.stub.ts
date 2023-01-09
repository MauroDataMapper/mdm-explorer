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
import { Params } from '@angular/router';
import { KnownRouterPath } from 'src/app/core/state-router.service';

export type StateRouterNavigateToFn = (
  fragments: any[],
  queryParams?: Params
) => Promise<boolean>;
export type StateRouterNavigateToKnownPathFn = (
  path: KnownRouterPath,
  queryParams?: Params
) => Promise<boolean>;
export type StateRouterNavigateToNotFoundFn = () => Promise<boolean>;

export interface StateRouterServiceStub {
  navigateTo: jest.MockedFunction<StateRouterNavigateToFn>;
  navigateToKnownPath: jest.MockedFunction<StateRouterNavigateToKnownPathFn>;
  navigateToNotFound: jest.MockedFunction<StateRouterNavigateToNotFoundFn>;
}

export const createStateRouterStub = (): StateRouterServiceStub => {
  return {
    navigateTo: jest.fn() as jest.MockedFunction<StateRouterNavigateToFn>,
    navigateToKnownPath:
      jest.fn() as jest.MockedFunction<StateRouterNavigateToKnownPathFn>,
    navigateToNotFound: jest.fn() as jest.MockedFunction<StateRouterNavigateToNotFoundFn>,
  };
};
