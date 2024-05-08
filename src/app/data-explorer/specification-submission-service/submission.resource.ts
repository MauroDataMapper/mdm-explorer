import { Uuid } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export interface ISubmissionStep {
  name: StepName;
  executionRequired: () => Observable<boolean>;
  execute: () => Observable<any>;
  saveResults: () => void;
  validateExecutionInputs: () => void;
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
