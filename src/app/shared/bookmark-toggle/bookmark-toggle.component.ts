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
import { Component, EventEmitter, Input, Output } from '@angular/core';

export type TooltipHelpTextOption = 'Add to bookmarks' | 'Remove from bookmarks';

@Component({
  selector: 'mdm-bookmark-toggle',
  templateUrl: './bookmark-toggle.component.html',
  styleUrls: ['./bookmark-toggle.component.scss'],
})
export class BookmarkToggleComponent {
  @Input() selected = false;
  @Output() toggle = new EventEmitter<boolean>();

  tooltipText: TooltipHelpTextOption = this.getTooltipText();

  toggleState() {
    this.selected = !this.selected;
    this.tooltipText = this.getTooltipText();
    this.toggle.emit(this.selected);
  }

  getTooltipText() {
    return this.selected ? 'Remove from bookmarks' : 'Add to bookmarks';
  }
}
