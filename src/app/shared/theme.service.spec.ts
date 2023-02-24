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
import { setupTestModuleForService } from '../testing/testing.helpers';
import { expect } from '@jest/globals';
import { ThemeService } from './theme.service';

const toHaveCssVariable = (
  style: CSSStyleDeclaration,
  name: string,
  expected: string
) => {
  const actual = style.getPropertyValue(name);
  const pass = Object.is(actual, expected);

  return {
    actual,
    expected,
    pass,
    message: pass
      ? () => `Expected CSS variable "${name}" to be "${expected}"`
      : () => `Expected CSS variable "${name}" to be "${expected}" but got "${actual}"`,
  };
};

// Extend jest with custom matcher (including type definition)
expect.extend({ toHaveCssVariable });

declare module 'expect' {
  interface Matchers<R> {
    toHaveCssVariable(name: string, expected: string): R;
  }
}

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    service = setupTestModuleForService(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // TODO: write tests for loadTheme() when actively loading theme data from server

  const expectCssVariable = (name: string, expected: string) => {
    expect(document.documentElement.style).toHaveCssVariable(name, expected);
  };

  describe('apply theme', () => {
    const theme = {
      material: {
        colors: {
          primary: '#19381f',
          accent: '#cdb980',
          warn: '#a5122a',
        },
        // Default typography settings taken from
        // https://github.com/angular/components/blob/main/src/material/core/typography/_typography.scss
        typography: {
          fontFamily: 'Roboto, "Helvetica Neue", sans-serif',
          body1: {
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 400,
          },
          body2: {
            fontSize: '14px',
            lineHeight: '24px',
            fontWeight: 500,
          },
          headline: {
            fontSize: '24px',
            lineHeight: '32px',
            fontWeight: 400,
          },
          title: {
            fontSize: '20px',
            lineHeight: '32px',
            fontWeight: 500,
          },
          subheading2: {
            fontSize: '16px',
            lineHeight: '28px',
            fontWeight: 400,
          },
          subheading1: {
            fontSize: '15px',
            lineHeight: '24px',
            fontWeight: 400,
          },
          button: {
            fontSize: '14px',
            lineHeight: '14px',
            fontWeight: 500,
          },
          input: {
            fontSize: 'inherit',
            fontWeight: 400,
          },
        },
      },
      regularColors: {
        hyperlink: '#003752',
        requestCount: '#ffe603',
      },
      contrastColors: {
        page: '#fff',
        unsentRequest: '#68d4ca',
        submittedRequest: '#008bce',
        classRow: '#c4c4c4',
      },
    };

    beforeEach(() => {
      service.applyTheme(theme);
    });

    it('should set the Material "primary" color palette', () => {
      expectCssVariable('--theme-mat-primary-50', '#e3e7e4');
      expectCssVariable('--theme-mat-primary-contrast-50', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-primary-100', '#bac3bc');
      expectCssVariable('--theme-mat-primary-contrast-100', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-primary-200', '#8c9c8f');
      expectCssVariable('--theme-mat-primary-contrast-200', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-primary-300', '#5e7462');
      expectCssVariable('--theme-mat-primary-contrast-300', 'white');
      expectCssVariable('--theme-mat-primary-400', '#3c5641');
      expectCssVariable('--theme-mat-primary-contrast-400', 'white');
      expectCssVariable('--theme-mat-primary-500', '#19381f');
      expectCssVariable('--theme-mat-primary-contrast-500', 'white');
      expectCssVariable('--theme-mat-primary-600', '#16321b');
      expectCssVariable('--theme-mat-primary-contrast-600', 'white');
      expectCssVariable('--theme-mat-primary-700', '#122b17');
      expectCssVariable('--theme-mat-primary-contrast-700', 'white');
      expectCssVariable('--theme-mat-primary-800', '#0e2412');
      expectCssVariable('--theme-mat-primary-contrast-800', 'white');
      expectCssVariable('--theme-mat-primary-900', '#08170a');
      expectCssVariable('--theme-mat-primary-contrast-900', 'white');
      expectCssVariable('--theme-mat-primary-A100', '#58ff69');
      expectCssVariable('--theme-mat-primary-contrast-A100', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-primary-A200', '#25ff3b');
      expectCssVariable('--theme-mat-primary-contrast-A200', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-primary-A400', '#00f118');
      expectCssVariable('--theme-mat-primary-contrast-A400', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-primary-A700', '#00d816');
      expectCssVariable('--theme-mat-primary-contrast-A700', 'rgba(black, 0.87)');
    });

    it('should set the Material "accent" color palette', () => {
      expectCssVariable('--theme-mat-accent-50', '#f9f7f0');
      expectCssVariable('--theme-mat-accent-contrast-50', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-100', '#f0ead9');
      expectCssVariable('--theme-mat-accent-contrast-100', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-200', '#e6dcc0');
      expectCssVariable('--theme-mat-accent-contrast-200', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-300', '#dccea6');
      expectCssVariable('--theme-mat-accent-contrast-300', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-400', '#d5c493');
      expectCssVariable('--theme-mat-accent-contrast-400', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-500', '#cdb980');
      expectCssVariable('--theme-mat-accent-contrast-500', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-600', '#c8b278');
      expectCssVariable('--theme-mat-accent-contrast-600', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-700', '#c1aa6d');
      expectCssVariable('--theme-mat-accent-contrast-700', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-800', '#baa263');
      expectCssVariable('--theme-mat-accent-contrast-800', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-900', '#ae9350');
      expectCssVariable('--theme-mat-accent-contrast-900', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-A100', '#ffffff');
      expectCssVariable('--theme-mat-accent-contrast-A100', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-A200', '#fff4db');
      expectCssVariable('--theme-mat-accent-contrast-A200', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-A400', '#ffe5a8');
      expectCssVariable('--theme-mat-accent-contrast-A400', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-accent-A700', '#ffdd8f');
      expectCssVariable('--theme-mat-accent-contrast-A700', 'rgba(black, 0.87)');
    });

    it('should set the Material "warn" color palette', () => {
      expectCssVariable('--theme-mat-warn-50', '#f4e3e5');
      expectCssVariable('--theme-mat-warn-contrast-50', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-warn-100', '#e4b8bf');
      expectCssVariable('--theme-mat-warn-contrast-100', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-warn-200', '#d28995');
      expectCssVariable('--theme-mat-warn-contrast-200', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-warn-300', '#c0596a');
      expectCssVariable('--theme-mat-warn-contrast-300', 'white');
      expectCssVariable('--theme-mat-warn-400', '#b3364a');
      expectCssVariable('--theme-mat-warn-contrast-400', 'white');
      expectCssVariable('--theme-mat-warn-500', '#a5122a');
      expectCssVariable('--theme-mat-warn-contrast-500', 'white');
      expectCssVariable('--theme-mat-warn-600', '#9d1025');
      expectCssVariable('--theme-mat-warn-contrast-600', 'white');
      expectCssVariable('--theme-mat-warn-700', '#930d1f');
      expectCssVariable('--theme-mat-warn-contrast-700', 'white');
      expectCssVariable('--theme-mat-warn-800', '#8a0a19');
      expectCssVariable('--theme-mat-warn-contrast-800', 'white');
      expectCssVariable('--theme-mat-warn-900', '#79050f');
      expectCssVariable('--theme-mat-warn-contrast-900', 'white');
      expectCssVariable('--theme-mat-warn-A100', '#ffa8ac');
      expectCssVariable('--theme-mat-warn-contrast-A100', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-warn-A200', '#ff757b');
      expectCssVariable('--theme-mat-warn-contrast-A200', 'rgba(black, 0.87)');
      expectCssVariable('--theme-mat-warn-A400', '#ff424a');
      expectCssVariable('--theme-mat-warn-contrast-A400', 'white');
      expectCssVariable('--theme-mat-warn-A700', '#ff2832');
      expectCssVariable('--theme-mat-warn-contrast-A700', 'white');
    });

    it('should set the Material typography values', () => {
      expectCssVariable(
        '--theme-mat-typography-font-family',
        'Roboto, "Helvetica Neue", sans-serif'
      );
      expectCssVariable('--theme-mat-typography-body1-font-size', '14px');
      expectCssVariable('--theme-mat-typography-body1-line-height', '20px');
      expectCssVariable('--theme-mat-typography-body1-font-weight', '400');
      expectCssVariable('--theme-mat-typography-body2-font-size', '14px');
      expectCssVariable('--theme-mat-typography-body2-line-height', '24px');
      expectCssVariable('--theme-mat-typography-body2-font-weight', '500');
      expectCssVariable('--theme-mat-typography-headline-font-size', '24px');
      expectCssVariable('--theme-mat-typography-headline-line-height', '32px');
      expectCssVariable('--theme-mat-typography-headline-font-weight', '400');
      expectCssVariable('--theme-mat-typography-title-font-size', '20px');
      expectCssVariable('--theme-mat-typography-title-line-height', '32px');
      expectCssVariable('--theme-mat-typography-title-font-weight', '500');
      expectCssVariable('--theme-mat-typography-subheading2-font-size', '16px');
      expectCssVariable('--theme-mat-typography-subheading2-line-height', '28px');
      expectCssVariable('--theme-mat-typography-subheading2-font-weight', '400');
      expectCssVariable('--theme-mat-typography-subheading1-font-size', '15px');
      expectCssVariable('--theme-mat-typography-subheading1-line-height', '24px');
      expectCssVariable('--theme-mat-typography-subheading1-font-weight', '400');
      expectCssVariable('--theme-mat-typography-button-font-size', '14px');
      expectCssVariable('--theme-mat-typography-button-line-height', '14px');
      expectCssVariable('--theme-mat-typography-button-font-weight', '500');
      expectCssVariable('--theme-mat-typography-input-font-size', 'inherit');
      expectCssVariable('--theme-mat-typography-input-font-weight', '400');
    });

    it('should set application colours', () => {
      expectCssVariable('--theme-color-primary', '#19381f');
      expectCssVariable('--theme-color-primary-light', '#409050');
      expectCssVariable('--theme-color-primary-dark', '#19381f');
      expectCssVariable('--theme-color-primary-contrast', 'white');

      expectCssVariable('--theme-color-accent', '#cdb980');
      expectCssVariable('--theme-color-accent-light', '#f1ebdb');
      expectCssVariable('--theme-color-accent-dark', '#cdb980');
      expectCssVariable('--theme-color-accent-contrast', 'rgba(black, 0.87)');

      expectCssVariable('--theme-color-warn', '#a5122a');
      expectCssVariable('--theme-color-warn-light', '#eb4b65');
      expectCssVariable('--theme-color-warn-dark', '#a5122a');
      expectCssVariable('--theme-color-warn-contrast', 'white');

      expectCssVariable('--theme-color-page', '#ffffff');
      expectCssVariable('--theme-color-page-contrast', 'rgba(black, 0.87)');
      expectCssVariable('--theme-color-unsentRequest', '#68d4ca');
      expectCssVariable('--theme-color-unsentRequest-contrast', 'rgba(black, 0.87)');
      expectCssVariable('--theme-color-submittedRequest', '#008bce');
      expectCssVariable('--theme-color-submittedRequest-contrast', 'white');
      expectCssVariable('--theme-color-classRow', '#c4c4c4');
      expectCssVariable('--theme-color-classRow-contrast', 'rgba(black, 0.87)');
      expectCssVariable('--theme-color-hyperlink', '#003752');
      expectCssVariable('--theme-color-requestCount', '#ffe603');
    });
  });
});