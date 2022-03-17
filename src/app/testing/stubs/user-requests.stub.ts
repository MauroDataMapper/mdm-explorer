import { DataModelDetail, FolderDetail } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type GetUserRequestsFolder = (username: string) => Observable<FolderDetail>;
export type GetOpenUserRequests = (username: string) => Observable<DataModelDetail[]>;

export type GetUserRequestsFolderMockedFn = jest.MockedFunction<GetUserRequestsFolder>;
export type GetOpenUserRequestsMockedFn = jest.MockedFunction<GetOpenUserRequests>;

export interface UserRequestsServiceStub {
  getUserRequestsFolder: GetUserRequestsFolderMockedFn;
  getOpenUserRequests: GetOpenUserRequestsMockedFn;
}

export const createUserRequestsServiceStub = (): UserRequestsServiceStub => {
  return {
    getUserRequestsFolder: jest.fn() as GetUserRequestsFolderMockedFn,
    getOpenUserRequests: jest.fn() as GetOpenUserRequestsMockedFn,
  };
};
