import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import { Bookmark } from '../bookmark.service';
import {
  BookMarkCheckedEvent,
  AddToRequestEvent,
  RemoveBookmarkEvent,
} from '../data-explorer.types';

@Component({
  selector: 'mdm-bookmark-row',
  templateUrl: './bookmark-row.component.html',
  styleUrls: ['./bookmark-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkRowComponent {
  @Input() bookmark?: Bookmark;

  @Output() checked = new EventEmitter<BookMarkCheckedEvent>();
  @Output() remove = new EventEmitter<RemoveBookmarkEvent>();
  @Output() addToRequest = new EventEmitter<AddToRequestEvent>();

  toggleItem(event: MatCheckboxChange) {
    if (!this.bookmark) return;

    this.checked.emit({ item: this.bookmark, checked: event.checked });
  }

  handleRemove() {
    if (!this.bookmark) return;

    this.remove.emit({ item: this.bookmark });
  }

  handleAddToRequest() {
    if (!this.bookmark) return;
  }
}
