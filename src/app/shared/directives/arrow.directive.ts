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
import { Directive, ElementRef, Input, Renderer2, OnInit } from '@angular/core';

@Directive({
  selector: '[mdmArrow]',
})
export class ArrowDirective implements OnInit {
  @Input() mdmArrow?: ArrowDirection = 'arrow-down';

  constructor(private element: ElementRef, private renderer: Renderer2) {}

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
    const newElement: ElementRef = this.renderer.createElement('span');
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
