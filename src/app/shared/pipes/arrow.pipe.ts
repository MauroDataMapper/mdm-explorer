import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { doesNotThrow } from 'assert';

@Pipe({
  name: 'arrow'
})
export class ArrowPipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: any, direction?: arrowDirection): SafeHtml {
    let arrow: string = '';
    switch (direction) {
      case arrowDirection.angle_up: 
        arrow = '<i class="fas fa-angle-up"></i>';
        break;
      case arrowDirection.angle_right:
        arrow = '<i class="fas fa-angle-right"></i>';
        break;
      case arrowDirection.angle_down:
        arrow = '<i class="fas fa-angle-down"></i>'
        break;
      case arrowDirection.angle_left:
        arrow = '<i class="fas fa-angle-left"></i>';
        break;
        case arrowDirection.arrow_up: 
          arrow = '<i class="fas fa-arrow-up"></i>';
          break;
        case arrowDirection.arrow_right:
          arrow = '<i class="fas fa-arrow-right"></i>';
          break;
        case arrowDirection.arrow_down:
          arrow = '<i class="fas fa-arrow-down"></i>'
          break;
        case arrowDirection.arrow_left:
          arrow = '<i class="fas fa-arrow-left"></i>';
          break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(value + ' ' + arrow);
  }

}

export enum arrowDirection {
  arrow_up = 1,
  arrow_right,
  arrow_down,
  arrow_left,
  angle_up,
  angle_right,
  angle_down,
  angle_left

}
