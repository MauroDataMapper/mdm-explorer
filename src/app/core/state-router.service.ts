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
import { Injectable } from '@angular/core';
import { RawParams, TransitionOptions, UIRouter } from '@uirouter/angular';

/**
 * Definition of known page router state names.
 *
 * Keep this up to date with the state names defined in your UIRouter state declarations.
 */
export type KnownRouterState =
  | 'app.container.default'
  | 'app.container.home'
  | 'app.container.signin'
  | 'app.container.forgot-password'
  | 'app.container.browse'
  | 'app.container.search-results';

/**
 * Wrapper service around the {@link UIRouter} from `@ui-router/angular` package.
 */
@Injectable({
  providedIn: 'root',
})
export class StateRouterService {
  constructor(private router: UIRouter) {}

  /**
   * Transition to a new state in the application i.e. "navigate" to a new view.
   *
   * @param name The name of the state to transition to.
   * @param params The parameters to use when transitioning state.
   * @param options Any options for the state transition.
   * @returns A {@link TransitionPromise} representing the state of the new transition.
   */
  transition(name: string, params?: RawParams, options?: TransitionOptions) {
    return this.router.stateService.go(name, params, options);
  }

  /**
   * Transition to a known state in the application i.e. "navigate" to a new view.
   *
   * @param name The name of the state to transition to.
   * @param params The parameters to use when transitioning state.
   * @param options Any options for the state transition.
   * @returns A {@link TransitionPromise} representing the state of the new transition.
   * @see {@link transition}
   */
  transitionTo(name: KnownRouterState, params?: RawParams, options?: TransitionOptions) {
    return this.transition(name, params, options);
  }
}
