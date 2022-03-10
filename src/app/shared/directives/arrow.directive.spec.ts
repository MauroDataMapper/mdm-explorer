import { TestBed } from '@angular/core/testing';
import { ArrowDirective } from './arrow.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('ArrowDirective', () => {
  const mockRenderer = {
    createElement: jest.fn(),
    addClass: jest.fn(),
    appendChild: jest.fn(),
  };
  const mockElement = new ElementRef({});

  let directive: ArrowDirective;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ArrowDirective,
        {
          provide: Renderer2,
          useValue: mockRenderer,
        },
        {
          provide: ElementRef,
          useValue: mockElement,
        },
      ],
    });
    directive = TestBed.inject(ArrowDirective);
    mockRenderer.addClass.mockClear();
    mockRenderer.appendChild.mockClear();
    mockRenderer.createElement.mockClear();
  });

  it('create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('create down angle arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'angle-down';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-angle-down');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create up angle arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'angle-up';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-angle-up');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create left angle arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'angle-left';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-angle-left');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create right angle arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'angle-right';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-angle-right');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create down arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'arrow-down';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-arrow-down');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create up arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'arrow-up';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-arrow-up');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create left arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'arrow-left';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-arrow-left');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });

  it('create right arrow', () => {
    let fakeNewElement: ElementRef = new ElementRef({ tagName: 'span' });
    mockRenderer.createElement.mockReturnValue(fakeNewElement);
    directive.mdmArrow = 'arrow-right';
    directive.ngOnInit();
    expect(mockRenderer.createElement.mock.calls.length).toBe(1);
    expect(mockRenderer.createElement.mock.calls[0][0]).toBe('span');
    expect(mockRenderer.addClass.mock.calls.length).toBe(2);
    expect(mockRenderer.addClass.mock.calls[0][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[0][1]).toBe('fas');
    expect(mockRenderer.addClass.mock.calls[1][0].nativeElement.tagName).toBe('span');
    expect(mockRenderer.addClass.mock.calls[1][1]).toBe('fa-arrow-right');
    expect(mockRenderer.appendChild.mock.calls.length).toBe(1);
    expect(mockRenderer.appendChild.mock.calls[0][0].tagName).toBeUndefined();
    expect(mockRenderer.appendChild.mock.calls[0][1].nativeElement.tagName).toBe('span');
  });
});
