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

    // By using array access, we can get at the private method
    // we'd like to test. This is in fact an intentional 'escape hatch'
    // built into TS to give access to private members without losing
    // type safety. The predominant use case being for unit testing.
    let encodedUsername = service['encodeUsername'](username);

    expect(encodedUsername).toBe('hello[at]gmail.com');
  });
});
