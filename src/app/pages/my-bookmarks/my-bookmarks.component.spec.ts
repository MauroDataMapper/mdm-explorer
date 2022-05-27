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
import { BookmarkService } from 'src/app/data-explorer/bookmark.service';
import { createBookmarkServiceStub } from 'src/app/testing/stubs/bookmark.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import {
  BookMarkCheckedEvent,
  DataElementSearchResult,
  RemoveBookmarkEvent,
  SelectableDataElementSearchResult,
} from 'src/app/data-explorer/data-explorer.types';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createDataRequestsServiceStub } from 'src/app/testing/stubs/data-requests.stub';
import { SecurityService } from 'src/app/security/security.service';
import {
  DataAccessRequestsSourceTargetIntersections,
  DataRequestsService,
} from 'src/app/data-explorer/data-requests.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { createDataExplorerServiceStub } from 'src/app/testing/stubs/data-explorer.stub';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  DataModel,
  DataModelDetail,
  SourceTargetIntersection,
} from '@maurodatamapper/mdm-resources';

describe('MyBookmarkComponent', () => {
  let harness: ComponentHarness<MyBookmarksComponent>;

  const b1 = { id: 'id-1', label: 'b1' } as DataElementSearchResult;
  const b2 = { id: 'id-2', label: 'b2' } as DataElementSearchResult;
  const bookmarks: DataElementSearchResult[] = [b1, b2];
  const selectableBookmarks: SelectableDataElementSearchResult[] = bookmarks.map((bm) => {
    return { ...bm, isSelected: false };
  });
  const rootDataModel = { id: 'ID' } as DataModelDetail;
  const dar1 = {} as DataModel;
  const dar2 = {} as DataModel;
  const sti1 = {} as SourceTargetIntersection;
  const sti2 = {} as SourceTargetIntersection;
  const intersections: DataAccessRequestsSourceTargetIntersections = {
    dataAccessRequests: [dar1, dar2],
    sourceTargetIntersections: [sti1, sti2],
  };

  const bookmarkStub = createBookmarkServiceStub();
  const securityStub = createSecurityServiceStub();
  const dataRequestStub = createDataRequestsServiceStub();
  const toastrStub = createToastrServiceStub();
  const dataExplorerStub = createDataExplorerServiceStub();

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
        {
          provide: DataExplorerService,
          useValue: dataExplorerStub,
        },
      ],
    });
    dataExplorerStub.getRootDataModel.mockImplementation(() => of(rootDataModel));
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
      dataRequestStub.getRequestsIntersections.mockImplementationOnce(() =>
        of({} as DataAccessRequestsSourceTargetIntersections)
      );

      harness.component.ngOnInit();

      expect(harness.component.userBookmarks).toStrictEqual(selectableBookmarks);
    });

    it('should load intersections', () => {
      bookmarkStub.index.mockImplementationOnce(() => {
        return of(bookmarks);
      });
      dataRequestStub.getRequestsIntersections.mockImplementationOnce(() =>
        of(intersections)
      );

      harness.component.ngOnInit();

      expect(harness.component.sourceTargetIntersections.dataAccessRequests.length).toBe(
        2
      );
      expect(
        harness.component.sourceTargetIntersections.sourceTargetIntersections.length
      ).toBe(2);
      expect(harness.component.sourceTargetIntersections.dataAccessRequests[0]).toBe(
        dar1
      );
      expect(harness.component.sourceTargetIntersections.dataAccessRequests[1]).toBe(
        dar2
      );
      expect(
        harness.component.sourceTargetIntersections.sourceTargetIntersections[0]
      ).toBe(sti1);
      expect(
        harness.component.sourceTargetIntersections.sourceTargetIntersections[1]
      ).toBe(sti2);
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
        ] as SelectableDataElementSearchResult[];

        harness.component.onChecked(event);

        expect(harness.component.userBookmarks).toStrictEqual(expected);
      }
    );
  });

  describe('remove bookmark', () => {
    it('should remove the bookmark from userBookmarks', () => {
      const event = { item: b1 } as RemoveBookmarkEvent;
      const expected = [
        { ...b2, isSelected: false },
      ] as SelectableDataElementSearchResult[];

      bookmarkStub.remove.mockImplementationOnce(() => {
        return of([]);
      });

      harness.component.userBookmarks = selectableBookmarks;
      harness.component.onRemove(event);

      expect(harness.component.userBookmarks).toStrictEqual(expected);
      expect(bookmarkStub.remove).toHaveBeenCalledWith([event.item]);
      expect(toastrStub.success).toHaveBeenCalled();
    });
  });

  describe('onSelectAll method', () => {
    it('should set isSelected to true for every element in userBookmarks', () => {
      const expected = [
        { ...b1, isSelected: true },
        { ...b2, isSelected: true },
      ] as SelectableDataElementSearchResult[];

      const event = { checked: true } as MatCheckboxChange;

      harness.component.userBookmarks = selectableBookmarks;
      harness.component.onSelectAll(event);

      expect(harness.component.userBookmarks).toStrictEqual(expected);
    });

    it('should set isSelected to false for every element in userBookmarks', () => {
      const expected = [
        { ...b1, isSelected: false },
        { ...b2, isSelected: false },
      ] as SelectableDataElementSearchResult[];

      const event = { checked: false } as MatCheckboxChange;

      harness.component.userBookmarks = selectableBookmarks;
      harness.component.onSelectAll(event);

      expect(harness.component.userBookmarks).toStrictEqual(expected);
    });
  });
});
