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
import { Component, Input } from '@angular/core';
import { DataSpecificationStatus } from '../data-explorer.types';

@Component({
  selector: 'mdm-data-specification-status-chip',
  templateUrl: './data-specification-status-chip.component.html',
  styleUrls: ['./data-specification-status-chip.component.scss'],
})
export class DataSpecificationStatusChipComponent {
  @Input() status?: DataSpecificationStatus;

  /**
   * Get the CSS class to use to represent status, mapped to an object that can be applied to
   * the NgClass directive.
   */
  get statusCssClassMap() {
    return {
      'mdm-data-specification-status-chip--unsent': this.status === 'unsent',
      'mdm-data-specification-status-chip--submitted': this.status === 'submitted',
    };
  }
}
