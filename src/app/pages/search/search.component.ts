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
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileField } from '@maurodatamapper/mdm-resources';
import { combineLatest } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataExplorerService } from 'src/app/data-explorer/data-explorer.service';
import {
  DataElementSearchParameters,
  mapParamMapToSearchParameters,
  mapSearchParametersToParams,
} from 'src/app/data-explorer/data-explorer.types';

@Component({
  selector: 'mdm-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  profileFields: ProfileField[] = [];
  routeSearchTerm = '';

  constructor(
    private stateRouter: StateRouterService,
    private explorer: DataExplorerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    combineLatest([
      this.route.queryParamMap,
      this.explorer.getProfileFieldsForFilters(),
    ]).subscribe(([queryMap, fields]) => {
      const parameters = mapParamMapToSearchParameters(queryMap, fields);

      this.routeSearchTerm = parameters.search ?? '';
      this.profileFields = fields;
    });
  }

  search(event: DataElementSearchParameters) {
    const params = mapSearchParametersToParams(event);
    this.stateRouter.navigateToKnownPath('/search/listing', params);
  }
}
