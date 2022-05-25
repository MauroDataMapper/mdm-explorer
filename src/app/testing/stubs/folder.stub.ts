import {
  ContainerUpdatePayload,
  FolderDetail,
  Uuid,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type FolderUpdateFn = (
  id: Uuid,
  payload: ContainerUpdatePayload
) => Observable<FolderDetail>;

export interface FolderServiceStub {
  update: jest.MockedFunction<FolderUpdateFn>;
}

export const createFolderServiceStub = (): FolderServiceStub => {
  return {
    update: jest.fn() as jest.MockedFunction<FolderUpdateFn>,
  };
};
