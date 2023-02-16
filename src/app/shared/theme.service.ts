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
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import tinycolor from 'tinycolor2';

/**
 * Represents the core colours to use for the colour palettes in an Angular Material theme.
 */
export interface ThemeMaterialColors {
  primary: string;
  accent: string;
  warn: string;
}

/**
 * Represents colours for basic components on a page.
 */
export interface ThemeRegularColors {
  hyperlink: string;
  requestCount: string;
}

/**
 * Represents colours for components that require a colour and a contrasting colour.
 * For instance, these colours may act as background colours, so a suitable contrasting colour
 * would be automatically determined for text on top of the background.
 */
export interface ThemeContrastColors {
  page: string;
  unsentRequest: string;
  submittedRequest: string;
}

/**
 * Represents typography settings for a particular level for an Angular Material theme.
 */
export interface ThemeMaterialTypographyLevel {
  fontSize: string | number;
  lineHeight?: string | number;
  fontWeight?: string | number;
}

/**
 * Represents typography settings for an Angular Material theme.
 */
export interface ThemeMaterialTypography {
  fontFamily: string;
  body1: ThemeMaterialTypographyLevel;
  body2: ThemeMaterialTypographyLevel;
  headline: ThemeMaterialTypographyLevel;
  title: ThemeMaterialTypographyLevel;
  subheading1: ThemeMaterialTypographyLevel;
  subheading2: ThemeMaterialTypographyLevel;
  button: ThemeMaterialTypographyLevel;
  input: ThemeMaterialTypographyLevel;
}

export interface ThemeMaterial {
  colors: ThemeMaterialColors;
  typography: ThemeMaterialTypography;
}

export interface Theme {
  material: ThemeMaterial;
  regularColors: ThemeRegularColors;
  contrastColors: ThemeContrastColors;
}

const defaultTheme: Theme = {
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
  },
};

const lightContrastTextColor = 'rgba(black, 0.87)';
const darkContrastTextColor = 'white';

interface Color {
  name: string;
  hex: string;
  isLight: boolean;
}

/**
 * Service for managing theming of the application.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  /**
   * Load the theme data required to apply to the application.
   *
   * @returns A {@link Theme} object containing all color and typography information.
   */
  loadTheme(): Observable<Theme> {
    // TODO: hardcoded for now, a later task must load this from the server
    return of(defaultTheme);
  }

  /**
   * Apply the given theme settings to the DOM.
   *
   * @param theme The theme to apply.
   *
   * All theme colour/typography values are calculated and mapped to custom CSS properties to reference
   * in CSS stylesheets at runtime.
   */
  applyTheme(theme: Theme) {
    this.applyMaterialPaletteToCss('primary', theme.material.colors.primary);
    this.applyMaterialPaletteToCss('accent', theme.material.colors.accent);
    this.applyMaterialPaletteToCss('warn', theme.material.colors.warn);
    this.applyTypographyToCss(theme.material.typography);
    this.applyAppColorsToCss(theme);
  }

  /**
   * Auto-generates a full Angular Material colour palette from a single colour and applies it to the DOM.
   *
   * @param paletteName The name of the palette.
   * @param baseHex The core colour of the palette.
   */
  private applyMaterialPaletteToCss(paletteName: string, baseHex: string) {
    const palette = this.computeMaterialPalette(baseHex);
    const cssValues = palette
      .map((color) => {
        return {
          [`--theme-mat-${paletteName}-${color.name}`]: color.hex,
          [`--theme-mat-${paletteName}-contrast-${color.name}`]: color.isLight
            ? lightContrastTextColor
            : darkContrastTextColor,
        };
      })
      .reduce((prev, current) => {
        return {
          ...prev,
          ...current,
        };
      }, {});

    this.applyCss(cssValues);
  }

  /**
   * Applies Angular Material typography settings to the DOM.
   *
   * @param typography The typography settings.
   *
   * See https://material.angular.io/guide/typography for understanding how typography works.
   */
  private applyTypographyToCss(typography: ThemeMaterialTypography) {
    const levels = Object.entries(typography)
      .filter(([property, _]) => property !== 'fontFamily')
      .map(([property, value]: [string, ThemeMaterialTypographyLevel]) =>
        this.computeTypographyLevel(property, value)
      )
      .reduce((prev, current) => {
        return {
          ...prev,
          ...current,
        };
      }, {});

    const cssValues = {
      '--theme-mat-typography-font-family': typography.fontFamily,
      ...levels,
    };

    this.applyCss(cssValues);
  }

  /**
   * Apply non-Material colours to the DOM.
   *
   * @param theme The theme to use.
   *
   * Although these colours affect components that are not from Angular Material, they still use the "primary", "accent" and "warn"
   * key colours as the basis for most other application components. Other colours (with some contrasting colours) are generated
   * for components which don't fit inside the core colour scheme.
   */
  private applyAppColorsToCss(theme: Theme) {
    const primary = this.computeAppCoreColors('primary', theme.material.colors.primary);
    this.applyCss(primary);

    const accent = this.computeAppCoreColors('accent', theme.material.colors.accent);
    this.applyCss(accent);

    const warn = this.computeAppCoreColors('warn', theme.material.colors.warn);
    this.applyCss(warn);

    const contrastColors = Object.entries(theme.contrastColors)
      .map(([property, value]) => this.computeContrastColors(property, value))
      .reduce((prev, current) => {
        return {
          ...prev,
          ...current,
        };
      }, {});

    this.applyCss(contrastColors);

    const regularColors = Object.entries(theme.regularColors).reduce(
      (prev, [property, value]) => {
        return {
          ...prev,
          [`--theme-color-${property}`]: tinycolor(value).toHexString(),
        };
      },
      {}
    );

    this.applyCss(regularColors);
  }

  /**
   * Apply a set of values to the DOM using CSS custom properties.
   */
  private applyCss(values: { [prop: string]: string | number }) {
    Object.entries(values).forEach(([property, value]) => {
      if (value) {
        document.documentElement.style.setProperty(property, value.toString());
      }
    });
  }

  /**
   * Use a single colour to generate the full colour palette for an Angular Material theme.
   *
   * @param baseHex The core colour of the palette to use.
   * @returns A full colour array generated from the base colour.
   *
   * See https://material.angular.io/guide/theming for understanding the colour palette structure.
   */
  private computeMaterialPalette(baseHex: string): Color[] {
    return [
      this.getColorObject(tinycolor(baseHex).lighten(52), '50'),
      this.getColorObject(tinycolor(baseHex).lighten(37), '100'),
      this.getColorObject(tinycolor(baseHex).lighten(26), '200'),
      this.getColorObject(tinycolor(baseHex).lighten(12), '300'),
      this.getColorObject(tinycolor(baseHex).lighten(6), '400'),
      this.getColorObject(tinycolor(baseHex), '500'),
      this.getColorObject(tinycolor(baseHex).darken(6), '600'),
      this.getColorObject(tinycolor(baseHex).darken(12), '700'),
      this.getColorObject(tinycolor(baseHex).darken(18), '800'),
      this.getColorObject(tinycolor(baseHex).darken(24), '900'),
      this.getColorObject(tinycolor(baseHex).lighten(50).saturate(30), 'A100'),
      this.getColorObject(tinycolor(baseHex).lighten(30).saturate(30), 'A200'),
      this.getColorObject(tinycolor(baseHex).lighten(10).saturate(15), 'A400'),
      this.getColorObject(tinycolor(baseHex).lighten(5).saturate(5), 'A700'),
    ];
  }

  private getColorObject(color: tinycolor.Instance, name: string): Color {
    return {
      name,
      hex: color.toHexString(),
      isLight: color.isLight(),
    };
  }

  private computeAppCoreColors(name: string, baseHex: string) {
    return {
      [`--theme-color-${name}`]: tinycolor(baseHex).toHexString(),
      [`--theme-color-${name}-light`]: tinycolor(baseHex).lighten(25).toHexString(),
      [`--theme-color-${name}-dark`]: tinycolor(baseHex).darken(25).toHexString(),
    };
  }

  private computeContrastColors(name: string, baseHex: string) {
    const color = tinycolor(baseHex);
    return {
      [`--theme-color-${name}`]: color.toHexString(),
      [`--theme-color-${name}-contrast`]: color.isLight()
        ? lightContrastTextColor
        : darkContrastTextColor,
    };
  }

  private computeTypographyLevel(name: string, level: ThemeMaterialTypographyLevel) {
    return {
      [`--theme-mat-typography-${name}-font-size`]: level.fontSize,
      [`--theme-mat-typography-${name}-line-height`]: level.lineHeight,
      [`--theme-mat-typography-${name}-font-weight`]: level.fontWeight,
    };
  }
}
