import { RawParams, TransitionOptions } from '@uirouter/angular';
import { KnownRouterState } from 'src/app/core/state-router.service';

export type TransitionFn = (name: string, params?: RawParams, options?: TransitionOptions) => any;
export type TransitionMockedFn = jest.MockedFunction<TransitionFn>;

export type TransitionToFn = (name: KnownRouterState, params?: RawParams, options?: TransitionOptions) => any;
export type TransitionToMockedFn = jest.MockedFunction<TransitionToFn>;

export interface StateRouterServiceStub {
  transition: TransitionMockedFn;
  transitionTo: TransitionToMockedFn;
}

export const createStateRouterStub = (): StateRouterServiceStub => {
  return {
    transition: jest.fn() as TransitionMockedFn,
    transitionTo: jest.fn() as TransitionToMockedFn
  };
};
