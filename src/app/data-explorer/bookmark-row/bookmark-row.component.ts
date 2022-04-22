import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
} from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox/checkbox';
import { Bookmark } from '../bookmark.service';
import { DataElementCheckedEvent } from '../data-explorer.types';

@Component({
  selector: 'mdm-bookmark-row',
  templateUrl: './bookmark-row.component.html',
  styleUrls: ['./bookmark-row.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookmarkRowComponent {
  @Input() bookmark?: Bookmark;

  @Output() checked = new EventEmitter<DataElementCheckedEvent>();

  itemChecked(event: MatCheckboxChange) {
    if (!this.bookmark) {
      return;
    }

    this.checked.emit({ item: this.bookmark, checked: event.checked });
  }

  remove(bookmark: Bookmark) {}
}
