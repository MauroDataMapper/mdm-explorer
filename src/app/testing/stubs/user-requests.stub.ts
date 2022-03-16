import { FolderDetail } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type GetUserRequestsFolder = (username: string) => Observable<FolderDetail>;
export type GetUserRequestsFolderMockedFn = jest.MockedFunction<GetUserRequestsFolder>;

export interface UserRequestsServiceStub {
  getUserRequestsFolder: GetUserRequestsFolderMockedFn;
}

export const createUserRequestsServiceStub = (): UserRequestsServiceStub => {
  return {
    getUserRequestsFolder: jest.fn() as GetUserRequestsFolderMockedFn,
  };
};
