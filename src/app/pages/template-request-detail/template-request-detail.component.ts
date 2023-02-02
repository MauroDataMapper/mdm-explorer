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
import { DataElement } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, forkJoin, switchMap } from 'rxjs';
import {
  DataElementSearchResult,
  DataRequest,
  QueryCondition,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';

@Component({
  selector: 'mdm-template-request-detail',
  templateUrl: './template-request-detail.component.html',
  styleUrls: ['./template-request-detail.component.scss'],
})
export class TemplateRequestDetailComponent implements OnInit {
  request?: DataRequest;
  requestElements: DataElementSearchResult[] = [];
  cohortQuery: QueryCondition = {
    condition: 'and',
    rules: [],
  };
  dataQuery: QueryCondition = {
    condition: 'and',
    rules: [],
  };
  state: 'idle' | 'loading' = 'idle';

  constructor(
    private route: ActivatedRoute,
    private dataRequests: DataRequestsService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const requestId = params.requestId as string;
          this.state = 'loading';
          return this.dataRequests.get(requestId);
        }),
        catchError((error) => {
          this.toastr.error(`Invalid Request Id. ${error}`);
          this.state = 'idle';
          return EMPTY;
        }),
        switchMap((request) => {
          if (!request?.id) {
            return EMPTY;
          }

          this.request = request;

          return forkJoin([
            this.dataRequests.listDataElements(request),
            this.dataRequests.getQuery(request.id, 'cohort'),
            this.dataRequests.getQuery(request.id, 'data'),
          ]);
        }),
        catchError(() => {
          this.toastr.error('There was a problem locating the template details.');
          this.state = 'idle';
          return EMPTY;
        })
      )
      .subscribe(([dataElements, cohortQuery, dataQuery]) => {
        this.state = 'idle';
        this.requestElements = this.mapDataElements(dataElements);

        if (cohortQuery) {
          this.cohortQuery = cohortQuery.condition;
        }

        if (dataQuery) {
          this.dataQuery = dataQuery.condition;
        }
      });
  }

  copy() {
    this.dataRequests
      .getRequestsFolder()
      .pipe(
        switchMap((requestFolder) => {
          if (!this.request) {
            return EMPTY;
          }

          return this.dataRequests.forkWithDialogs(this.request, {
            targetFolder: requestFolder,
          });
        })
      )
      .subscribe();
  }

  private mapDataElements(dataElements: DataElement[]) {
    return dataElements.map((element) => {
      return (
        element
          ? {
              ...element,
              isSelected: false,
              isBookmarked: false,
            }
          : null
      ) as DataElementSearchResult;
    });
  }
}