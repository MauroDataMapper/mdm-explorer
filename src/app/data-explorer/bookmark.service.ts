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
import { MdmResponse } from '@maurodatamapper/mdm-resources';
import { map, switchMap, Observable, throwError, of } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { SecurityService } from '../security/security.service';
import { BookmarkDto, DataElementSearchResult } from './data-explorer.types';

@Injectable({
  providedIn: 'root',
})

/**
 * Service to handle the persistence of bookmarks via User Preferences
 */
export class BookmarkService {
  constructor(
    private endpoints: MdmEndpointsService,
    private security: SecurityService
  ) {}

  /**
   * Add the provided bookmark to the users list of bookmarks if it doesn't already contain it.
   *
   * @param bookmark the bookmark to be added.
   * @returns the users bookmarks after the addition.
   */
  public add(bookmark: DataElementSearchResult): Observable<DataElementSearchResult[]> {
    bookmark.isBookmarked = true;
    return this.index().pipe(
      switchMap((userBookmarks: DataElementSearchResult[]) => {
        if (!userBookmarks.some((bm) => bm.id === bookmark.id)) {
          userBookmarks.push(bookmark);
        }
        return this.save(userBookmarks);
      })
    );
  }

  /**
   * Remove a Bookmark from the list of bookmarks stored in User Preferences.
   *
   * @param bookmarks DataElementSearchResult[]
   * @returns the users bookmarks after the removal.
   */
  public remove(
    bookmarks: DataElementSearchResult[]
  ): Observable<DataElementSearchResult[]> {
    const idsToRemove = bookmarks.map((bookmark) => bookmark.id);
    return this.index().pipe(
      switchMap((userBookmarks: DataElementSearchResult[]) => {
        const filteredBookmarks = userBookmarks.filter(
          (bm) => !idsToRemove.includes(bm.id)
        );
        return this.save(filteredBookmarks);
      })
    );
  }

  /**
   * Get the index of bookmarks from User Preferences
   *
   * @returns - an observable containing a list of bookmarks
   */
  public index(): Observable<DataElementSearchResult[]> {
    const userDetails = this.security.getSignedInUser();
    return userDetails
      ? this.getBookmarksFromUserPreferences(userDetails.id)
      : throwError(() => new Error('Must be logged in to use User Preferences'));
  }

  /**
   *
   * @param dataElementId the dataElementId to check against
   * @returns a boolean indicating whether or not the element is bookmarked by the signed in user
   */
  public isBookmarked(dataElementId: string): Observable<boolean> {
    return this.index().pipe(
      switchMap((userBookmarks: DataElementSearchResult[]) => {
        return of(userBookmarks.some((bookmark) => bookmark.id === dataElementId));
      })
    );
  }

  /**
   * Replaces the current bookmarks with the newly supplied bookmarks.
   *
   * @param bookmarks the array of bookmarks to replace the existing bookmarks
   */
  private save(
    bookmarks: DataElementSearchResult[]
  ): Observable<DataElementSearchResult[]> {
    const userDetails = this.security.getSignedInUser();
    if (userDetails) {
      return this.getPreferences(userDetails.id).pipe(
        switchMap((data: UserPreferences) => {
          if (!data) data = {};

          data.bookmarks = bookmarks;
          return this.savePreferences(userDetails.id, data);
        }),
        switchMap((userPrefs: UserPreferences) => {
          return of(userPrefs.bookmarks ?? []);
        })
      );
    } else {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }
  }

  /**
   * Get the bookmarks property from the user preferences.
   *
   * @param userId
   * @returns just the bookmarks property on userPreferences, or [] if there is no such property.
   */
  private getBookmarksFromUserPreferences(
    userId: string
  ): Observable<DataElementSearchResult[]> {
    return this.getPreferences(userId).pipe(
      map((data: UserPreferences) => (data && data.bookmarks ? data.bookmarks : []))
    );
  }

  /**
   *
   * @param userId
   * @returns the full userPrefs object associated with the given userId
   */
  private getPreferences(userId: string): Observable<UserPreferences> {
    return this.endpoints.catalogueUser.userPreferences(userId).pipe(
      map((response: MdmResponse<UserPreferencesDto>) => {
        if (response.body && response.body.bookmarks) {
          response.body.bookmarks = response.body.bookmarks.map(
            (nativeBookmark: BookmarkDto) => {
              return {
                id: nativeBookmark.id,
                dataClass: nativeBookmark.dataClassId,
                model: nativeBookmark.dataModelId,
                label: nativeBookmark.label,
                breadcrumbs: nativeBookmark.breadcrumbs,
              };
            }
          );
        }
        return response.body;
      })
    );
  }

  /**
   *
   * @param userId
   * @param data the new userPreferences object
   * @returns the newly saved userPreferences object
   */
  private savePreferences(userId: string, data: any): Observable<UserPreferences> {
    const payload: UserPreferencesDto = {
      bookmarks: [],
    };
    payload.bookmarks = data.bookmarks.map((bookmark: DataElementSearchResult) => {
      return {
        id: bookmark.id,
        dataClassId: bookmark.dataClass,
        dataModelId: bookmark.model,
        label: bookmark.label,
        breadcrumbs: bookmark.breadcrumbs,
      };
    });
    return this.endpoints.catalogueUser
      .updateUserPreferences(userId, payload)
      .pipe(map((response: any) => response.body));
  }
}

export interface UserPreferencesDto {
  [key: string]: any;
  bookmarks?: BookmarkDto[];
}

export interface UserPreferences {
  [key: string]: any;
  bookmarks?: DataElementSearchResult[];
}
