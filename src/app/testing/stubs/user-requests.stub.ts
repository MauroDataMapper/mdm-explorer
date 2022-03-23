import { DataModel, FolderDetail } from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type GetDataRequestsFolder = (username: string) => Observable<FolderDetail>;
export type List = (username: string) => Observable<DataModel[]>;

export type GetDataRequestsFolderMockedFn = jest.MockedFunction<GetDataRequestsFolder>;
export type ListMockedFn = jest.MockedFunction<List>;

export interface UserRequestsServiceStub {
  getDataRequestsFolder: GetDataRequestsFolderMockedFn;
  list: ListMockedFn;
}

export const createUserRequestsServiceStub = (): UserRequestsServiceStub => {
  return {
    getDataRequestsFolder: jest.fn() as GetDataRequestsFolderMockedFn,
    list: jest.fn() as ListMockedFn,
  };
};
