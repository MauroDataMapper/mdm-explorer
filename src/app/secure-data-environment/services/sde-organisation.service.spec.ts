import { TestBed } from '@angular/core/testing';

import { SdeOrganisationService } from './sde-organisation.service';

describe('SdeOrganisationService', () => {
  let service: SdeOrganisationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SdeOrganisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
