import { TestBed } from '@angular/core/testing';

import { VersionTreeSortingService } from './version-tree-sorting.service';

describe('VersionTreeSortingService', () => {
  let service: VersionTreeSortingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VersionTreeSortingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
