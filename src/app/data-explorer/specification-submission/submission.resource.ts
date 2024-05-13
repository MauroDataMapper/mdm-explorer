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
import { Uuid } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

/**
 * @description Data representing whether a step has run or not. If the step is required, the result
 * will be null and isRequired will be true. If the step is not required, the result will be the
 * data resultng from the successful execution of the step and isRequired will be false.
 */
export interface StepResult {
  result: Partial<ISubmissionState>;
  isRequired: boolean;
}

export interface ISubmissionStep {
  name: StepName;
  run: (input: Partial<ISubmissionState>) => Observable<StepResult>;

  /**
   * @returns A step result object indicating whether this steps needs to be run along with any data
   * necessary for further steps if this step does not need to be run.
   */
  isRequired: () => Observable<StepResult>;

  /**
   * @returns The 'shape' of the input required for this step. That is, the subset of keys needed
   * from the ISubmissionState object required to run this step.
   */
  getInputShape: () => (keyof Partial<ISubmissionState>)[];
}

export interface ISubmissionState {
  specificationId: Uuid;
  projectId: Uuid;
  specificationTitle: string;
  specificationDescription: string;
  whatStep1Did: string;
}

export type StepName =
  | 'SelectProject'
  | 'GetDataRequest'
  | 'GenerateSqlFile'
  | 'AttachSqlFileToDataRequest'
  | 'GeneratePdfOfDataRequest'
  | 'AttachPdfToDataRequest'
  | 'SaveDataRequest';
