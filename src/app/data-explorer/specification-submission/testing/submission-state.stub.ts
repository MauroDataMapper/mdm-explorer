import { ISubmissionState } from '../submission.resource';

export type StateServiceSetFn = (state: Partial<ISubmissionState>) => void;
export type StateServiceSetMockedFn = jest.MockedFunction<StateServiceSetFn>;
export type StateServiceGetFn = () => ISubmissionState;
export type StateServiceGetMockedFn = jest.MockedFunction<StateServiceGetFn>;
export type StateServiceGetStepInputFromShapeFn = (
  shape: (keyof ISubmissionState)[]
) => Partial<ISubmissionState>;
export type StateServiceGetStepInputFromShapeMockedFn =
  jest.MockedFunction<StateServiceGetStepInputFromShapeFn>;

export interface StateServiceStub {
  set: StateServiceSetMockedFn;
  get: StateServiceGetMockedFn;
  getStepInputFromShape: StateServiceGetStepInputFromShapeMockedFn;
}

export const createStateServiceStub = (): StateServiceStub => {
  return {
    set: jest.fn() as StateServiceSetMockedFn,
    get: jest.fn() as StateServiceGetMockedFn,
    getStepInputFromShape: jest.fn() as StateServiceGetStepInputFromShapeMockedFn,
  };
};
