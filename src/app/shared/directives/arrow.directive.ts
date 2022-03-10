import { Directive, ElementRef, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[mdmArrow]',
})
export class ArrowDirective {
  @Input() mdmArrow?: ArrowDirection = 'arrow-down';

  constructor(private element: ElementRef, private renderer: Renderer2) {
    let arrow = '';
  }

  ngOnInit(): void {
    let arrowClass = '';
    let fontAwesomeClass = 'fas';
    switch (this.mdmArrow) {
      case 'angle-up':
        arrowClass = 'fa-angle-up';
        break;
      case 'angle-right':
        arrowClass = 'fa-angle-right';
        break;
      case 'angle-down':
        arrowClass = 'fa-angle-down';
        break;
      case 'angle-left':
        arrowClass = 'fa-angle-left';
        break;
      case 'arrow-up':
        arrowClass = 'fa-arrow-up';
        break;
      case 'arrow-right':
        arrowClass = 'fa-arrow-right';
        break;
      case 'arrow-down':
        arrowClass = 'fa-arrow-down';
        break;
      case 'arrow-left':
        arrowClass = 'fa-arrow-left';
        break;
      default:
        fontAwesomeClass = '';
    }
    let newElement: ElementRef = this.renderer.createElement('span');
    this.renderer.addClass(newElement, fontAwesomeClass);
    this.renderer.addClass(newElement, arrowClass);
    this.renderer.appendChild(this.element.nativeElement, newElement);
  }
}

export type ArrowDirection =
  | 'arrow-up'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'angle-up'
  | 'angle-down'
  | 'angle-left'
  | 'angle-right';
