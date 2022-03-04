import { HttpErrorResponse } from '@angular/common/http';
import { CatalogueItemDomainType, FolderDetail } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';
import { FolderService } from './folder.service';

describe('FolderService', () => {
  let service: FolderService;
  const endpointsStub = createMdmEndpointsStub();

  let folderLabel: string;
  let expectedFolder: FolderDetail;

  beforeEach(() => {
    folderLabel = 'folderLabel';
    expectedFolder = {
      label: folderLabel,
      domainType: CatalogueItemDomainType.Folder,
      availableActions: ['show'],
    };

    service = setupTestModuleForService(FolderService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should return a folder detail object and not create a new folder', () => {
    // Arrange
    const expected$ = cold('--a|', {
      a: expectedFolder,
    });

    endpointsStub.catalogueItem.getPath.mockImplementationOnce(() => {
      return cold('--a|', {
        a: { body: expectedFolder },
      });
    });

    // Act
    const actual$ = service.getOrCreate(folderLabel);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });

  it('should create a new folder using the folder.save method and return it', () => {
    // Arrange
    const notFoundError = { status: 404 } as HttpErrorResponse;
    const expected$ = cold('----a|', {
      a: expectedFolder,
    });

    endpointsStub.catalogueItem.getPath.mockImplementationOnce(() => {
      return cold('--#', null, notFoundError);
    });

    endpointsStub.folder.save.mockImplementationOnce(() => {
      return cold('--a|', {
        a: { body: expectedFolder },
      });
    });

    // Act
    const actual$ = service.getOrCreate(folderLabel);

    // Assert
    expect(actual$).toBeObservable(expected$);
    expect(actual$).toSatisfyOnFlush(() => {
      expect(endpointsStub.folder.save).toHaveBeenCalledWith({ label: folderLabel });
    });
  });

  it('should rethrow the server if save fails', () => {
    // Arrange
    const notFoundError = { status: 404 } as HttpErrorResponse;
    const serverError = { status: 500 } as HttpErrorResponse;
    const expected$ = cold('----#', null, serverError);

    endpointsStub.catalogueItem.getPath.mockImplementationOnce(() => {
      return cold('--#', null, notFoundError);
    });

    endpointsStub.folder.save.mockImplementationOnce(() => {
      return cold('--#', null, serverError);
    });

    // Act
    const actual$ = service.getOrCreate(folderLabel);

    // Assert
    expect(actual$).toBeObservable(expected$);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
