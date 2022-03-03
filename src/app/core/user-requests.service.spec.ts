import { HttpErrorResponse } from '@angular/common/http';
import { MdmFolderResource } from '@maurodatamapper/mdm-resources';
import { cold } from 'jest-marbles';
import { MdmEndpointsService } from '../mdm-rest-client/mdm-endpoints.service';
import { UserDetails } from '../security/user-details.service';
import { createMdmEndpointsStub } from '../testing/stubs/mdm-endpoints.stub';
import { setupTestModuleForService } from '../testing/testing.helpers';

import { UserRequestsService } from './user-requests.service';

describe('UserRequestsService', () => {
  let service: UserRequestsService;
  const endpointsStub = createMdmEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(UserRequestsService, {
      providers: [
        {
          provide: MdmEndpointsService,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be named with [at]', () => {
    const username = 'test@gmail.com';

    const expected$ = cold('--a|', {
      a: {
        label: 'asdf[at]gmail.com',
      },
    });

    const actual$ = service.getUserRequestsFolder(username);
    expect(actual$).toBeObservable(expected$);
  });

  // Can we only simulate up to the endpoint call? I guess we can mock that
  // something comes back but what if that's what we're testing.
  it('should create root folder if not exists', () => {
    // Arrange
    // Create folder label
    endpointsStub.folder.save.mockImplementationOnce(() => {});

    //endpointsStub.folder.save.mockImplementationOnce(() => {});
    // Act
    //

    //const actual$ = service.getUserRequestsFolder(user);

    // Assert
    //expect(endpointsStub.folder.save).toBeCalledWith();
  });
});
