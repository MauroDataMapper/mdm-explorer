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
import { Injectable } from '@angular/core';
import { Observable, filter, forkJoin, map, of, switchMap } from 'rxjs';
import { ISubmissionState, ISubmissionStep, StepName, StepResult } from '../submission.resource';
import { DialogService } from 'src/app/data-explorer/dialog.service';
import {
  SelectProjectDialogData,
  SelectProjectDialogResponse,
} from '../select-project-dialog/select-project-dialog.component';
import {
  IdNamePair,
  MembershipEndpointsResearcher,
  RequestCreate,
  RequestDefinition,
  RequestEndpointsResearcher,
  RequestResponse,
  RequestType,
  UserProjectDTO,
  Uuid,
} from '@maurodatamapper/sde-resources';
import { DataSpecificationService } from '../../data-specification.service';
import { NoProjectsFoundError } from '../submission.custom-errors';

export interface SelectProjectStepResult {
  specificationId: Uuid;
}

@Injectable({
  providedIn: 'root',
})
export class CreateDataRequestStep implements ISubmissionStep {
  name: StepName = 'Create data request';

  constructor(
    private dialog: DialogService,
    private memberships: MembershipEndpointsResearcher,
    private researcherRequestEndpoints: RequestEndpointsResearcher,
    private dataSpecificationService: DataSpecificationService
  ) {}

  isRequired(input: Partial<ISubmissionState>): Observable<StepResult> {
    if (!input.specificationId) {
      // Probably should throw an error here
      return of({ isRequired: true } as StepResult);
    }

    return this.researcherRequestEndpoints
      .getRequestForDataSpecification(input.specificationId)
      .pipe(
        map((request: RequestResponse | undefined) => {
          const isRequired = !request;
          const stepResult: StepResult = {
            result: {
              dataRequestId: request?.id,
            },
            isRequired,
          };
          return stepResult;
        })
      );
  }

  run(input: Partial<ISubmissionState>): Observable<StepResult> {
    const specificationId = input.specificationId;

    if (!specificationId) {
      throw new Error('Specification ID is required to select a project');
    }

    const projects$ = this.memberships.listProjects().pipe(
      map((projects: UserProjectDTO[]) =>
        projects.map<IdNamePair>((proj) => {
          return {
            id: proj.projectId,
            name: proj.projectName,
          };
        })
      )
    );

    return projects$.pipe(
      map((projects: IdNamePair[]) => {
        if (projects.length === 0) {
          throw new NoProjectsFoundError();
        }

        const data = { projects } as SelectProjectDialogData;
        return data;
      }),
      switchMap((dialogData: SelectProjectDialogData) => {
        return this.dialog
          .openSelectProject(dialogData)
          .afterClosed()
          .pipe(
            filter((response) => !!response && !response.isCancelled),
            switchMap((response: SelectProjectDialogResponse) => {
              return forkJoin([of(response), this.dataSpecificationService.get(specificationId)]);
            }),
            switchMap(([response, dataSpecification]) => {
              // Save a request here
              const requestCreate: RequestCreate = {
                type: RequestType.Data,
                projectId: response.projectId,
                mauroDataSpecificationId: specificationId,
                definition: {
                  title: `${dataSpecification.label} (${dataSpecification.modelVersion})`,
                  content: dataSpecification.description ?? 'No description provided',
                } as RequestDefinition,
              };

              return this.researcherRequestEndpoints.createRequest(requestCreate);
            }),
            map((requestResponse) => {
              if (!requestResponse) {
                throw new Error('Failed to create data request');
              }
              return { result: { dataRequestId: requestResponse.id } } as StepResult;
            })
          );
      })
    );
  }

  getInputShape(): (keyof ISubmissionState)[] {
    return ['specificationId'];
  }
}
