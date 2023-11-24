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
import { ToastrService } from 'ngx-toastr';
import { catchError, EMPTY, forkJoin, switchMap } from 'rxjs';
import {
  DataSpecification,
  DataSchema,
  QueryCondition,
} from '../../data-explorer/data-explorer.types';
import { DataSpecificationService } from '../../data-explorer/data-specification.service';
import { DataSchemaService } from '../../data-explorer/data-schema.service';

@Component({
  selector: 'mdm-template-data-specification-detail',
  templateUrl: './template-data-specification-detail.component.html',
  styleUrls: ['./template-data-specification-detail.component.scss'],
})
export class TemplateDataSpecificationDetailComponent implements OnInit {
  dataSpecification?: DataSpecification;
  dataSchemas: DataSchema[] = [];
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
    private dataSpecifications: DataSpecificationService,
    private toastr: ToastrService,
    private dataSchemaService: DataSchemaService,
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(
        switchMap((params) => {
          const dataSpecificationId = params.dataSpecificationId as string;
          this.state = 'loading';
          return this.dataSpecifications.get(dataSpecificationId);
        }),
        catchError((error) => {
          this.toastr.error(`Invalid Data Specification Id. ${error}`);
          this.state = 'idle';
          return EMPTY;
        }),
        switchMap((dataSpecification) => {
          if (!dataSpecification?.id) {
            return EMPTY;
          }

          this.dataSpecification = dataSpecification;

          return forkJoin([
            this.dataSchemaService.loadDataSchemas(dataSpecification),
            this.dataSpecifications.getQuery(dataSpecification.id, 'cohort'),
            this.dataSpecifications.getQuery(dataSpecification.id, 'data'),
          ]);
        }),
        catchError((error) => {
          this.toastr.error(
            `There was a problem locating the template details. ${error}`,
          );
          this.state = 'idle';
          return EMPTY;
        }),
      )
      .subscribe(([dataSchemas, cohortQuery, dataQuery]) => {
        this.state = 'idle';
        this.dataSchemas = dataSchemas;

        if (cohortQuery) {
          this.cohortQuery = cohortQuery.condition;
        }

        if (dataQuery) {
          this.dataQuery = dataQuery.condition;
        }
      });
  }

  copy() {
    this.dataSpecifications
      .getDataSpecificationFolder()
      .pipe(
        switchMap((dataSpecificationFolder) => {
          if (!this.dataSpecification) {
            return EMPTY;
          }

          return this.dataSpecifications.forkWithDialogs(this.dataSpecification, {
            targetFolder: dataSpecificationFolder,
          });
        }),
      )
      .subscribe();
  }
}
