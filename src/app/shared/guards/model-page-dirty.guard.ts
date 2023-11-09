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
import {
  ActivatedRouteSnapshot,
  CanDeactivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { IModelPage } from '../types/shared.types';

/**
 * Router guard to ensure that a component can be deactivated without losing any uncommitted data changes.
 *
 * Add this to the `canDeactivate` list in a {@link Route}.
 *
 * For this guard to work, the component the route is for must also implement the {@link IModelPage} interface.
 */
@Injectable({
  providedIn: 'root',
})
export class ModelPageDirtyGuard implements CanDeactivate<IModelPage> {
  canDeactivate(
    component: IModelPage,
    _currentRoute: ActivatedRouteSnapshot,
    _currentState: RouterStateSnapshot,
    _nextState?: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isDirty = component.isDirty();
    if (isDirty) {
      const response = confirm(
        'There are unsaved changes, are you sure you want to leave?',
      );
      return response;
    }

    return true;
  }
}
