import { OrganisationsComponent } from './organisations.component';
import { SdeOrganisationService } from '../../services/sde-organisation.service';
import { createSdeOrganisationServiceStub } from 'src/app/testing/stubs/sde/sde-organisation-service.stub';
import {
  ComponentHarness,
  setupTestModuleForComponent,
} from 'src/app/testing/testing.helpers';
import { Organisation } from '../../resources/organisation.resources';
import { UserOrganisationDto } from '@maurodatamapper/sde-resources/lib/resources/organisation.resources';
import { of } from 'rxjs';
import { cold } from 'jest-marbles';

describe('OrganisationsComponent', () => {
  let harness: ComponentHarness<OrganisationsComponent>;

  const organisationServiceStub = createSdeOrganisationServiceStub();

  beforeEach(async () => {
    harness = await setupTestModuleForComponent(OrganisationsComponent, {
      providers: [
        {
          provide: SdeOrganisationService,
          useValue: organisationServiceStub,
        },
      ],
    });
  });

  it('should create', () => {
    expect(harness.component).toBeTruthy();
  });

  it('should set the selected organisation to the first organisation returned from the service', () => {
    const expected$ = cold('--a', { a: [] });
    organisationServiceStub.get.mockImplementationOnce(() => {
      return cold('--a', { a: { body: {} } });
    });

    const actual$ = service.index();

    expect(actual$).toBeObservable(expected$);
    expect(endpointsStub.catalogueUser.userPreferences).toHaveBeenCalledWith(
      userDetails.id
    );
  });
});
