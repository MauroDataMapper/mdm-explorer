import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkRowComponent } from './bookmark-row.component';

describe('BookmarkRowComponent', () => {
  let component: BookmarkRowComponent;
  let fixture: ComponentFixture<BookmarkRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookmarkRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookmarkRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
