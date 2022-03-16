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
import {
  HookResult,
  Ng2StateDeclaration,
  Transition,
  TransitionService,
  UIRouter,
} from '@uirouter/angular';
import { AppComponent } from './app.component';
import { AppContainerComponent } from './views/app-container/app-container.component';
import { BookmarkComponent } from './pages/bookmark/bookmark.component';
import { states as pageStates } from './pages/pages.routes';
import { states as errorStates } from './error/error.routes';
import { SecurityService } from './security/security.service';
import { OpenIdConnectAuthorizeComponent } from './security/open-id-connect-authorize/open-id-connect-authorize.component';
import { HomeComponent } from './pages/home/home.component';

const appStates: Ng2StateDeclaration[] = [
  {
    name: 'app',
    component: AppComponent,
  },
  {
    name: 'app.container',
    component: AppContainerComponent,
  },
  {
    name: 'app.container.default',
    component: HomeComponent,
    data: { allowAnonymous: true },
  },
  {
    name: 'app.container.open-id-connect-authorizing',
    url: '/open-id-connect/authorize',
    component: OpenIdConnectAuthorizeComponent,
    data: { allowAnonymous: true },
  },
  {
    name: 'app.container.bookmark',
    url: '/bookmark',
    component: BookmarkComponent,
  },
];

/**
 * Collection of all app state routes.
 *
 * To allow anonymous access to a route, add `allowAnonymous: true` to the `data` of a state:
 *
 * @example
 *
 * ```ts
 * states: [
 *  {
 *    name: 'appContainer.mainApp.public',
 *    component: PublicComponent,
 *    url: '/public',
 *    data: {
 *      allowAnonymous: true
 *    }
 *  }
 * ]
 * ```
 */
export const states: Ng2StateDeclaration[] = [
  ...appStates,
  ...pageStates,
  ...errorStates,
];

/**
 * Router transition hooks for checking authorization before switching views.
 */
const authorizationTransitionHooks = (transitions: TransitionService) => {
  /**
   * Before starting a transition, check if the user/role has access to this route.
   */
  const canAccessRoute = (transition: Transition): HookResult => {
    const security = transition.injector().get<SecurityService>(SecurityService);
    const state = transition.$to();

    if (state.data?.allowAnonymous) {
      return true;
    }

    return security.isSignedIn();
  };

  transitions.onStart({}, canAccessRoute);
};

/**
 * Customised UIRouter configuration, including setup of transition hooks.
 */
export const uiRouterConfigFn = (router: UIRouter) => {
  const transitions = router.transitionService;
  authorizationTransitionHooks(transitions);
};
