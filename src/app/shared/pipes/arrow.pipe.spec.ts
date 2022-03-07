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
import { arrowDirection, ArrowPipe } from './arrow.pipe';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

describe('ArrowPipe', () => {
  type Caller = {
    [key: string] : number;
};
let callcount: Caller;
const incrementCount = (value: string, type: string) => {
    callcount[type]++;
    return value;
};
const mockSanitizer = {
    sanitize: (ctx: any, val: string) => {
        return val; },
    bypassSecurityTrustHtml: (val: string) => { return incrementCount(val, 'html'); },
    bypassSecurityTrustStyle: (val: string) => { return incrementCount(val, 'style'); },
    bypassSecurityTrustScript: (val: string) => { return incrementCount(val, 'script'); },
    bypassSecurityTrustUrl: (val: string) => { return incrementCount(val, 'url'); },
    bypassSecurityTrustResourceUrl: (val: string) => { return incrementCount(val, 'resourceUrl'); },
};
let pipe : ArrowPipe;
beforeEach(() => {
    TestBed.configureTestingModule({
        providers: [
          ArrowPipe,
            {
            provide: DomSanitizer,
            useValue: mockSanitizer
            },
        ]
    }
    );
    callcount = {
        html: 0,
        style: 0,
        script: 0,
        url: 0,
        resourceUrl: 0,
    };
    pipe = TestBed.inject(ArrowPipe);
});

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('create down angle arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.angle_down);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-angle-down"></i>');
  });

  it('create up angle arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.angle_up);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-angle-up"></i>');
  });

  it('create left angle arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.angle_left);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-angle-left"></i>');
  });

  it('create right angle arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.angle_right);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-angle-right"></i>');
  });

  it('create down arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.arrow_down);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-arrow-down"></i>');
  });

  it('create up arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.arrow_up);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-arrow-up"></i>');
  });

  it('create left arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.arrow_left);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-arrow-left"></i>');
  });

  it('create right arrow', () => {
    const html: SafeHtml = pipe.transform('html', arrowDirection.arrow_right);
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
    expect(html).toBe('html <i class="fas fa-arrow-right"></i>');
  });
});
