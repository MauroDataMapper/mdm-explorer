import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IdNamePair, RequestType, Uuid } from '@maurodatamapper/sde-resources';
import { SelectProjectDialogResponse } from '../select-project-dialog/select-project-dialog.component';

export interface SubmissionWizardDialogData {
  projects: IdNamePair[];
  newProjectRequests: IdNamePair[];
  projectChangeRequests: IdNamePair[];
}

export interface SubmissionWizardDialogResponse {
  requestType: RequestType;
  requestId: Uuid | undefined;
  projectId: Uuid | undefined;
}

enum WizardPage {
  First = 1,
  DataRequest = 2,
  NewProjectRequest = 3,
  ProjectChangeRequest = 4,
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

  projects: IdNamePair[];
  newProjectRequests: IdNamePair[];
  projectChangeRequests: IdNamePair[];

  selectProjectForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    project: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  selectNewProjectRequestForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    newProjectRequest: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  selectProjectChangeRequestForm = new FormGroup({
    // eslint-disable-next-line @typescript-eslint/unbound-method
    projectChangeRequest: new FormControl<IdNamePair | null>(null, Validators.required),
  });

  constructor(
    private dialogRef: MatDialogRef<SpecificationSubmissionWizardComponent>,
    @Inject(MAT_DIALOG_DATA) private data: SubmissionWizardDialogData
  ) {
    this.projects = this.data.projects ?? [];

    this.newProjectRequests = this.data.newProjectRequests ?? [];
    const newProject: IdNamePair = { id: '', name: '<< Create New Project Request >>' };
    this.newProjectRequests.unshift(newProject);

    this.projectChangeRequests = this.data.projectChangeRequests ?? [];
    const newProjectChange: IdNamePair = { id: '', name: '<< Create Project Change Request >>' };
    this.projectChangeRequests.unshift(newProjectChange);
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
    if (this.selectProjectForm.invalid || !this.selectProjectForm.controls.project.value) {
      return;
    }

    const response: SubmissionWizardDialogResponse = {
      requestId: undefined,
      projectId: this.selectProjectForm.controls.project.value?.id,
      requestType: RequestType.Data,
    };
    this.dialogRef.close({ ...response });
  }

  submitAttachToNewProjectRequest() {
    const response: SubmissionWizardDialogResponse = {
      requestId: this.selectNewProjectRequestForm.controls.newProjectRequest.value?.id,
      projectId: undefined,
      requestType: RequestType.NewProject,
    };
    this.dialogRef.close({ ...response });
  }

  submitAttachToProjectChangeRequest() {
    const response: SubmissionWizardDialogResponse = {
      requestId: this.selectProjectChangeRequestForm.controls.projectChangeRequest.value?.id,
      projectId: undefined,
      requestType: RequestType.ProjectChange,
    };
    this.dialogRef.close({ ...response });
  }
}
