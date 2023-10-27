import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdeSignInComponent } from './sde-sign-in.component';

describe('SdeSignInComponent', () => {
  let component: SdeSignInComponent;
  let fixture: ComponentFixture<SdeSignInComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdeSignInComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdeSignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
