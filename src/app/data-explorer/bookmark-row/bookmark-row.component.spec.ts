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
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { BookmarkRowComponent } from './bookmark-row.component';
import { Bookmark } from '../bookmark.service';
import { MockComponent } from 'ng-mocks';
import { MatMenu } from '@angular/material/menu';
import { DataRequest } from '../data-explorer.types';

describe('BookmarkRowComponent', () => {
  let harness: ComponentHarness<BookmarkRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BookmarkRowComponent, {
      declarations: [MockComponent(MatMenu)],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
    expect(harness.component.bookmark).toBeUndefined();
    expect(harness.component.openRequests).toStrictEqual([]);
    expect(harness.component.isChecked).toStrictEqual(false);
  });

  describe('handleChecked method', () => {
    it('should not raise an event when checked but has no item', () => {
      const emitSpy = jest.spyOn(harness.component.checked, 'emit');
      const event = {} as MatCheckboxChange;
      harness.component.handleChecked(event);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      'should raise an event when has an item and checked is %p',
      (checked) => {
        const emitSpy = jest.spyOn(harness.component.checked, 'emit');
        const event = { checked } as MatCheckboxChange;
        const item = { id: '1' } as Bookmark;

        harness.component.bookmark = item;
        harness.component.handleChecked(event);

        expect(emitSpy).toHaveBeenCalled();
      }
    );
  });

  describe('handleRemove method', () => {
    it('should not raise an event when a removal requested but has no item', () => {
      const emitSpy = jest.spyOn(harness.component.remove, 'emit');

      harness.component.bookmark = undefined;
      harness.component.handleRemove();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise an event when a removal is requested and has an item', () => {
      const item = { id: '1' } as Bookmark;
      const emitSpy = jest.spyOn(harness.component.remove, 'emit');

      harness.component.bookmark = item;
      harness.component.handleRemove();

      expect(emitSpy).toHaveBeenCalledWith({ item });
    });
  });

  describe('handleAddToRequest method', () => {
    it('should not raise an event when called but has no item', () => {
      const emitSpy = jest.spyOn(harness.component.addToRequest, 'emit');
      const dataRequest = { label: 'request' } as DataRequest;

      harness.component.bookmark = undefined;
      harness.component.handleAddToRequest(dataRequest);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should raise event with the selected dataRequest if has item', () => {
      const item = { id: '1' } as Bookmark;
      const dataRequest = { label: 'request', id: 'id' } as DataRequest;
      const emitSpy = jest.spyOn(harness.component.addToRequest, 'emit');

      harness.component.bookmark = item;
      harness.component.handleAddToRequest(dataRequest);

      expect(emitSpy).toHaveBeenCalledWith({ item, requestId: dataRequest.id });
    });
  });
});
