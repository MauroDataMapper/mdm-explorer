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
import { Router, UrlTree } from '@angular/router';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { KnownRouterPath, StateRouterService } from './state-router.service';

interface RouterStub {
  navigate: jest.Mock;
  navigateByUrl: jest.Mock;
  createUrlTree: jest.Mock;
}

describe('StateRouterService', () => {
  let service: StateRouterService;

  const routerStub: RouterStub = {
    navigate: jest.fn(),
    navigateByUrl: jest.fn(),
    createUrlTree: jest.fn(),
  };

  beforeEach(() => {
    service = setupTestModuleForService(StateRouterService, {
      providers: [
        {
          provide: Router,
          useValue: routerStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it.each([
    [['/home'], undefined],
    [['/user', 123], undefined],
    [['/search'], { search: 'test', page: 2 }],
  ])('should navigate to a new URL', (fragments, queryParams) => {
    service.navigateTo(fragments, queryParams);
    expect(routerStub.navigate).toHaveBeenCalledWith(fragments, { queryParams });
  });

  it.each<KnownRouterPath>(['/home', '/sign-in', '/search'])(
    'should navigate to known path %p',
    (path) => {
      const expectedUrlTree: UrlTree = {
        fragment: path,
        queryParams: {},
      } as UrlTree;

      routerStub.createUrlTree.mockImplementationOnce(() => expectedUrlTree);

      service.navigateToKnownPath(path);
      expect(routerStub.navigateByUrl).toHaveBeenCalledWith(expectedUrlTree);
    }
  );

  it('should navigate to "not found" route', () => {
    service.navigateToNotFound();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/not-found'], {
      skipLocationChange: true,
    });
  });
});
