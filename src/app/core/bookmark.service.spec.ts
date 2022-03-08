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
import { Bookmark } from 'src/app/model/bookmark';
import { BookmarkService } from './bookmark.service';

describe('BookmarkService', () => {
  let service: BookmarkService;

  beforeEach(() => {
    service = setupTestModuleForService(BookmarkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be able to index, and and remove bookmarks', () => {
    expect(service.index()).toHaveLength(0);

    const bookmark1: Bookmark  = new Bookmark('Test path 1');
    service.add(bookmark1);
    expect(service.index()).toHaveLength(1);

    // Can't add the same one again
    service.add(bookmark1);
    expect(service.index()).toHaveLength(1);

    const bookmark2: Bookmark  = new Bookmark('Test path 2');
    service.add(bookmark2);
    expect(service.index()).toHaveLength(2);

    // Can't add the same one again
    service.add(bookmark2);
    expect(service.index()).toHaveLength(2);

    service.remove(bookmark1);
    expect(service.index()).toHaveLength(1);

    // Removing the same one again has no affect
    service.remove(bookmark1);
    expect(service.index()).toHaveLength(1);

    service.remove(bookmark2);
    expect(service.index()).toHaveLength(0);
  });
});
