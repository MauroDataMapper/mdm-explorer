import { FolderDetail } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { createFolderServiceStub } from '../testing/stubs/folder.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { FolderService } from './folder.service';

import { UserRequestsService } from './user-requests.service';

describe('UserRequestsService', () => {
  let service: UserRequestsService;
  const folderServiceStub = createFolderServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(UserRequestsService, {
      providers: [
        {
          provide: FolderService,
          useValue: folderServiceStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be named with [at]', () => {
    // Arrange
    const username = 'test@gmail.com';
    const rootFolder = { label: 'root' } as FolderDetail;
    const expectedFolder = { label: 'test[at]gmail.com' } as FolderDetail;

    const expected$ = cold('----a|', {
      a: expectedFolder,
    });

    folderServiceStub.getOrCreate.mockImplementationOnce(() => {
      return cold('--a|', {
        a: rootFolder,
      });
    });

    folderServiceStub.getOrCreateChildOf.mockImplementationOnce(
      (id: string, label: string) => {
        return cold('--a|', {
          a: { label },
        });
      }
    );

    // Act
    const actual$ = service.getUserRequestsFolder(username);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });
});
