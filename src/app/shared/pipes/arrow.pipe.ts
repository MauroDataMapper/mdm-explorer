/*
Copyright 2022 University of Oxford
and Health and Social Care Information Centre, also known as NHS Digital

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

SPDX-License-Identifier: Apache-2.0
*/
import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';



export enum arrowDirection {
  arrow_up = 1,
  arrow_right,
  arrow_down,
  arrow_left,
  angle_up,
  angle_right,
  angle_down,
  angle_left,
};


@Pipe({
  name: 'arrow'
})
export class ArrowPipe implements PipeTransform {

  constructor(protected sanitizer: DomSanitizer) {}

  transform(value: any, direction?: arrowDirection): SafeHtml {
    let arrow = '';
    switch (direction) {
      case arrowDirection.angle_up:
        arrow = '<i class="fas fa-angle-up"></i>';
        break;
      case arrowDirection.angle_right:
        arrow = '<i class="fas fa-angle-right"></i>';
        break;
      case arrowDirection.angle_down:
        arrow = '<i class="fas fa-angle-down"></i>';
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
          arrow = '<i class="fas fa-arrow-down"></i>';
          break;
        case arrowDirection.arrow_left:
          arrow = '<i class="fas fa-arrow-left"></i>';
          break;
    }
    return this.sanitizer.bypassSecurityTrustHtml((value as string) + ' ' + arrow);
  };

};

