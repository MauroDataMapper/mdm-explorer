import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdeMainComponent } from './sde-main.component';

describe('SdeMainComponent', () => {
  let component: SdeMainComponent;
  let fixture: ComponentFixture<SdeMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SdeMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SdeMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
