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
import { ToastrService } from 'ngx-toastr';
import { catchError, map, throwError } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { DataSpecificationService } from 'src/app/data-explorer/data-specification.service';
import {
  DataElementSearchParameters,
  DataSpecification,
  mapSearchParametersToParams,
} from 'src/app/data-explorer/data-explorer.types';
import { SecurityService } from 'src/app/security/security.service';

@Component({
  selector: 'mdm-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  searchTerms = '';
  currentUserDataSpecifications: DataSpecification[] = [];
  itemCardNumerOfLinesToShow = 6;
  currentCardsHeight = 1;

  constructor(
    private security: SecurityService,
    private stateRouter: StateRouterService,
    private dataSpecification: DataSpecificationService,
    private toastr: ToastrService
  ) {}

  get currentCardsHeightString(): string {
    return `${this.currentCardsHeight}rem`;
  }

  ngOnInit(): void {
    const user = this.security.getSignedInUser();
    if (user === null) {
      this.stateRouter.navigateToKnownPath('/home');
      return;
    }

    this.loadDataSpecifications();
  }

  loadDataSpecifications() {
    this.dataSpecification
      .list()
      .pipe(
        catchError((error) => {
          this.toastr.error(
            'Unable to retrieve your current data specifications from the server.'
          );
          return throwError(() => error);
        }),
        map((dataSpecifications) =>
          dataSpecifications.filter((req) => req.status === 'unsent')
        )
      )
      .subscribe((dataSpecifications: DataSpecification[]) => {
        this.currentUserDataSpecifications = [...dataSpecifications];
        this.calculateLinesToShow(this.currentUserDataSpecifications);
      });
  }

  search(): void {
    const searchParameters: DataElementSearchParameters = {
      search: this.searchTerms,
    };

    const params = mapSearchParametersToParams(searchParameters);
    this.stateRouter.navigateToKnownPath('/search/listing', params);
  }

  private calculateLinesToShow(currentUserDataSpecifications: DataSpecification[]) {
    let approximateCharactersPerLine: number;

    // when there is only 1 data specification, the width of the
    // card item is 100% so it can fit more characters per line.
    // When 2 elements, is 50%ish, and then 3 or more around 30%.
    // baseNumberOfCharacters is pure empiric tesing driven
    // there is no way to know for sure, as different combination
    // of letters can ocuppy different space (except in monospace fonts)
    const baseNumberOfCharacters = 30;
    if (currentUserDataSpecifications.length < 1) {
      return;
    } else if (currentUserDataSpecifications.length < 2) {
      approximateCharactersPerLine = baseNumberOfCharacters * 3;
    } else if (currentUserDataSpecifications.length < 3) {
      approximateCharactersPerLine = baseNumberOfCharacters * 3;
    } else {
      approximateCharactersPerLine = baseNumberOfCharacters;
    }

    // Get the maximum length of the current data specifications
    // if description is undefined, use 1.
    // Minumum 1, even if no dataSpecifications.
    const longestDescription: number =
      currentUserDataSpecifications.length > 0
        ? Math.max(
            ...currentUserDataSpecifications.map((x) => {
              return x.description ? x.description.length : 0;
            })
          )
        : 1;

    if (longestDescription < approximateCharactersPerLine) {
      this.itemCardNumerOfLinesToShow = 1;
    } else if (longestDescription < approximateCharactersPerLine * 2) {
      this.itemCardNumerOfLinesToShow = 2;
    } else if (longestDescription < approximateCharactersPerLine * 3) {
      this.itemCardNumerOfLinesToShow = 3;
    } else if (longestDescription < approximateCharactersPerLine * 4) {
      this.itemCardNumerOfLinesToShow = 4;
    } else if (longestDescription < approximateCharactersPerLine * 5) {
      this.itemCardNumerOfLinesToShow = 5;
    } else {
      this.itemCardNumerOfLinesToShow = 6;
    }

    // From testing it seems 2rem units per
    // line to show is the one that yields better results.
    // Base height is just enough to hold the title with
    // some padding.
    const baseHeightNeeded = 4;
    this.currentCardsHeight = Math.ceil(
      this.itemCardNumerOfLinesToShow * 2 + baseHeightNeeded
    );
  }
}
