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
import { Params, Router } from '@angular/router';

/**
 * Definition of known page router paths.
 *
 * Keep this up to date with the paths defined in your route declarations.
 */
export type KnownRouterPath =
  | ''
  | '/home'
  | '/sign-in'
  | '/forgot-password'
  | '/browse'
  | '/search'
  | '/search/listing';

/**
 * Wrapper service around the {@link Router} from `@angular/router` package.
 */
@Injectable({
  providedIn: 'root',
})
export class StateRouterService {
  constructor(private router: Router) {}

  /**
   * Navigate to a route.
   *
   * @param fragments The fragments to make up the route.
   * @param queryParams Optional query parameters to include in the URL.
   * @returns A Promise that resolves to true when navigation succeeds, to false when navigation fails, or is rejected on error.
   */
  navigateTo(fragments: any[], queryParams?: Params) {
    return this.router.navigate(fragments, { queryParams });
  }

  /**
   * Navigate to a known route path.
   *
   * @param path The specific path to navigate to.
   * @param queryParams Optional query parameters to include in the URL.
   * @returns A Promise that resolves to true when navigation succeeds, to false when navigation fails, or is rejected on error.
   */
  navigateToKnownPath(path: KnownRouterPath, queryParams?: Params) {
    const url = this.router.createUrlTree([path], { queryParams });
    return this.router.navigateByUrl(url);
  }

  /**
   * Navigate to the app's "Not Found" route.
   *
   * @returns A Promise that resolves to true when navigation succeeds, to false when navigation fails, or is rejected on error.
   */
  navigateToNotFound() {
    // Redirect to page but without updating the URL, so that the user can
    // see the incorrect URL still in the browser
    return this.router.navigate(['/not-found'], { skipLocationChange: true });
  }
}
