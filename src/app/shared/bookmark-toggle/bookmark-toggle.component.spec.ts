/*
Copyright 2022-2023 University of Oxford
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
import { MatTooltip } from '@angular/material/tooltip';
import { MockDirective } from 'ng-mocks';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import {
  BookmarkToggleComponent,
  TooltipHelpTextOption,
} from './bookmark-toggle.component';

describe('BookmarkToggleComponent', () => {
  let harness: ComponentHarness<BookmarkToggleComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BookmarkToggleComponent, {
      declarations: [MockDirective(MatTooltip)],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
    expect(harness.component.selected).toBeFalsy();
    expect(harness.component.tooltipText).toBe('Add to bookmarks');
  });

  it.each([true, false])(
    'should emit a toggle event when initial state is %p',
    (initial) => {
      const emitSpy = jest.spyOn(harness.component.toggle, 'emit');
      harness.component.selected = initial;
      harness.component.toggleState();
      expect(emitSpy).toHaveBeenCalledWith(!initial);
    },
  );

  describe('getting tooltip text', () => {
    it.each([true, false])(
      'should return the correct tooltipText when selected is: %p',
      (selected) => {
        const expectedText: TooltipHelpTextOption = selected
          ? 'Remove from bookmarks'
          : 'Add to bookmarks';

        harness.component.selected = selected;

        expect(harness.component.getTooltipText()).toEqual(expectedText);
      },
    );

    it.each([true, false])(
      'should have the correct tooltipText set after toggling selected to be: %p',
      (initial) => {
        harness.component.selected = initial;
        const expectedText: TooltipHelpTextOption = !initial
          ? 'Remove from bookmarks'
          : 'Add to bookmarks';

        harness.component.toggleState();

        expect(harness.component.tooltipText).toEqual(expectedText);
      },
    );
  });
});
