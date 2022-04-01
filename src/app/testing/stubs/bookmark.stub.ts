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
import { Bookmark } from 'src/app/core/bookmark.service';
import { Observable } from 'rxjs';

export type BookmarkIndexFn = () => Observable<any>;
export type BookmarkIndexMockedFn = jest.MockedFunction<BookmarkIndexFn>;
export type BookmarkAddFn = (bookmark: Bookmark) => Observable<any>;
export type BookmarkAddMockedFn = jest.MockedFunction<BookmarkAddFn>;
export type BookmarkRemoveFn = (bookmark: Bookmark) => Observable<any>;
export type BookmarkRemoveMockedFn = jest.MockedFunction<BookmarkRemoveFn>;

export interface BookmarkServiceStub {
  index: BookmarkIndexMockedFn;
  add: BookmarkAddMockedFn;
  remove: BookmarkRemoveMockedFn;
}

export const createBookmarkServiceStub = (): BookmarkServiceStub => {
  return {
    index: jest.fn() as BookmarkIndexMockedFn,
    add: jest.fn() as BookmarkAddMockedFn,
    remove: jest.fn() as BookmarkRemoveMockedFn,
  };
};
