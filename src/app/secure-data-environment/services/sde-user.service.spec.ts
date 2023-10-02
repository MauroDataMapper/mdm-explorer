import { createSdeUserEndpointsStub } from 'src/app/testing/stubs/sde/sde-user-endpoints.stub';
import { setupTestModuleForService } from 'src/app/testing/testing.helpers';
import { UserEndpoints } from '../endpoints/user.endpoints';

import { SdeUserService } from './sde-user.service';

describe('SdeUserService', () => {
  let service: SdeUserService;
  const sdeUserEndpointsStub = createSdeUserEndpointsStub();

  beforeEach(() => {
    service = setupTestModuleForService(SdeUserService, {
      providers: [
        {
          provide: UserEndpoints,
          useValue: sdeUserEndpointsStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
