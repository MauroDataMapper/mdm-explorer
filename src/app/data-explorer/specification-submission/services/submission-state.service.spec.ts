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
import { SubmissionStateService } from './submission-state.service';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { ISubmissionState } from '../type-declarations/submission.resource';

describe('SubmissionStepService', () => {
  let service: SubmissionStateService;

  beforeEach(() => {
    service = setupTestModuleForService(SubmissionStateService, {});
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the initial state', () => {
    const state: ISubmissionState = service.get();
    expect(state).toEqual({});
  });

  it('should set and get the state', () => {
    const newState: Partial<ISubmissionState> = { specificationId: '123' };

    service.set(newState);

    const state: ISubmissionState = service.get();
    expect(state).toEqual(newState);
  });

  it('only update fields that match', () => {
    const initialState: Partial<ISubmissionState> = {
      specificationId: '123',
      dataRequestId: '456',
    };
    service.set(initialState);

    const newState: Partial<ISubmissionState> = { specificationId: '456' };
    service.set(newState);

    const state: ISubmissionState = service.get();
    expect(state).toEqual({ specificationId: '456', dataRequestId: '456' });
  });

  describe('getStepInputFromShape', () => {
    it('should return the correct input for the given shape', () => {
      service.set({
        specificationId: 'test-id',
        dataRequestId: 'dataRequest-id',
        specificationDescription: 'desc',
      });
      const input = service.getStepInputFromShape(['specificationId', 'dataRequestId']);
      expect(input).toEqual({ specificationId: 'test-id', dataRequestId: 'dataRequest-id' });
    });

    it('should return an empty object if no fields are specified', () => {
      service.set({ specificationId: 'test-id', dataRequestId: 'dataRequest-id' });
      const input = service.getStepInputFromShape([]);
      expect(input).toEqual({});
    });

    it('should return an empty object if the state is empty', () => {
      const input = service.getStepInputFromShape(['specificationId', 'dataRequestId']);
      expect(input).toEqual({});
    });
  });
});
