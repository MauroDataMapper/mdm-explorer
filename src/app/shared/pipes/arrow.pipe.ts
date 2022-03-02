import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'arrow'
})
export class ArrowPipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: any, direction?: arrowDirection): SafeHtml {
    let arrow: string = '';
    switch (direction) {
      case arrowDirection.up: 
        arrow = '&uarr;';
        break;
      case arrowDirection.right:
        arrow = '&rarr;';
        break;
      case arrowDirection.down:
        arrow = '&darr;';
        break;
      case arrowDirection.left:
        arrow = '&larr;';
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(value + ' ' + arrow);
  }

}

export enum arrowDirection {
  up = 1,
  right,
  down,
  left
}
