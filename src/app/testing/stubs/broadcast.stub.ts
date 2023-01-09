import { Observable, of } from 'rxjs';
import { BroadcastEvent } from 'src/app/core/broadcast.service';

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
export type OnFn<TPayload> = (event: BroadcastEvent) => Observable<TPayload>;

export interface BroadcastServiceStub {
  dispatch: jest.Mock;
  loading: jest.Mock;
  on: OnFn<any>;
}

export const createBroadcastServiceStub = (): BroadcastServiceStub => {
  return {
    dispatch: jest.fn(),
    loading: jest.fn(),
    on: jest.fn((result) => of(result)),
  };
};
