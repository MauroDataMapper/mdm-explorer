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
import { setupTestModuleForService } from '../testing/testing.helpers';
import { Bookmark, BookmarkService } from './bookmark.service';
import { of } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { createSecurityServiceStub } from '../testing/stubs/security.stub';
import { SecurityService } from '../security/security.service';
import { DataElementBasic } from './data-explorer.types';
import { UserDetails } from '../security/user-details.service';
import { cold } from 'jest-marbles';

describe('BookmarkService', () => {
  let service: BookmarkService;
  const endpointsStub = createMdmEndpointsStub();
  const securityServiceStub = createSecurityServiceStub();

  const b1 = { id: '1', label: 'label-1' } as Bookmark;
  const b2 = { id: '2', label: 'label-2' } as Bookmark;

  beforeEach(() => {
    // Default endpoint call
    endpointsStub.apiProperties.listPublic.mockImplementationOnce(() => of([]));

    service = setupTestModuleForService(BookmarkService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
        {
          provide: SecurityService,
          useValue: securityServiceStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('add', () => {
    test.todo(
      'should create a userPrefs object with a bookmarks property and add the bookmark to it if either of the former do not exist'
    );
    test.todo('should not add the bookmark if element is already bookmarked');
    test.todo('should add the bookmark if element is not already bookmarked');
  });

  describe('remove', () => {
    test.todo(
      'should not do anything if the supplied item is already in the users bookmarks'
    );
    test.todo('should remove the supplied item if it exists in the users bookmarks');
  });

  describe('index', () => {
    test.todo('should throw an error if the user is not logged in');
    test.todo('should return an empty array if there is no response body');
    test.todo(
      'should return an empty array if there is bookmarks property in the response body'
    );
  });

  describe('isBookmarked', () => {
    it.each([true, false])(
      'should return %p if the user has bookmarked the supplied data element',
      (isBookmarked) => {
        const dataElementToCheck = b2 as DataElementBasic;
        const dataElementToCheckId = dataElementToCheck.id;
        const bookmarksDoesContain = [b1, b2];
        const bookmarksDoesNotContain = [b1];
        const expected$ = cold('--a', { a: isBookmarked ? true : false });

        securityServiceStub.getSignedInUser.mockImplementationOnce(() => {
          return { id: 'user-id' } as UserDetails;
        });

        endpointsStub.catalogueUser.userPreferences.mockImplementationOnce(() => {
          return isBookmarked
            ? cold('--a', { a: { body: { bookmarks: bookmarksDoesContain } } })
            : cold('--a', { a: { body: { bookmarks: bookmarksDoesNotContain } } });
        });

        const actual$ = service.isBookmarked(dataElementToCheckId);

        expect(actual$).toBeObservable(expected$);
      }
    );
  });
});
