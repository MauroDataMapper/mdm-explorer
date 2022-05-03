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
import {
  Bookmark,
  BookmarkService,
  SelectableBookmark,
} from 'src/app/data-explorer/bookmark.service';
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

  const b1 = { id: 'id-1', label: 'b1' } as Bookmark;
  const b2 = { id: 'id-2', label: 'b2' } as Bookmark;
  const bookmarks: Bookmark[] = [b1, b2];
  const selectableBookmarks: SelectableBookmark[] = bookmarks.map((bm) => {
    return { ...bm, isSelected: false };
  });

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
    expect(harness.component.userBookmarks).toStrictEqual([]);
  });

  describe('on initialization', () => {
    it('should load bookmarks', () => {
      bookmarkStub.index.mockImplementationOnce(() => {
        return of(bookmarks);
      });

      harness.component.ngOnInit();

      expect(harness.component.userBookmarks).toStrictEqual(selectableBookmarks);
    });
  });

  describe('select bookmark', () => {
    it.each([true, false])(
      'should flip the isSelected property to %p when checked is %p',
      (checked) => {
        harness.component.userBookmarks = selectableBookmarks;
        const event = { checked, item: b1 } as BookMarkCheckedEvent;

        const expected = [
          { ...b1, isSelected: checked },
          { ...b2, isSelected: false },
        ] as SelectableBookmark[];

        harness.component.onChecked(event);

        expect(harness.component.userBookmarks).toStrictEqual(expected);
      }
    );
  });

  describe('remove bookmark', () => {
    it('should remove the bookmark from userBookmarks', () => {
      const event = { item: b1 } as RemoveBookmarkEvent;
      const expected = [{ ...b2, isSelected: false }] as SelectableBookmark[];

      bookmarkStub.remove.mockImplementationOnce(() => {
        return of([]);
      });

      harness.component.userBookmarks = selectableBookmarks;
      harness.component.onRemove(event);

      expect(harness.component.userBookmarks).toStrictEqual(expected);
      expect(bookmarkStub.remove).toHaveBeenCalledWith(event.item);
      expect(toastrStub.success).toHaveBeenCalled();
    });
  });

  describe('onSelectAll method', () => {
    it('should set isSelected to true for every element in userBookmarks', () => {
      const expected = [
        { ...b1, isSelected: true },
        { ...b2, isSelected: true },
      ] as SelectableBookmark[];

      const event = { checked: true } as MatCheckboxChange;

      harness.component.userBookmarks = selectableBookmarks;
      harness.component.onSelectAll(event);

      expect(harness.component.userBookmarks).toStrictEqual(expected);
    });

    it('should set isSelected to false for every element in userBookmarks', () => {
      const expected = [
        { ...b1, isSelected: false },
        { ...b2, isSelected: false },
      ] as SelectableBookmark[];

      const event = { checked: false } as MatCheckboxChange;

      harness.component.userBookmarks = selectableBookmarks;
      harness.component.onSelectAll(event);

      expect(harness.component.userBookmarks).toStrictEqual(expected);
    });
  });
});
