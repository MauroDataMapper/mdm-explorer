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
import { AdminUser, AuthToken, ResearchUser, Uuid } from '@maurodatamapper/sde-resources';
import { Observable } from 'rxjs';

export type GetAdminUserFn = (userId: Uuid) => Observable<AdminUser>;
export type GetAdminUserMockedFn = jest.MockedFunction<GetAdminUserFn>;

export type GetAdminUserByEmailFn = (email: string) => Observable<AdminUser>;
export type GetAdminUserByEmailMockedFn = jest.MockedFunction<GetAdminUserByEmailFn>;

export type SaveAdminUserFn = (user: AdminUser) => Observable<AdminUser | undefined>;
export type SaveAdminUserMockedFn = jest.MockedFunction<SaveAdminUserFn>;

export type GetResearchUserFn = (userId: Uuid) => Observable<ResearchUser>;
export type GetResearchUserMockedFn = jest.MockedFunction<GetResearchUserFn>;

export type GetResearchUserByEmailFn = (email: string) => Observable<ResearchUser>;
export type GetResearchUserByEmailMockedFn =
  jest.MockedFunction<GetResearchUserByEmailFn>;

export type SaveResearchUserFn = (
  user: ResearchUser
) => Observable<ResearchUser | undefined>;
export type SaveResearchUserMockedFn = jest.MockedFunction<SaveResearchUserFn>;

export type ListResearchUsersFn = () => Observable<ResearchUser[]>;
export type ListResearchUsersMockedFn = jest.MockedFunction<ListResearchUsersFn>;

export type ImpersonateFn = (email: string) => Observable<AuthToken>;
export type ImpersonateMockedFn = jest.MockedFunction<GetResearchUserFn>;

export interface UserEndpointsSharedStub {
  getAdminUser: GetAdminUserMockedFn;
  getAdminUserByEmail: GetAdminUserByEmailMockedFn;
  saveAdminUser: SaveAdminUserMockedFn;
  getResearchUser: GetResearchUserMockedFn;
  getResearchUserByEmail: GetResearchUserByEmailMockedFn;
  saveResearchUser: SaveResearchUserMockedFn;
  listResearchUsers: ListResearchUsersMockedFn;
  impersonate: ImpersonateMockedFn;
}

export const createUserEndpointsSharedStub = (): UserEndpointsSharedStub => {
  return {
    getAdminUser: jest.fn() as GetAdminUserMockedFn,
    getAdminUserByEmail: jest.fn() as GetAdminUserByEmailMockedFn,
    saveAdminUser: jest.fn() as SaveAdminUserMockedFn,
    getResearchUser: jest.fn() as GetResearchUserMockedFn,
    getResearchUserByEmail: jest.fn() as GetResearchUserByEmailMockedFn,
    saveResearchUser: jest.fn() as SaveResearchUserMockedFn,
    listResearchUsers: jest.fn() as ListResearchUsersMockedFn,
    impersonate: jest.fn() as ImpersonateMockedFn,
  };
};
