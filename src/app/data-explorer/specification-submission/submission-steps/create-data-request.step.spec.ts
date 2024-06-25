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
import { createMatDialogStub } from 'src/app/testing/stubs/mat-dialog.stub';
import { CreateDataRequestStep } from './create-data-request.step';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  MembershipEndpointsResearcher,
  RequestCreate,
  RequestEndpointsResearcher,
  RequestResponse,
  UserProjectDTO,
} from '@maurodatamapper/sde-resources';
import { DataSpecificationService } from '../../data-specification.service';
import { Observable } from 'rxjs';
import { DataSpecification } from '../../data-explorer.types';
import { cold } from 'jest-marbles';
import {
  DEFAULT_NO_PROJECTS_MESSAGE,
  NoProjectsFoundError,
} from '../type-declarations/submission.custom-errors';
import {
  SelectProjectDialogData,
  SelectProjectDialogResponse,
} from '../select-project-dialog/select-project-dialog.component';
import { DialogService } from '../../dialog.service';
import { TestScheduler } from 'rxjs/internal/testing/TestScheduler';
import { CatalogueItemDomainType } from '@maurodatamapper/mdm-resources';

describe('CreateDataRequestStep', () => {
  let step: CreateDataRequestStep;
  const matDialogStub = createMatDialogStub();

  let testScheduler: TestScheduler;
  let defaultDataSpecification: DataSpecification;

  let dialogServiceStub: {
    openSelectProject: jest.Mock<
      MatDialogRef<SelectProjectDialogResponse, any>,
      [SelectProjectDialogData]
    >;
  };

  let membershipsEndpointsStub: {
    listProjects: jest.Mock<Observable<UserProjectDTO[]>, []>;
  };

  let researcherRequestEndpointsStub: {
    getRequestForDataSpecification: jest.Mock<Observable<RequestResponse | undefined>, [string]>;
    createRequest: jest.Mock<Observable<RequestResponse | undefined>, [RequestCreate]>;
  };

  let dataSpecificationServiceStub: {
    get: jest.Mock<Observable<DataSpecification>, [string]>;
  };

  beforeEach(() => {
    membershipsEndpointsStub = {
      listProjects: jest.fn(),
    };

    researcherRequestEndpointsStub = {
      getRequestForDataSpecification: jest.fn(),
      createRequest: jest.fn(),
    };

    dataSpecificationServiceStub = {
      get: jest.fn(),
    };

    dialogServiceStub = {
      openSelectProject: jest.fn(),
    };

    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });

    defaultDataSpecification = {
      label: 'label',
      modelVersion: 'version',
      description: 'description',
      status: 'finalised',
      domainType: 'DataModel' as CatalogueItemDomainType,
    };

    // Default endpoint call
    step = setupTestModuleForService(CreateDataRequestStep, {
      providers: [
        { provide: MatDialog, useValue: matDialogStub },
        { provide: MembershipEndpointsResearcher, useValue: membershipsEndpointsStub },
        { provide: RequestEndpointsResearcher, useValue: researcherRequestEndpointsStub },
        { provide: DataSpecificationService, useValue: dataSpecificationServiceStub },
        { provide: DialogService, useValue: dialogServiceStub },
      ],
    });
  });

  it('should create an instance', () => {
    expect(step).toBeTruthy();
  });

  describe('isRequired', () => {
    it('should return true if specificationId is not provided', () => {
      const input = {};
      const expected = cold('(a|)', { a: { isRequired: true } });
      expect(step.isRequired(input)).toBeObservable(expected);
    });

    it('should return false if a request for the specificationId exists', () => {
      const input = { specificationId: 'test-id' };
      researcherRequestEndpointsStub.getRequestForDataSpecification.mockReturnValueOnce(
        cold('(a|)', { a: { id: 'request-id' } })
      );
      const expected$ = cold('(a|)', {
        a: { isRequired: false, result: { dataRequestId: 'request-id' } },
      });

      const actual$ = step.isRequired(input);

      expect(actual$).toBeObservable(expected$);
    });
  });

  describe('run', () => {
    it('should throw an error if specificationId is not provided', () => {
      const input = {};

      // Here we test for a Synchronous error
      expect(() => step.run(input)).toThrow('Specification ID is required to select a project');
    });

    it('should throw an error if no projects are found', () => {
      // And for Asynchronous errors, we use the testScheduler.
      testScheduler.run(({ cold: coldAlias, expectObservable }) => {
        const input = { specificationId: 'test-id' };
        membershipsEndpointsStub.listProjects.mockReturnValueOnce(
          coldAlias('#', {}, new NoProjectsFoundError(DEFAULT_NO_PROJECTS_MESSAGE))
        );

        const actual$ = step.run(input);

        expectObservable(actual$).toBe(
          '#',
          {},
          new NoProjectsFoundError(DEFAULT_NO_PROJECTS_MESSAGE)
        );
      });
    });

    it('should not emit any values and just complete if the dialog is cancelled', () => {
      testScheduler.run(({ cold: coldAlias, expectObservable }) => {
        const input = { specificationId: 'test-id' };
        membershipsEndpointsStub.listProjects.mockReturnValueOnce(
          coldAlias('(a|)', {
            a: [{ projectId: 'project-id', projectName: 'project-name' }] as UserProjectDTO[],
          })
        );

        dialogServiceStub.openSelectProject.mockReturnValueOnce({
          afterClosed: () =>
            coldAlias('(a|)', { a: { projectId: 'project-id', isCancelled: true } }),
        } as unknown as MatDialogRef<SelectProjectDialogResponse, any>);

        const actual$ = step.run(input);

        const expectedMarble = '(a|)';
        const expectedValues = {
          a: { result: { cancel: true } },
        };

        expectObservable(actual$).toBe(expectedMarble, expectedValues);
      });
    });

    it('should throw an error if the request creation fails', () => {
      testScheduler.run(({ cold: coldAlias, expectObservable }) => {
        const input = { specificationId: 'test-id' };
        membershipsEndpointsStub.listProjects.mockReturnValueOnce(
          coldAlias('(a|)', {
            a: [{ projectId: 'project-id', projectName: 'project-name' }] as UserProjectDTO[],
          })
        );

        dialogServiceStub.openSelectProject.mockReturnValueOnce({
          afterClosed: () =>
            coldAlias('(a|)', { a: { projectId: 'project-id', isCancelled: false } }),
        } as unknown as MatDialogRef<SelectProjectDialogResponse, any>);

        dataSpecificationServiceStub.get.mockReturnValueOnce(
          coldAlias('(a|)', {
            a: defaultDataSpecification,
          })
        );

        researcherRequestEndpointsStub.createRequest.mockReturnValueOnce(
          coldAlias('#', {}, new Error('Failed to create data request'))
        );

        const actual$ = step.run(input);

        expectObservable(actual$).toBe('#', {}, new Error('Failed to create data request'));
      });
    });

    it('should return the data request id if the request creation is successful', () => {
      testScheduler.run(({ cold: coldAlias, expectObservable }) => {
        const input = { specificationId: 'test-id' };
        membershipsEndpointsStub.listProjects.mockReturnValueOnce(
          coldAlias('(a|)', {
            a: [{ projectId: 'project-id', projectName: 'project-name' }] as UserProjectDTO[],
          })
        );

        dialogServiceStub.openSelectProject.mockReturnValueOnce({
          afterClosed: () =>
            coldAlias('(a|)', { a: { projectId: 'project-id', isCancelled: false } }),
        } as unknown as MatDialogRef<SelectProjectDialogResponse, any>);

        dataSpecificationServiceStub.get.mockReturnValueOnce(
          coldAlias('(a|)', {
            a: defaultDataSpecification,
          })
        );

        researcherRequestEndpointsStub.createRequest.mockReturnValueOnce(
          coldAlias('(a|)', { a: { id: 'request-id' } as RequestResponse })
        );

        const actual$ = step.run(input);

        expectObservable(actual$).toBe('(a|)', { a: { result: { dataRequestId: 'request-id' } } });
      });
    });
  });
});
