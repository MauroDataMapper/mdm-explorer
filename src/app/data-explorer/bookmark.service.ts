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
import { map, switchMap, Observable, throwError } from 'rxjs';
import { MdmEndpointsService } from '../mauro/mdm-endpoints.service';
import { UserDetailsService } from '../security/user-details.service';
import { Uuid } from '@maurodatamapper/mdm-resources';

@Injectable({
  providedIn: 'root',
})

/**
 * Service to handle the persistence of bookmarks via User Preferences
 */
export class BookmarkService {
  constructor(
    private endpoints: MdmEndpointsService,
    private userDetailsService: UserDetailsService
  ) {}

  /**
   * Add a Bookmark to the list of bookmarks stored in User Preferences.
   * - Retrieve all existing User Preferences
   * - If the response is empty then create a new object. If the response does not
   * contain a bookmarks list then add one.
   * - If the bookmarks list does not contain the bookmark to be added, then add it.
   * - Save the entire User Preferences
   *
   * @param bookmark
   */
  public add(bookmark: Bookmark): Observable<any> {
    return this.getPreferences().pipe(
      switchMap((data) => {
        if (!data) {
          data = {};
        }

        if (!data.bookmarks) {
          data.bookmarks = [];
        }

        let found: Boolean;
        found = false;

        data.bookmarks.forEach((item: Bookmark) => {
          if (item.id === bookmark.id) found = true;
        });

        if (!found) {
          data.bookmarks.push(bookmark);
        }

        return this.savePreferences(data);
      })
    );
  }

  /**
   * Remove a Bookmark from the list of bookmarks stored in User Preferences.
   * - Retrieve all existing User Preferences
   * - If the User Preference contains the Bookmark, remove iut
   * - Save the entire User Preferences
   *
   * @param bookmarks Bookmark[]
   *
   * @returns Observable<Bookmark[]>
   */
  public remove(bookmarks: Bookmark[]): Observable<Bookmark[]> {
    // Make a list of ids we want to remove
    const idsToRemove = bookmarks.map((bookmark) => {
      return bookmark.id;
    });

    return this.getPreferences().pipe(
      switchMap((data) => {
        // Make changes here and save. Keep the bookmarks which are not in the list of removals
        if (data && data.bookmarks) {
          data.bookmarks = data.bookmarks.filter(
            (bookmark: Bookmark) => idsToRemove.indexOf(bookmark.id) === -1
          );
        }
        return this.savePreferences(data);
      }),
      switchMap(() => {
        // Get the list after update
        return this.index();
      })
    );
  }

  /**
   * Get the index of bookmarks from User Preferences
   *
   * @returns - an observable containing a list of bookmarks
   */
  public index(): Observable<Bookmark[]> {
    const userDetails = this.userDetailsService.get();
    if (userDetails) {
      return this.endpoints.catalogueUser
        .userPreferences(userDetails.id)
        .pipe(
          map((response: any) =>
            response.body && response.body.bookmarks ? response.body.bookmarks : []
          )
        );
    } else {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }
  }

  private getPreferences(): Observable<any> {
    const userDetails = this.userDetailsService.get();
    if (userDetails) {
      return this.endpoints.catalogueUser
        .userPreferences(userDetails.id)
        .pipe(map((response: any) => response.body));
    } else {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }
  }

  private savePreferences(data: any): Observable<any> {
    const userDetails = this.userDetailsService.get();
    if (userDetails) {
      return this.endpoints.catalogueUser
        .updateUserPreferences(userDetails.id, data)
        .pipe(map((response: any) => response.body));
    } else {
      return throwError(() => new Error('Must be logged in to use User Preferences'));
    }
  }
}

export interface Bookmark {
  id: Uuid;
  dataModelId: Uuid;
  dataClassId: Uuid;
  label: string;
}

export interface SelectableBookmark extends Bookmark {
  isSelected: boolean;
}
