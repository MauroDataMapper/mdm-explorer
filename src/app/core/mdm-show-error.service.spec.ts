import { TestBed } from '@angular/core/testing';

import { MdmShowErrorService } from './mdm-show-error.service';

describe('MdmShowErrorService', () => {
  let service: MdmShowErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MdmShowErrorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
