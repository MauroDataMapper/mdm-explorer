import { DataModel, DataModelDetail } from '@maurodatamapper/mdm-resources';
import { ToastrComponentlessModule } from 'ngx-toastr';
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createUserRequestsServiceStub } from 'src/app/testing/stubs/user-requests.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';

import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let harness: ComponentHarness<DashboardComponent>;
  const securityStub = createSecurityServiceStub();
  const stateRouterStub = createStateRouterStub();
  const userRequestsStub = createUserRequestsServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(DashboardComponent, {
      providers: [
        {
          provide: SecurityService,
          useValue: securityStub,
        },
        {
          provide: StateRouterService,
          useValue: stateRouterStub,
        },
        {
          provide: UserRequestsService,
          useValue: userRequestsStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('initialisation', () => {
    it('should load the users open requests', () => {
      const openRequests = [
        { label: 'dataModel-1' },
        { label: 'dataModel-2' },
      ] as DataModelDetail[];

      harness.component.ngOnInit();
    });
  });
});
