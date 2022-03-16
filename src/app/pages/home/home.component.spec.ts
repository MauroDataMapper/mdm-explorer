import { StateRouterService } from 'src/app/core/state-router.service';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let harness: ComponentHarness<HomeComponent>;
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(HomeComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('initialisation', () => {
    it('should redirect to the dashboard page if a user is signed in', () => {
      securityStub.isSignedIn.mockImplementationOnce(() => {
        return true;
      });

      harness.component.ngOnInit();

      expect(stateRouterStub.transitionTo).toHaveBeenCalledWith(
        'app.container.dashboard'
      );
    });
  });
});
