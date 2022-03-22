import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowRequestErrorComponent } from './show-request-error.component';

describe('ShowRequestErrorComponent', () => {
  let component: ShowRequestErrorComponent;
  let fixture: ComponentFixture<ShowRequestErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ShowRequestErrorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowRequestErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
