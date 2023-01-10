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
import { DataElement, Uuid } from '@maurodatamapper/mdm-resources';
import { QueryBuilderConfig } from 'angular2-query-builder';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { BroadcastService } from 'src/app/core/broadcast.service';
import {
  DataElementSearchResult,
  DataRequest,
  DataRequestQuery,
  DataRequestQueryPayload,
  DataRequestQueryType,
  QueryCondition,
} from 'src/app/data-explorer/data-explorer.types';
import { DataRequestsService } from 'src/app/data-explorer/data-requests.service';
import { QueryBuilderService } from 'src/app/mauro/query-builder.service';
import { IModelPage } from 'src/app/shared/types/shared.types';

const defaultQueryCondition: QueryCondition = {
  condition: 'and',
  rules: [],
};

@Component({
  selector: 'mdm-request-query',
  templateUrl: './request-query.component.html',
  styleUrls: ['./request-query.component.scss'],
})
export class RequestQueryComponent implements OnInit, IModelPage {
  dataRequest?: DataRequest;
  queryType: DataRequestQueryType = 'none';
  dataElements?: DataElementSearchResult[];
  config: QueryBuilderConfig = {
    fields: {},
  };
  query?: DataRequestQuery;
  condition: QueryCondition = defaultQueryCondition;
  status: 'init' | 'loading' | 'ready' | 'error' = 'init';
  dirty = false;
  original = '';
  backRouterLink = '';
  backLabel = '';
  backRouterRequestId = '';
  constructor(
    private route: ActivatedRoute,
    private dataRequests: DataRequestsService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    private queryBuilderService: QueryBuilderService
  ) {}

  isDirty(): boolean {
    return this.dirty;
  }

  private errorResponse(errorMessage: string) {
    this.toastr.error(errorMessage);
    this.status = 'error';
    return EMPTY;
  }

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.queryType = params.queryType;

          const requestId: Uuid = params.requestId;
          this.status = 'loading';
          return this.dataRequests.get(requestId);
        }),
        catchError(() => {
          return this.errorResponse('There was a problem finding your request.');
        }),
        switchMap((dataRequest) => {
          if (!dataRequest || !dataRequest.id) {
            return EMPTY;
          }
          this.dataRequest = dataRequest;
          this.setBackButtonProperties(dataRequest.id);

          return forkJoin([
            this.dataRequests.listDataElements(dataRequest),
            this.dataRequests.getQuery(dataRequest.id, this.queryType),
          ]);
        }),
        catchError(() => {
          return this.errorResponse('There was a problem finding your request queries.');
        }),
        switchMap(([dataElements, query]) => {
          return this.queryBuilderService.setupConfig(
            this.mapDataElements(dataElements),
            query
          );
        }),
        catchError(() => {
          return this.errorResponse(
            'There was a problem configuring your request queries.'
          );
        })
      )
      .subscribe((queryConfiguration) => {
        this.dataElements = queryConfiguration.dataElementSearchResult;
        this.config = queryConfiguration.config;
        this.query = queryConfiguration.dataRequestQueryPayload;
        this.condition = this.query ? this.query.condition : defaultQueryCondition;
        this.original = JSON.stringify(this.condition);
        this.status = 'ready';
      });
  }

  onQueryChange(value: QueryCondition) {
    const change = JSON.stringify(value);
    this.dirty = this.original !== change;
  }

  save() {
    if (!this.dataRequest || !this.dataRequest.id) {
      return;
    }

    const payload: DataRequestQueryPayload = {
      ruleId: this.query?.ruleId,
      representationId: this.query?.representationId,
      type: this.queryType,
      condition: this.condition,
    };

    this.broadcast.loading({ isLoading: true, caption: 'Saving your query...' });
    this.dataRequests
      .createOrUpdateQuery(this.dataRequest.id, payload)
      .pipe(
        catchError(() => {
          this.toastr.error('There was a problem saving your query.');
          return EMPTY;
        }),
        finalize(() => this.broadcast.loading({ isLoading: false }))
      )
      .subscribe((submitted) => {
        this.toastr.success(`Your ${this.queryType} query was saved successfully.`);
        this.query = submitted;
        if (this.query) {
          this.condition = this.query.condition;
          this.original = JSON.stringify(this.condition);
          this.dirty = false;
        }
      });
  }

  private mapDataElements(elements: DataElement[]): DataElementSearchResult[] {
    return elements.map((element) => element as DataElementSearchResult);
  }

  private setBackButtonProperties(id: string) {
    this.backRouterLink = '/requests/';
    this.backRouterRequestId = id;
    this.backLabel = 'Back to request';
  }
}
