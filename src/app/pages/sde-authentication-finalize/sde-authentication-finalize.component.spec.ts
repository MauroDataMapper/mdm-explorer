import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdeAuthenticationFinalizeComponent } from './sde-authentication-finalize.component';

describe('SdeAuthenticationFinalizeComponent', () => {
  let component: SdeAuthenticationFinalizeComponent;
  let fixture: ComponentFixture<SdeAuthenticationFinalizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdeAuthenticationFinalizeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdeAuthenticationFinalizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
