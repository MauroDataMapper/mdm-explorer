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
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IdNamePair, RequestType, Uuid } from '@maurodatamapper/sde-resources';

export interface SubmissionWizardDialogData {
  dataRequests: IdNamePair[];
  newProjectRequests: IdNamePair[];
  projectChangeRequests: IdNamePair[];
  newProjectEnquiryRequests: IdNamePair[];
}

export interface SubmissionWizardDialogResponse {
  requestType: RequestType;
  requestId: Uuid | undefined;
}

enum WizardPage {
  First = 1,
  DataRequest = 2,
  NewProjectRequest = 3,
  ProjectChangeRequest = 4,
  ProjectEnquiryRequest = 5,
}

@Component({
  selector: 'mdm-specification-submission-wizard',
  templateUrl: './specification-submission-wizard.component.html',
  styleUrls: ['./specification-submission-wizard.component.scss'],
})
export class SpecificationSubmissionWizardComponent implements OnInit {
  WizardPage = WizardPage;
  currentPage = WizardPage.First; // Tracks the current page of the wizard
  selectedOption: number | null = null; // Tracks the selected radio option

  dataRequests: IdNamePair[];
  newProjectRequests: IdNamePair[];
  projectChangeRequests: IdNamePair[];
  newProjectEnquiryRequests: IdNamePair[];

  selectDataRequestForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    dataRequest: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  selectNewProjectRequestForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    newProjectRequest: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  selectProjectChangeRequestForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    projectChangeRequest: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  selectNewProjectEnquiryRequestForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    newProjectEnquiryRequest: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  constructor(
    private dialogRef: MatDialogRef<SpecificationSubmissionWizardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SubmissionWizardDialogData
  ) {
    this.dataRequests = this.data.dataRequests ?? [];
    const dataRequest: IdNamePair = { id: '', name: '<< Create Data Request >>' };
    this.dataRequests.unshift(dataRequest);

    this.newProjectRequests = this.data.newProjectRequests ?? [];
    const newProject: IdNamePair = { id: '', name: '<< Create New Project Request >>' };
    this.newProjectRequests.unshift(newProject);

    this.projectChangeRequests = this.data.projectChangeRequests ?? [];
    const newProjectChange: IdNamePair = { id: '', name: '<< Create Project Change Request >>' };
    this.projectChangeRequests.unshift(newProjectChange);

    this.newProjectEnquiryRequests = this.data.newProjectEnquiryRequests ?? [];
    const newProjectEnquiryChange: IdNamePair = {
      id: '',
      name: '<< Create New Project Enquiry Request >>',
    };
    this.newProjectEnquiryRequests.unshift(newProjectEnquiryChange);
  }

  ngOnInit(): void {}

  close() {
    this.dialogRef.close({ isCancelled: true });
  }

  goToPage(pageNumber: number | null) {
    if (pageNumber) {
      this.currentPage = pageNumber;
    }
  }

  submitAttachToDataRequest() {
    const response: SubmissionWizardDialogResponse = {
      requestId: this.selectDataRequestForm.controls.dataRequest.value?.id,
      requestType: RequestType.Data,
    };
    this.dialogRef.close({ ...response });
  }

  submitAttachToNewProjectRequest() {
    const response: SubmissionWizardDialogResponse = {
      requestId: this.selectNewProjectRequestForm.controls.newProjectRequest.value?.id,
      requestType: RequestType.NewProject,
    };
    this.dialogRef.close({ ...response });
  }

  submitAttachToProjectChangeRequest() {
    const response: SubmissionWizardDialogResponse = {
      requestId: this.selectProjectChangeRequestForm.controls.projectChangeRequest.value?.id,
      requestType: RequestType.ProjectChange,
    };
    this.dialogRef.close({ ...response });
  }

  submitAttachToNewProjectEnquiryRequest() {
    const response: SubmissionWizardDialogResponse = {
      requestId:
        this.selectNewProjectEnquiryRequestForm.controls.newProjectEnquiryRequest.value?.id,
      requestType: RequestType.NewProjectEnquiry,
    };
    this.dialogRef.close({ ...response });
  }
}
