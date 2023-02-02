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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLinkRef } from 'src/app/shared/types/shared.types';
import { DataRequest } from '../data-explorer.types';

@Component({
  selector: 'mdm-data-request-row',
  templateUrl: './data-request-row.component.html',
  styleUrls: ['./data-request-row.component.scss'],
})
export class DataRequestRowComponent {
  @Input() request?: DataRequest;
  @Input() detailsRouterLink?: RouterLinkRef;
  @Input() showStatus = true;
  @Input() showLabel = true;
  @Input() showSubmitButton = false;
  @Input() showCopyButton = false;

  @Output() submitClick = new EventEmitter<void>();
  @Output() copyClick = new EventEmitter<void>();

  onSubmitClick() {
    this.submitClick.emit();
  }

  onCopyClick() {
    this.copyClick.emit();
  }
}
