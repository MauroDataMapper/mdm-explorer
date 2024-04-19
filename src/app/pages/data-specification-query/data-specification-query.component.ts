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
import { DataElement, DataModel, Uuid } from '@maurodatamapper/mdm-resources';
import { QueryBuilderConfig } from '../../data-explorer/query-builder/query-builder.interfaces';
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, finalize, forkJoin, switchMap } from 'rxjs';
import { BroadcastService } from '../../core/broadcast.service';
import { StateRouterService } from '../../core/state-router.service';
import {
  DataElementSearchResult,
  DataSpecification,
  DataSpecificationQuery,
  DataSpecificationQueryPayload,
  DataSpecificationQueryType,
  QueryCondition,
} from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { QueryBuilderWrapperService } from '../../data-explorer/query-builder-wrapper.service';
import { IModelPage } from '../../shared/types/shared.types';

const defaultQueryCondition: QueryCondition = {
  condition: 'and',
  entity: '',
  rules: [],
};

@Component({
  selector: 'mdm-data-specification-query',
  templateUrl: './data-specification-query.component.html',
  styleUrls: ['./data-specification-query.component.scss'],
})
export class DataSpecificationQueryComponent implements OnInit, IModelPage {
  dataSpecification?: DataSpecification;
  queryType: DataSpecificationQueryType = 'none';
  dataElements?: DataElementSearchResult[];
  config: QueryBuilderConfig = {
    fields: {},
  };
  query?: DataSpecificationQuery;
  condition: QueryCondition = defaultQueryCondition;
  status: 'init' | 'loading' | 'ready' | 'error' = 'init';
  dirty = false;
  original = '';
  backRouterLink = '';
  backLabel = '';
  backRouterDataSpecificationId = '';
  errorMessage = '';
  constructor(
    private route: ActivatedRoute,
    private dataSpecifications: DataSpecificationService,
    private toastr: ToastrService,
    private broadcast: BroadcastService,
    private queryBuilderWrapperService: QueryBuilderWrapperService,
    private stateRouter: StateRouterService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          this.queryType = params.queryType;

          const dataSpecificationId: Uuid = params.dataSpecificationId;
          this.status = 'loading';
          return this.dataSpecifications.get(dataSpecificationId);
        }),
        catchError(() => {
          return this.errorResponse(
            'There was a problem finding your data specification.'
          );
        }),
        switchMap((dataSpecification) => {
          if (!dataSpecification || !dataSpecification.id) {
            return EMPTY;
          }
          this.dataSpecification = dataSpecification;
          this.setBackButtonProperties(dataSpecification.id);

          return forkJoin([
            this.dataSpecifications.listDataElements(dataSpecification),
            this.dataSpecifications.getQuery(dataSpecification.id, this.queryType),
          ]);
        }),
        catchError(() => {
          return this.errorResponse(
            'There was a problem finding your data specification queries.'
          );
        }),
        switchMap(([dataElements, query]) => {
          if (dataElements.length === 0) {
            this.stateRouter.navigateTo([
              this.backRouterLink,
              this.backRouterDataSpecificationId,
            ]);
            return EMPTY;
          }

          return this.queryBuilderWrapperService.setupConfig(
            this.dataSpecification as DataModel,
            this.mapDataElements(dataElements),
            query
          );
        }),
        catchError((error) => {
          // This will display the error message on the page
          this.errorMessage = `\r\n${error.message}`;

          // This will display a toast error
          return this.errorResponse(
            'There was a problem configuring your data specification queries'
          );
        })
      )
      .subscribe((queryConfiguration) => {
        this.dataElements = queryConfiguration.dataElementSearchResult;
        this.config = queryConfiguration.config;
        this.query = queryConfiguration.dataSpecificationQueryPayload;
        this.condition = this.query ? this.query.condition : defaultQueryCondition;
        this.original = JSON.stringify(this.condition);
        this.status = 'ready';
      });
  }

  isDirty(): boolean {
    return this.dirty;
  }

  onQueryChange(value: QueryCondition) {
    const change = JSON.stringify(value);
    this.dirty = this.original !== change;
  }

  save() {
    if (!this.dataSpecification || !this.dataSpecification.id) {
      return;
    }

    const payload: DataSpecificationQueryPayload = {
      ruleId: this.query?.ruleId,
      representationId: this.query?.representationId,
      type: this.queryType,
      condition: this.condition,
    };

    this.broadcast.loading({ isLoading: true, caption: 'Saving your query...' });
    this.dataSpecifications
      .createOrUpdateQuery(this.dataSpecification.id, payload)
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

  private errorResponse(errorMessage: string) {
    this.toastr.error(errorMessage);
    this.status = 'error';
    return EMPTY;
  }

  private mapDataElements(elements: DataElement[]): DataElementSearchResult[] {
    return elements.map((element) => element as DataElementSearchResult);
  }

  private setBackButtonProperties(id: string) {
    this.backRouterLink = '/dataSpecifications/';
    this.backRouterDataSpecificationId = id;
    this.backLabel = 'Back to data specification';
  }
}
