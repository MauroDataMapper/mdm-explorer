import {
  ContainerCreatePayload,
  FolderDetailResponse,
} from '@maurodatamapper/mdm-resources';
import { Observable } from 'rxjs';

export type MdmFolderSaveFn = (
  payload: ContainerCreatePayload
) => Observable<FolderDetailResponse>;
export type MdmFolderSaveMockedFn = jest.MockedFunction<MdmFolderSaveFn>;

export interface MdmFolderResourceStub {
  save: MdmFolderSaveMockedFn;
}

export const createFolderStub = (): MdmFolderResourceStub => {
  return {
    save: jest.fn() as MdmFolderSaveMockedFn,
  };
};
