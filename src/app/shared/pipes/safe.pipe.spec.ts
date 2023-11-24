/*
Copyright 2022-2023 University of Oxford
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
import { SafePipe } from './safe.pipe';
import { DomSanitizer } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

describe('SafePipe', () => {
  type Caller = {
    [key: string]: number;
  };
  let callcount: Caller;
  const incrementCount = (value: string, type: string) => {
    callcount[type]++;
    return value;
  };
  const mockSanitizer = {
    sanitize: (ctx: any, val: string) => {
      return val;
    },
    bypassSecurityTrustHtml: (val: string) => {
      return incrementCount(val, 'html');
    },
    bypassSecurityTrustStyle: (val: string) => {
      return incrementCount(val, 'style');
    },
    bypassSecurityTrustScript: (val: string) => {
      return incrementCount(val, 'script');
    },
    bypassSecurityTrustUrl: (val: string) => {
      return incrementCount(val, 'url');
    },
    bypassSecurityTrustResourceUrl: (val: string) => {
      return incrementCount(val, 'resourceUrl');
    },
  };
  let pipe: SafePipe;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SafePipe,
        {
          provide: DomSanitizer,
          useValue: mockSanitizer,
        },
      ],
    });
    callcount = {
      html: 0,
      style: 0,
      script: 0,
      url: 0,
      resourceUrl: 0,
    };
    pipe = TestBed.inject(SafePipe);
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });
  it('calls bypassSecurityTrustHtml once', () => {
    pipe.transform('a string', 'html');
    expect(callcount['html']).toBe(1);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
  });

  it('calls bypassSecurityTrustStyle once', () => {
    pipe.transform('a string', 'style');
    expect(callcount['html']).toBe(0);
    expect(callcount['style']).toBe(1);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
  });

  it('calls bypassSecurityTrustScript once', () => {
    pipe.transform('a string', 'script');
    expect(callcount['html']).toBe(0);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(1);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(0);
  });

  it('calls bypassSecurityTrustUrl once', () => {
    pipe.transform('a string', 'url');
    expect(callcount['html']).toBe(0);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(1);
    expect(callcount['resourceUrl']).toBe(0);
  });

  it('calls bypassSecurityTrustResourceUrl once', () => {
    pipe.transform('a string', 'resourceUrl');
    expect(callcount['html']).toBe(0);
    expect(callcount['style']).toBe(0);
    expect(callcount['script']).toBe(0);
    expect(callcount['url']).toBe(0);
    expect(callcount['resourceUrl']).toBe(1);
  });

  it('throws exception for unknown operation', () => {
    expect(() => pipe.transform('a string', 'random')).toThrow(
      'Invalid safe type specified: random',
    );
  });
});
