import { DataModel } from '@maurodatamapper/mdm-resources';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { StateRouterService } from 'src/app/core/state-router.service';
import { UserRequestsService } from 'src/app/core/user-requests.service';
import { SecurityService } from 'src/app/security/security.service';
import { UserDetails } from 'src/app/security/user-details.service';
import { createSecurityServiceStub } from 'src/app/testing/stubs/security.stub';
import { createStateRouterStub } from 'src/app/testing/stubs/state-router.stub';
import { createToastrServiceStub } from 'src/app/testing/stubs/toastr.stub';
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
  const toastrStub = createToastrServiceStub();

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
        {
          provide: ToastrService,
          useValue: toastrStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.isComponentCreated).toBeTruthy();
  });

  describe('initialisation', () => {
    it('should transition to home page if user not logged in', () => {
      const spy = jest.spyOn(stateRouterStub, 'transitionTo');

      securityStub.getSignedInUser.mockImplementationOnce(() => {
        return null;
      });

      harness.component.ngOnInit();

      expect(spy).toHaveBeenCalledWith('app.container.home');
    });

    it('should initialize the currentUserRequests list upon successful retrieval of requests', () => {
      securityStub.getSignedInUser.mockImplementationOnce(() => {
        return { userName: 'username' } as UserDetails;
      });

      const openRequests = [
        { label: 'dataModel-1' },
        { label: 'dataModel-2' },
      ] as DataModel[];

      userRequestsStub.list.mockImplementationOnce(() => {
        return of(openRequests);
      });

      harness.component.ngOnInit();

      expect(harness.component.currentUserRequests).toEqual(openRequests);
    });
  });

  describe('loadRequests', () => {
    it('should raise a toastr message if something goes wrong and not set currentUserRequests', () => {
      const spy = jest.spyOn(toastrStub, 'error');
      const username = 'username';

      userRequestsStub.list.mockImplementationOnce(() => {
        return throwError(() => {});
      });

      harness.component.loadRequests(username);

      expect(spy).toHaveBeenCalledWith(
        'Unable to retrieve your current requests from the server.'
      );
      expect(harness.component.currentUserRequests).toEqual([]);
    });
  });

  describe('search', () => {
    it('should transition to the search-listing page with the appropriate search payload', () => {
      const searchTerms = 'test search terms';
      const expectedPayload = { searchTerms: searchTerms };

      harness.component.searchTerms = searchTerms;
      harness.component.search();

      expect(stateRouterStub.transitionTo).toHaveBeenCalledWith(
        'app.container.search-listing',
        expectedPayload
      );
    });
  });
});
