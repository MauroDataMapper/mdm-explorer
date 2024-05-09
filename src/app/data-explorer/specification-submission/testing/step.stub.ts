import { Observable } from 'rxjs';
import { ISubmissionState, StepName, StepResult } from '../submission.resource';

export type StepIsRequiredFn = () => Observable<StepResult>;
export type StepIsRequiredMockedFn = jest.MockedFunction<StepIsRequiredFn>;
export type StepRunFn = (input: Partial<ISubmissionState>) => Observable<StepResult>;
export type StepRunMockedFn = jest.MockedFunction<StepRunFn>;
export type StepGetInputShapeFn = () => (keyof ISubmissionState)[];
export type StepGetInputShapeMockedFn = jest.MockedFunction<StepGetInputShapeFn>;

export interface StepStub {
  name: StepName;
  isRequired: StepIsRequiredMockedFn;
  getInputShape: StepGetInputShapeMockedFn;
  run: StepRunMockedFn;
}

export const createStepStub = (name: StepName): StepStub => {
  return {
    name,
    isRequired: jest.fn() as StepIsRequiredMockedFn,
    getInputShape: jest.fn() as StepGetInputShapeMockedFn,
    run: jest.fn() as StepRunMockedFn,
  };
};
