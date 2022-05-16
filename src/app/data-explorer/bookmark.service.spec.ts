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
import { Bookmark, BookmarkService, UserPreferences } from './bookmark.service';
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

  const userDetails = { id: 'userId' } as UserDetails;
  securityServiceStub.getSignedInUser.mockReturnValue(userDetails);

  const b1 = { id: '1', label: 'label-1' } as Bookmark;
  const b2 = { id: '2', label: 'label-2' } as Bookmark;
  const userBookmarks: Bookmark[] = [b1, b2];

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

  describe('index', () => {
    beforeEach(() => {
      endpointsStub.catalogueUser.userPreferences.mockClear();
    });
    it('should throw an error if the user is not logged in', () => {
      const expected$ = cold('#');
      securityServiceStub.getSignedInUser.mockReturnValueOnce(null);

      const actual$ = service.index();

      expect(actual$).toBeObservable(expected$);
    });

    it('should return an empty array if there is no response body', () => {
      const expected$ = cold('--a', { a: [] });
      endpointsStub.catalogueUser.userPreferences.mockImplementationOnce(() => {
        return cold('--a', { a: {} });
      });

      const actual$ = service.index();

      expect(actual$).toBeObservable(expected$);
      expect(endpointsStub.catalogueUser.userPreferences).toHaveBeenCalledWith(
        userDetails.id
      );
    });

    it('should return an empty array if there is no bookmarks property in the response body', () => {
      const expected$ = cold('--a', { a: [] });
      endpointsStub.catalogueUser.userPreferences.mockImplementationOnce(() => {
        return cold('--a', { a: { body: {} } });
      });

      const actual$ = service.index();

      expect(actual$).toBeObservable(expected$);
      expect(endpointsStub.catalogueUser.userPreferences).toHaveBeenCalledWith(
        userDetails.id
      );
    });

    it('should return the bookmarks property if it exists', () => {
      const expected$ = cold('-a', { a: userBookmarks });
      const spy = jest.spyOn(endpointsStub.catalogueUser, 'userPreferences');
      endpointsStub.catalogueUser.userPreferences.mockImplementationOnce(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarks } } });
      });

      const actual$ = service.index();

      expect(actual$).toBeObservable(expected$);
      expect(spy).toHaveBeenCalledWith(userDetails.id);
    });
  });

  describe('add', () => {
    beforeEach(() => {
      endpointsStub.catalogueUser.userPreferences.mockReset();
      endpointsStub.catalogueUser.updateUserPreferences.mockClear();
    });
    it('should not add the bookmark if element is already bookmarked', () => {
      const bookmarkToAdd = b1;
      const userPrefsAfter: UserPreferences = { bookmarks: userBookmarks };

      const expected$ = cold('---a', { a: userBookmarks });
      const saveSpy = jest.spyOn(endpointsStub.catalogueUser, 'updateUserPreferences');

      endpointsStub.catalogueUser.userPreferences.mockImplementation(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarks } } });
      });

      endpointsStub.catalogueUser.updateUserPreferences.mockImplementationOnce(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarks } } });
      });

      const actual$ = service.add(bookmarkToAdd);

      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(saveSpy).toHaveBeenCalledWith(userDetails.id, userPrefsAfter);
      });
    });

    it('should add the bookmark if element is not already bookmarked', () => {
      const bookmarkToAdd = b2;
      const userBookmarksBefore = [b1];
      const userBookmarksAfter = [b1, b2];
      const userPrefsBefore: UserPreferences = { bookmarks: userBookmarksBefore };
      const userPrefsAfter: UserPreferences = { bookmarks: userBookmarksAfter };

      const expected$ = cold('---a', { a: userBookmarksAfter });
      const saveSpy = jest.spyOn(endpointsStub.catalogueUser, 'updateUserPreferences');

      endpointsStub.catalogueUser.userPreferences
        .mockImplementationOnce(() => {
          return cold('-a', { a: { body: userPrefsBefore } });
        })
        .mockImplementationOnce(() => {
          return cold('-a', { a: { body: userPrefsBefore } });
        });

      endpointsStub.catalogueUser.updateUserPreferences.mockImplementationOnce(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarksAfter } } });
      });

      const actual$ = service.add(bookmarkToAdd);

      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(saveSpy).toHaveBeenCalledWith(userDetails.id, userPrefsAfter);
      });
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      endpointsStub.catalogueUser.userPreferences.mockReset();
      endpointsStub.catalogueUser.updateUserPreferences.mockClear();
    });

    it('should not do anything if the supplied item is not in the users bookmarks', () => {
      const bookmarkToRemove = { id: '3', label: 'not-in' } as Bookmark;
      const userPrefsAfter: UserPreferences = { bookmarks: userBookmarks };

      const expected$ = cold('---a', { a: userBookmarks });
      const saveSpy = jest.spyOn(endpointsStub.catalogueUser, 'updateUserPreferences');

      endpointsStub.catalogueUser.userPreferences.mockImplementation(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarks } } });
      });

      endpointsStub.catalogueUser.updateUserPreferences.mockImplementationOnce(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarks } } });
      });

      const actual$ = service.remove([bookmarkToRemove]);

      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(saveSpy).toHaveBeenCalledWith(userDetails.id, userPrefsAfter);
      });
    });

    it('should remove the supplied item if it exists in the users bookmarks', () => {
      const bookmarkToRemove = b2;
      const userBookmarksBefore = [b1, b2];
      const userBookmarksAfter = [b1];
      const userPrefsBefore: UserPreferences = { bookmarks: userBookmarksBefore };
      const userPrefsAfter: UserPreferences = { bookmarks: userBookmarksAfter };

      const expected$ = cold('---a', { a: userBookmarksAfter });
      const saveSpy = jest.spyOn(endpointsStub.catalogueUser, 'updateUserPreferences');

      endpointsStub.catalogueUser.userPreferences
        .mockImplementationOnce(() => {
          return cold('-a', { a: { body: userPrefsBefore } });
        })
        .mockImplementationOnce(() => {
          return cold('-a', { a: { body: userPrefsBefore } });
        });

      endpointsStub.catalogueUser.updateUserPreferences.mockImplementationOnce(() => {
        return cold('-a', { a: { body: { bookmarks: userBookmarksAfter } } });
      });

      const actual$ = service.remove([bookmarkToRemove]);

      expect(actual$).toBeObservable(expected$);
      expect(actual$).toSatisfyOnFlush(() => {
        expect(saveSpy).toHaveBeenCalledWith(userDetails.id, userPrefsAfter);
      });
    });
  });

  describe('isBookmarked', () => {
    beforeEach(() => {
      endpointsStub.catalogueUser.userPreferences.mockReset();
    });
    it.each([true, false])(
      'should return %p if the user has bookmarked the supplied data element',
      (isBookmarked) => {
        const dataElementToCheck = b2 as DataElementBasic;
        const dataElementToCheckId = dataElementToCheck.id;
        const bookmarksDoesContain = [b1, b2];
        const bookmarksDoesNotContain = [b1];
        const expected$ = cold('--a', { a: isBookmarked });

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

    it('should return false if given the empty string', () => {
      const expected$ = cold('--a', { a: false });
      securityServiceStub.getSignedInUser.mockImplementationOnce(() => {
        return { id: 'user-id' } as UserDetails;
      });
      endpointsStub.catalogueUser.userPreferences.mockImplementationOnce(() => {
        return cold('--a', { a: { body: { bookmarks: userBookmarks } } });
      });

      const actual$ = service.isBookmarked('');

      expect(actual$).toBeObservable(expected$);
    });
  });
});
