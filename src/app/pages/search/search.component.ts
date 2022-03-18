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
import { Component } from '@angular/core';
import { CatalogueSearchPayload } from 'src/app/catalogue/catalogue.service';
import { StateRouterService } from 'src/app/core/state-router.service';
import {
  DataElementSearchParameters,
  mapSearchParametersToParams,
} from 'src/app/search/search.types';

@Component({
  selector: 'mdm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent {
  constructor(private stateRouter: StateRouterService) {}

  search(payload: CatalogueSearchPayload) {
    const searchParameters: DataElementSearchParameters = {
      search: payload.searchTerms,
    };

    const params = mapSearchParametersToParams(searchParameters);
    this.stateRouter.navigateToKnownPath('/search/listing', params);
  }
}
