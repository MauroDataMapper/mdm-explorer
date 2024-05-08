import { TestBed } from '@angular/core/testing';

import { SpecificationSubmissionService } from './specification-submission.service';

describe('SpecificationSubmissionService', () => {
  let service: SpecificationSubmissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpecificationSubmissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
