import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { BookmarkRowComponent } from './bookmark-row.component';
import { Bookmark } from '../bookmark.service';
import { emit } from 'process';

describe('BookmarkRowComponent', () => {
  let harness: ComponentHarness<BookmarkRowComponent>;

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(BookmarkRowComponent);
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
    expect(harness.component.bookmark).toBeUndefined();
  });

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

  it('should raise an event when a removal is requested and has an item', () => {
    const item = { id: '1' } as Bookmark;
    const emitSpy = jest.spyOn(harness.component.remove, 'emit');

    harness.component.bookmark = item;
    harness.component.handleRemove();

    expect(emitSpy).toHaveBeenCalledWith({ item });
  });
});
