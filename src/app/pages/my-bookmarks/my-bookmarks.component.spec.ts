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
  ComponentHarness,
  setupTestModuleForComponent,
} from '../../testing/testing.helpers';
import { MyBookmarksComponent } from './my-bookmarks.component';
import { Bookmark, BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { createBookmarkServiceStub } from 'src/app/testing/stubs/bookmark.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import {
  BookMarkCheckedEvent,
  RemoveBookmarkEvent,
} from 'src/app/data-explorer/data-explorer.types';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { SecurityService } from 'src/app/security/security.service';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';

describe('MyBookmarkComponent', () => {
  let harness: ComponentHarness<MyBookmarksComponent>;

  const emptySet = new Set();
  const b1 = { label: 'b1' } as Bookmark;
  const b2 = { label: 'b2' } as Bookmark;

  const bookmarkStub = createBookmarkServiceStub();
  const securityStub = createSecurityServiceStub();
  const dataRequestStub = createDataRequestsServiceStub();
  const toastrStub = createToastrServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(MyBookmarksComponent, {
      declarations: [MatCheckbox],
      providers: [
        {
          provide: BookmarkService,
          useValue: bookmarkStub,
        },
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: DataRequestsService,
          useValue: dataRequestStub,
        },
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.bookmarksTracker).toStrictEqual(emptySet);
  });

  describe('on initialization', () => {
    it('should load bookmarks', () => {
      const bookmarks = [b1, b2];
      const expected = new Map<Bookmark, boolean>();

      bookmarkStub.index.mockImplementationOnce(() => {
        return of(bookmarks);
      });

      harness.component.ngOnInit();

      expect(harness.component.bookmarksTracker.keys).toStrictEqual(bookmarks);
    });
  });

  describe('select bookmark', () => {
    it.each([true, false])(
      'should add/remove the bookmark to selectedBookmarks when checked is %p',
      (checked) => {
        const event = { checked, item: b1 } as BookMarkCheckedEvent;
        const expected = checked ? new Set([b1]) : emptySet;

        harness.component.onChecked(event);

        expect(harness.component.selectedBookmarks).toStrictEqual(expected);
      }
    );
  });

  describe('remove bookmark', () => {
    const all = new Set([b1, b2]);
    const selected = new Set([b1]);
    const event = { item: b1 } as RemoveBookmarkEvent;

    it('should remove bookmark from allBookmarks, selectedBookmarks, and fire a toastr success message', () => {
      const allAfterRemoval = new Set([b2]);
      const selectedAfterRemoval = emptySet;

      bookmarkStub.remove.mockImplementationOnce(() => {
        return of(allAfterRemoval);
      });

      harness.component.allBookmarks = all;
      harness.component.selectedBookmarks = selected;
      harness.component.onRemove(event);

      expect(harness.component.allBookmarks).toStrictEqual(allAfterRemoval);
      expect(harness.component.selectedBookmarks).toStrictEqual(selectedAfterRemoval);
      expect(bookmarkStub.remove).toHaveBeenCalledWith(event.item);
      expect(toastrStub.success).toHaveBeenCalled();
    });
  });

  describe('onSelectAll method', () => {
    it('should add all bookmarks to selectedBookmarks when checked is true', () => {
      const expected = new Set([b1, b2]);
      const event = { checked: true } as MatCheckboxChange;
      harness.component.allBookmarks = new Set([b1, b2]);

      harness.component.onSelectAll(event);

      expect(harness.component.selectedBookmarks).toStrictEqual(expected);
    });

    it('should clear selectedBookmarks when checked is false', () => {
      const expected = new Set();
      const event = { checked: false } as MatCheckboxChange;
      harness.component.selectedBookmarks = new Set([b1, b2]);

      harness.component.onSelectAll(event);

      expect(harness.component.selectedBookmarks).toStrictEqual(expected);
    });
  });
});
