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
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IModelPage } from '../types/shared.types';

import { ModelPageDirtyGuard } from './model-page-dirty.guard';

describe('ModelPageDirtyGuard', () => {
  let guard: ModelPageDirtyGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(ModelPageDirtyGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow deactivation when page is not dirty', () => {
    const component: IModelPage = {
      isDirty: () => false,
    };

    const actual = guard.canDeactivate(
      component,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    );
    expect(actual).toBeTruthy();
  });

  it('should allow deactivation when page is dirty and user has confirmed', () => {
    const component: IModelPage = {
      isDirty: () => true,
    };

    jest.spyOn(global, 'confirm').mockReturnValueOnce(true);

    const actual = guard.canDeactivate(
      component,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    );
    expect(actual).toBeTruthy();
  });

  it('should not allow deactivation when page is dirty and user has cancelled', () => {
    const component: IModelPage = {
      isDirty: () => true,
    };

    jest.spyOn(global, 'confirm').mockReturnValueOnce(false);

    const actual = guard.canDeactivate(
      component,
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot,
      {} as RouterStateSnapshot,
    );
    expect(actual).toBeFalsy();
  });
});
