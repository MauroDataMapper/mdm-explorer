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
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { RouterLinkRef } from '../../shared/types/shared.types';
import { DataSpecification } from '../data-explorer.types';
import { VersionOption } from '../version-selector/version-selector.component';

@Component({
  selector: 'mdm-data-specification-row',
  templateUrl: './data-specification-row.component.html',
  styleUrls: ['./data-specification-row.component.scss'],
})
export class DataSpecificationRowComponent implements OnChanges {
  @Input() dataSpecification?: DataSpecification;
  @Input() detailsRouterLink?: RouterLinkRef;
  @Input() showStatus = true;
  @Input() showLabel = true;
  @Input() currentUserOwnsDataSpec = false;
  @Input() showVersionOnly = false;
  @Input() showNewVersionButton = false;
  @Input() showCopyButton = false;
  @Input() showEditButton = false;

  @Output() submitClick = new EventEmitter<void>();
  @Output() finaliseClick = new EventEmitter<void>();
  @Output() copyClick = new EventEmitter<void>();
  @Output() editClick = new EventEmitter<void>();
  @Output() shareClick = new EventEmitter<void>();
  @Output() newVersionClick = new EventEmitter<void>();
  @Output() ViewDifferentVersionClick = new EventEmitter<string>();
  @Output() viewRequestClick = new EventEmitter<void>();

  showFinaliseButton = false;
  showShareButton = false;
  showSubmitButton = false;
  showViewRequestButton = false;

  ngOnChanges(): void {
    const status = this.dataSpecification?.status;

    // Can only finalise if not already finalised and user owns the data spec.
    this.showFinaliseButton = this.currentUserOwnsDataSpec && status === 'draft';

    // Can only submit/share if finalised and user owns the data spec.
    this.showSubmitButton = this.currentUserOwnsDataSpec && status === 'finalised';
    this.showShareButton =
      this.currentUserOwnsDataSpec && (status === 'finalised' || status === 'submitted');
    this.showViewRequestButton = this.currentUserOwnsDataSpec && status === 'submitted';
  }

  onSubmitClick() {
    this.submitClick.emit();
  }

  onFinaliseClick() {
    this.finaliseClick.emit();
  }

  onCopyClick() {
    this.copyClick.emit();
  }

  onEditClick() {
    this.editClick.emit();
  }

  onNewVersionClick() {
    this.newVersionClick.emit();
  }

  onViewDifferentVersionClick(selected: VersionOption) {
    this.ViewDifferentVersionClick.emit(selected.id);
  }

  onShareClick() {
    this.shareClick.emit();
  }

  onViewRequestClick() {
    this.viewRequestClick.emit();
  }
}
