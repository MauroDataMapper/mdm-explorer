import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MdmShowErrorComponent } from './mdm-show-error.component';

describe('ShowRequestErrorComponent', () => {
  let component: MdmShowErrorComponent;
  let fixture: ComponentFixture<MdmShowErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MdmShowErrorComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MdmShowErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
