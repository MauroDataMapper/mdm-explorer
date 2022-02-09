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
import { TransitionOptions, UIRouter } from '@uirouter/angular';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { KnownRouterState, StateRouterService } from './state-router.service';

interface StateServiceStub {
  go: jest.Mock;
}

interface UIRouterStub {
  stateService: StateServiceStub;
}

describe('StateRouterService', () => {
  let service: StateRouterService;

  const uiRouterStub: UIRouterStub = {
    stateService: {
      go: jest.fn()
    }
  };

  beforeEach(() => {
    service = setupTestModuleForService(
      StateRouterService,
      {
        providers: [
          {
            provide: UIRouter,
            useValue: uiRouterStub
          }
        ]
      });
  });

  afterEach(() => {
    uiRouterStub.stateService.go.mockClear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should transition to a new state', () => {
    const expectedState = 'next';
    const expectedParams = { id: 42 };
    const expectedOptions: TransitionOptions = { reload: true };

    service.transition(expectedState, expectedParams, expectedOptions);

    expect(uiRouterStub.stateService.go).toHaveBeenCalledWith(expectedState, expectedParams, expectedOptions);
  });

  it.each<KnownRouterState>([
    'app.container.default',
    'app.container.home',
    'app.container.signin'
  ])('should transition to known router state %p', (expected) => {
    service.transitionTo(expected);
    expect(uiRouterStub.stateService.go).toHaveBeenCalledWith(expected, undefined, undefined);
  });
});
