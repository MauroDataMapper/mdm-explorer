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
}

export type StepName =
  | 'SelectProject'
  | 'GetDataRequest'
  | 'GenerateSqlFile'
  | 'AttachSqlFileToDataRequest'
  | 'GeneratePdfOfDataRequest'
  | 'AttachPdfToDataRequest'
  | 'SaveDataRequest';
