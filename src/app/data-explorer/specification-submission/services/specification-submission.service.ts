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
import {
  IdNamePair,
  MembershipEndpointsResearcher,
  RequestType,
  RequestEndpointsResearcher,
  RequestResponse,
  RequestService,
  SdeRequest,
  UserProjectDTO,
  Uuid,
} from '@maurodatamapper/sde-resources';
import {
  EMPTY,
  catchError,
  concatMap,
  filter,
  finalize,
  forkJoin,
  from,
  map,
  tap,
  toArray,
} from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { switchMap } from 'rxjs/internal/operators/switchMap';
import { SubmissionStateService } from './submission-state.service';
import { CreateDataRequestStep } from '../submission-steps/create-data-request.step';
import {
  ISubmissionStep,
  StepName,
  StepResult,
  SubmissionType,
} from '../type-declarations/submission.resource';
import { GenerateSqlStep } from '../submission-steps/generate-sql.step';
import { AttachSqlStep } from '../submission-steps/attach-sql.step';
import { GeneratePdfStep } from '../submission-steps/generate-pdf.step';
import { AttachPdfStep } from '../submission-steps/attach-pdf.step';
import { SubmitRequestStep } from '../submission-steps/submit-request.step';
import { BroadcastService } from 'src/app/core/broadcast.service';
import { DialogService } from '../../dialog.service';
import {
  DEFAULT_ERROR_MESSAGE,
  NoProjectsFoundError,
} from '../type-declarations/submission.custom-errors';
import {
  SubmissionWizardDialogData,
  SubmissionWizardDialogResponse,
} from '../specification-submission-wizard/specification-submission-wizard.component';

@Injectable({
  providedIn: 'root',
})
export class SpecificationSubmissionService {
  private dataRequestSubmissionSteps: ISubmissionStep[] = [];
  private attachToRequestSubmissionSteps: ISubmissionStep[] = [];

  constructor(
    private stateService: SubmissionStateService,
    private dialogService: DialogService,
    private broadcastService: BroadcastService,
    private createDataRequestStep: CreateDataRequestStep,
    private generateSqlStep: GenerateSqlStep,
    private attachSqlStep: AttachSqlStep,
    private generatePdfStep: GeneratePdfStep,
    private attachPdfStep: AttachPdfStep,
    private submitRequestStep: SubmitRequestStep,
    private researcherRequestEndpoints: RequestEndpointsResearcher,
    private membershipEndpoints: MembershipEndpointsResearcher,
    private requestsService: RequestService
  ) {
    this.dataRequestSubmissionSteps = [
      this.createDataRequestStep,
      this.generateSqlStep,
      this.attachSqlStep,
      this.generatePdfStep,
      this.attachPdfStep,
      this.submitRequestStep,
    ];

    this.attachToRequestSubmissionSteps = [this.generatePdfStep, this.attachPdfStep];
  }

  chooseRequestType(specificationId: Uuid): Observable<SubmissionWizardDialogResponse> {
    // Choose request type
    if (!specificationId) {
      throw new Error('chooseRequestType: Specification ID is required.');
    }

    const projects$ = this.membershipEndpoints.listProjects().pipe(
      map((projects: UserProjectDTO[]) =>
        projects.map<IdNamePair>((proj) => {
          return {
            id: proj.projectId,
            name: proj.projectName,
          };
        })
      )
    );

    const newProjectRequests$ = this.requestsService.listDraftNewProjectRequests().pipe(
      map((requests: SdeRequest[]) =>
        requests.map<IdNamePair>((request) => {
          return {
            id: request.id,
            name: request.title,
          };
        })
      )
    );

    const projectChangeRequests$ = this.requestsService.listDraftProjectChangeRequests().pipe(
      map((requests: SdeRequest[]) =>
        requests.map<IdNamePair>((request) => {
          return {
            id: request.id,
            name: request.title,
          };
        })
      )
    );

    return this.researcherRequestEndpoints.getRequestForDataSpecification(specificationId).pipe(
      // First map operation to extract `request.id`
      map((request: RequestResponse | undefined) => request?.id),

      // Use switchMap to handle the response based on `requestId`
      switchMap((requestId) => {
        if (requestId !== undefined) {
          // If `requestId` is defined, return the relevant response directly
          return of({ requestType: RequestType.Data, requestId } as SubmissionWizardDialogResponse);
        } else {
          // If `requestId` is undefined, use `forkJoin` to wait for both `projects$` and `newProjectRequests$`
          return forkJoin({
            projects: projects$,
            newProjectRequests: newProjectRequests$,
            projectChangeRequests: projectChangeRequests$,
          }).pipe(
            map(({ projects, newProjectRequests, projectChangeRequests }) => {
              if (projects.length === 0 && newProjectRequests.length === 0) {
                throw new NoProjectsFoundError();
              }

              // Construct the dialog data with both projects and new project requests
              const dialogData: SubmissionWizardDialogData = {
                projects,
                newProjectRequests,
                projectChangeRequests,
              };
              return dialogData;
            }),

            // Open the dialog with the combined data from projects and new project requests
            switchMap((dialogData: SubmissionWizardDialogData) =>
              this.dialogService
                .openSubmissionWizard(dialogData)
                .afterClosed()
                .pipe(
                  filter((response) => !!response && !response.isCancelled),
                  map((response: SubmissionWizardDialogResponse) => response)
                )
            )
          );
        }
      })
    );
  }

  /**
   * @description Submits a specification for processing.
   * @param specificationId The ID of the specification to submit.
   * @returns An observable that emits a boolean value indicating whether the submission was successful.
   */
  submit(
    specificationId: Uuid,
    submissionType: SubmissionType,
    requestId: Uuid | undefined = undefined,
    projectId: Uuid | undefined = undefined
  ): Observable<boolean> {
    // Set initial state.
    this.stateService.clear();

    let submissionSteps: ISubmissionStep[] = [];

    switch (submissionType) {
      case SubmissionType.DataRequest:
        submissionSteps = this.dataRequestSubmissionSteps;
        this.stateService.set({ projectId });
        break;
      case SubmissionType.AttachPdfToRequest:
        submissionSteps = this.attachToRequestSubmissionSteps;
        this.stateService.set({ requestId });
        break;
      default:
        throw new Error(`Submission type ${submissionType} is not supported.`);
    }

    this.stateService.set({ specificationId });

    // Run each step, once at a time, ensuring it completes before running the next.
    return from(submissionSteps).pipe(
      concatMap((step: ISubmissionStep) => {
        // Retrieve the step input from the state.
        const stepInput = this.stateService.getStepInputFromShape(step.getInputShape());

        if (stepInput.cancel) {
          return EMPTY;
        }

        return step.isRequired(stepInput).pipe(
          // Get a step result, either from checking or running the step.
          switchMap((stepResult: StepResult) => {
            if (!stepResult.isRequired) {
              this.stateService.set({ ...stepResult.result });
              return of(stepResult);
            }
            return step.run(stepInput);
          }),
          tap((stepResult: StepResult) => {
            // Save the relevant stepResult information.
            this.stateService.set({ ...stepResult.result });
          }),
          catchError((error: Error) => {
            this.handleSubmissionError(error, step.name);

            // Cancel the submission at this step if an error occurs.
            const cancelResult = {
              result: { cancel: true },
            } as StepResult;
            this.stateService.set({ ...cancelResult.result });

            // Complete the step with cancel set.
            return EMPTY;
          })
        );
      }),
      toArray(),
      map((stepResults) => {
        return stepResults.every((response) => response.result.succeeded);
      }),
      finalize(() => {
        this.broadcastService.loading({ isLoading: false });
      })
    );
  }

  private handleSubmissionError(error: Error, stepName: StepName): void {
    // Log the true error to the console no matter what.
    console.error(`Error running step ${stepName}. Step failed with error message: ${error}`);

    const userFriendlyErrorMessage = this.getUserFriendlyErrorMessage(error, stepName);
    this.dialogService.openSimple({
      heading: 'Submission Error',
      message: userFriendlyErrorMessage,
    });
  }

  private getUserFriendlyErrorMessage(error: Error, stepName: StepName): string {
    const title = `Submission Step <b>${stepName}</b> failed.`;

    // If the error is a NoProjectsFoundError, show the message from the error. Otherwise, show the default message.
    // This is becuase the no projects error is the only error a researcher can feasibly fix on their own.
    const content = error instanceof NoProjectsFoundError ? error.message : DEFAULT_ERROR_MESSAGE;

    return `<p>${title}</p><p>${content}</p>`;
  }
}
