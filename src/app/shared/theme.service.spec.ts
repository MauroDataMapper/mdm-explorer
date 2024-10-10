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
import { defaultTheme, ThemeService } from './theme.service';
import { createResearchPluginServiceStub } from '../testing/stubs/research-plugin.stub';
import { ResearchPluginService } from '../mauro/research-plugin.service';
import { cold, ObservableWithSubscriptions } from 'jest-marbles';

const toHaveCssVariable = (style: CSSStyleDeclaration, name: string, expected: string) => {
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
    toBeObservable(observable: ObservableWithSubscriptions): void;
  }
}

describe('ThemeService', () => {
  let service: ThemeService;
  const researchPluginStub = createResearchPluginServiceStub();

  beforeEach(() => {
    service = setupTestModuleForService(ThemeService, {
      providers: [
        {
          provide: ResearchPluginService,
          useValue: researchPluginStub,
        },
      ],
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('load theme', () => {
    it('should return the default theme if unable to fetch from server', () => {
      researchPluginStub.theme.mockImplementationOnce(() =>
        cold('#', null, new Error('Server error'))
      );

      const expected$ = cold('(a|)', { a: defaultTheme });
      const actual$ = service.loadTheme();
      expect(actual$).toBeObservable(expected$);
    });

    it('should return a non-default theme from the server and merged with defaults', () => {
      // Arrange
      const primaryColor = '#ff0000';
      const accentColor = '#00ff00';
      const warnColor = '#0000ff';
      const fontFamily = 'Comic Sans';
      const buttonTypeSettings = ['24px', '16px', '700'];
      const body1TypeSettings = ['32px', '12px', '500'];
      const pageColor = '#f0f0f0';

      const changes = {
        'material.colors.primary': primaryColor,
        'material.colors.accent': accentColor,
        'material.colors.warn': warnColor,
        'material.typography.fontfamily': fontFamily,
        'material.typography.button': buttonTypeSettings.join(', '), // Intentional: test with ", " separator
        'material.typography.bodyone': body1TypeSettings.join(','), // Intentional: test with "," separator (without space)
        'contrastcolors.page': pageColor,
      };

      researchPluginStub.theme.mockImplementationOnce(() => {
        const items = Object.entries(changes).map(([key, value]) => {
          return {
            id: '123',
            key,
            value,
          };
        });
        return cold('--a|', { a: items });
      });

      // Build an expected theme, starting with the default as a base and
      // making some adjustments to show it's not entirely the same
      const expectedTheme = {
        ...defaultTheme,
        material: {
          colors: {
            primary: primaryColor,
            accent: accentColor,
            warn: warnColor,
          },
          typography: {
            ...defaultTheme.material.typography,
            fontFamily,
            button: {
              fontSize: buttonTypeSettings[0],
              lineHeight: buttonTypeSettings[1],
              fontWeight: buttonTypeSettings[2],
            },
            body1: {
              fontSize: body1TypeSettings[0],
              lineHeight: body1TypeSettings[1],
              fontWeight: body1TypeSettings[2],
            },
          },
        },
        contrastColors: {
          ...defaultTheme.contrastColors,
          page: pageColor,
        },
      };

      // Act
      const actual$ = service.loadTheme();

      // Assert
      const expected$ = cold('--a|', { a: expectedTheme });
      expect(actual$).toBeObservable(expected$);
    });
  });

  const expectCssVariable = (name: string, expected: string) => {
    expect(document.documentElement.style).toHaveCssVariable(name, expected);
  };

  describe('apply theme', () => {
    beforeEach(() => {
      service.applyTheme(defaultTheme);
    });

    it('should set the Material "primary" color palette', () => {
      expectCssVariable('--theme-mat-primary-50', '#e0e6f0');
      expectCssVariable('--theme-mat-primary-contrast-50', '#003186');
      expectCssVariable('--theme-mat-primary-100', '#b3c1db');
      expectCssVariable('--theme-mat-primary-contrast-100', '#003186');
      expectCssVariable('--theme-mat-primary-200', '#8098c3');
      expectCssVariable('--theme-mat-primary-contrast-200', '#003186');
      expectCssVariable('--theme-mat-primary-300', '#4d6faa');
      expectCssVariable('--theme-mat-primary-contrast-300', 'white');
      expectCssVariable('--theme-mat-primary-400', '#265098');
      expectCssVariable('--theme-mat-primary-contrast-400', 'white');
      expectCssVariable('--theme-mat-primary-500', '#003186');
      expectCssVariable('--theme-mat-primary-contrast-500', 'white');
      expectCssVariable('--theme-mat-primary-600', '#002c7e');
      expectCssVariable('--theme-mat-primary-contrast-600', 'white');
      expectCssVariable('--theme-mat-primary-700', '#002573');
      expectCssVariable('--theme-mat-primary-contrast-700', 'white');
      expectCssVariable('--theme-mat-primary-800', '#001f69');
      expectCssVariable('--theme-mat-primary-contrast-800', 'white');
      expectCssVariable('--theme-mat-primary-900', '#001356');
      expectCssVariable('--theme-mat-primary-contrast-900', 'white');
      expectCssVariable('--theme-mat-primary-A100', '#8897ff');
      expectCssVariable('--theme-mat-primary-contrast-A100', '#003186');
      expectCssVariable('--theme-mat-primary-A200', '#556bff');
      expectCssVariable('--theme-mat-primary-contrast-A200', 'white');
      expectCssVariable('--theme-mat-primary-A400', '#223eff');
      expectCssVariable('--theme-mat-primary-contrast-A400', 'white');
      expectCssVariable('--theme-mat-primary-A700', '#0828ff');
      expectCssVariable('--theme-mat-primary-contrast-A700', 'white');
    });

    it('should set the Material "accent" color palette', () => {
      expectCssVariable('--theme-mat-accent-50', '#ebeff6');
      expectCssVariable('--theme-mat-accent-contrast-50', '#003186');
      expectCssVariable('--theme-mat-accent-100', '#ccd6e8');
      expectCssVariable('--theme-mat-accent-contrast-100', '#003186');
      expectCssVariable('--theme-mat-accent-200', '#abbbd9');
      expectCssVariable('--theme-mat-accent-contrast-200', '#003186');
      expectCssVariable('--theme-mat-accent-300', '#89a0c9');
      expectCssVariable('--theme-mat-accent-contrast-300', '#003186');
      expectCssVariable('--theme-mat-accent-400', '#6f8bbe');
      expectCssVariable('--theme-mat-accent-contrast-400', '#003186');
      expectCssVariable('--theme-mat-accent-500', '#5677b2');
      expectCssVariable('--theme-mat-accent-contrast-500', 'white');
      expectCssVariable('--theme-mat-accent-600', '#4f6fab');
      expectCssVariable('--theme-mat-accent-contrast-600', 'white');
      expectCssVariable('--theme-mat-accent-700', '#4564a2');
      expectCssVariable('--theme-mat-accent-contrast-700', 'white');
      expectCssVariable('--theme-mat-accent-800', '#3c5a99');
      expectCssVariable('--theme-mat-accent-contrast-800', 'white');
      expectCssVariable('--theme-mat-accent-900', '#2b478a');
      expectCssVariable('--theme-mat-accent-contrast-900', 'white');
      expectCssVariable('--theme-mat-accent-A100', '#cfdcff');
      expectCssVariable('--theme-mat-accent-contrast-A100', '#003186');
      expectCssVariable('--theme-mat-accent-A200', '#9cb7ff');
      expectCssVariable('--theme-mat-accent-contrast-A200', '#003186');
      expectCssVariable('--theme-mat-accent-A400', '#6992ff');
      expectCssVariable('--theme-mat-accent-contrast-A400', '#003186');
      expectCssVariable('--theme-mat-accent-A700', '#4f7fff');
      expectCssVariable('--theme-mat-accent-contrast-A700', 'white');
    });

    it('should set the Material "warn" color palette', () => {
      expectCssVariable('--theme-mat-warn-50', '#f4e3e5');
      expectCssVariable('--theme-mat-warn-contrast-50', '#003186');
      expectCssVariable('--theme-mat-warn-100', '#e4b8bf');
      expectCssVariable('--theme-mat-warn-contrast-100', '#003186');
      expectCssVariable('--theme-mat-warn-200', '#d28995');
      expectCssVariable('--theme-mat-warn-contrast-200', '#003186');
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
      expectCssVariable('--theme-mat-warn-contrast-A100', '#003186');
      expectCssVariable('--theme-mat-warn-A200', '#ff757b');
      expectCssVariable('--theme-mat-warn-contrast-A200', '#003186');
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
      expectCssVariable('--theme-color-primary', '#003186');
      expectCssVariable('--theme-color-primary-light', '#0661ff');
      expectCssVariable('--theme-color-primary-dark', '#003186');
      expectCssVariable('--theme-color-primary-contrast', 'white');

      expectCssVariable('--theme-color-accent', '#5677b2');
      expectCssVariable('--theme-color-accent-light', '#aebdda');
      expectCssVariable('--theme-color-accent-dark', '#5677b2');
      expectCssVariable('--theme-color-accent-contrast', '#003186');

      expectCssVariable('--theme-color-warn', '#a5122a');
      expectCssVariable('--theme-color-warn-light', '#eb4b65');
      expectCssVariable('--theme-color-warn-dark', '#a5122a');
      expectCssVariable('--theme-color-warn-contrast', '#003186');

      expectCssVariable('--theme-color-page', '#ffffff');
      expectCssVariable('--theme-color-page-contrast', '#003186');
      expectCssVariable('--theme-color-draftDataSpecification', '#008bce');
      expectCssVariable('--theme-color-draftDataSpecification-contrast', 'white');
      expectCssVariable('--theme-color-submittedDataSpecification', '#0e8f48');
      expectCssVariable('--theme-color-submittedDataSpecification-contrast', 'white');
      expectCssVariable('--theme-color-finalisedDataSpecification', '#b86c02');
      expectCssVariable('--theme-color-finalisedDataSpecification-contrast', 'white');
      expectCssVariable('--theme-color-classRow', '#c4c4c4');
      expectCssVariable('--theme-color-classRow-contrast', '#003186');
      expectCssVariable('--theme-color-hyperlink', '#003752');
      expectCssVariable('--theme-color-dataSpecificationCount', '#ffe603');
    });
  });
});
