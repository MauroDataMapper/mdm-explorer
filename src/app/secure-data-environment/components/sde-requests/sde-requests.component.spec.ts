import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdeRequestsComponent } from './sde-requests.component';

describe('SdeRequestsComponent', () => {
  let component: SdeRequestsComponent;
  let fixture: ComponentFixture<SdeRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdeRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdeRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
