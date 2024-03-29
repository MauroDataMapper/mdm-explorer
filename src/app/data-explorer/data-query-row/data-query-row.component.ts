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
import { RouterLinkRef } from 'src/app/shared/types/shared.types';
import { DataSpecificationQueryType, QueryCondition } from '../data-explorer.types';

@Component({
  selector: 'mdm-data-query-row',
  templateUrl: './data-query-row.component.html',
  styleUrls: ['./data-query-row.component.scss'],
})
export class DataQueryRowComponent {
  @Input() queryType?: DataSpecificationQueryType;
  @Input() condition?: QueryCondition;
  @Input() readOnly = false;
  @Input() createRouterLink?: RouterLinkRef;
  @Input() editRouterLink?: RouterLinkRef;

  get label() {
    return this.queryType === 'cohort'
      ? 'Cohort query'
      : this.queryType === 'data'
      ? 'Data query'
      : null;
  }

  get canCreate() {
    return !this.condition || this.condition.rules.length === 0;
  }

  get canEdit() {
    return this.condition && this.condition.rules.length > 0;
  }
}
