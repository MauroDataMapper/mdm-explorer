import { MdmFolderResource } from '@maurodatamapper/mdm-resources';
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
          provide: MdmFolderResource,
          useValue: endpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it("should replace '@' with '[at]'", () => {
    let username = 'hello@gmail.com';
    let encodedUsername = service.encodeUserName(username);
    expect(encodedUsername).toBe('hello[at]gmail.com');
  });
});
