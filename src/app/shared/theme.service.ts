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
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import tinycolor, { ColorFormats } from 'tinycolor2';
import { getKviValue, KeyValueIdentifier } from '../mauro/mauro.types';
import { ResearchPluginService } from '../mauro/research-plugin.service';
import { isUuid } from './types/shared.types';

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
  classRow: string;
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
  images: ThemeImages;
}

export interface ThemeImages {
  header: ThemeHeaderImages;
}

export interface ThemeHeaderImages {
  logo: ThemeImageUrl;
}

export const defaultTheme: Theme = {
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
    unsentRequest: '#008bce',
    submittedRequest: '#0e8f77',
    classRow: '#c4c4c4',
  },
  images: {
    header: {
      logo: {
        url: undefined,
      },
    },
  },
};

const mapKviToTypographyLevel = (
  items: KeyValueIdentifier[],
  key: string,
  defaultValue: ThemeMaterialTypographyLevel
) => {
  const value = getKviValue(items, key, '');
  if (value === '') {
    return defaultValue;
  }

  // Remove unecessary whitespace before comma split
  // Format should be "fontSize, lineHeight, fontWeight"
  const parts = value.replace(/\s/g, '').split(',');
  if (parts.length !== 3) {
    console.warn(
      `Theme value "${key}" does not have 3 values. Got "${value}", expected "fontSize, lineHeight, fontWeight"`
    );
    return defaultValue;
  }

  return {
    fontSize: parts[0],
    lineHeight: parts[1],
    fontWeight: parts[2],
  };
};

const lightContrastTextColor = 'rgba(black, 0.87)';
const darkContrastTextColor = 'white';

interface Color {
  name: string;
  hex: string;
  isLight: boolean;
}

export interface ThemeImageUrl {
  url?: string;
}

/**
 * Service for managing theming of the application.
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  constructor(private researchPlugin: ResearchPluginService) {}

  private static multiply(rgb1: ColorFormats.RGBA, rgb2: ColorFormats.RGBA) {
    rgb1.b = Math.floor((rgb1.b * rgb2.b) / 255);
    rgb1.g = Math.floor((rgb1.g * rgb2.g) / 255);
    rgb1.r = Math.floor((rgb1.r * rgb2.r) / 255);
    return tinycolor(`rgb ${rgb1.r} ${rgb1.g} ${rgb1.b}`);
  }

  /**
   * Load the theme data required to apply to the application.
   *
   * @returns A {@link Theme} object containing all color and typography information.
   */
  loadTheme(): Observable<Theme> {
    return this.researchPlugin.theme().pipe(
      catchError((error) => {
        // Ensure that there is always a theme returned
        console.error(error);
        return of(undefined);
      }),
      map((props) => (props ? this.mapValuesToTheme(props) : defaultTheme))
    );
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

  private getImageUrl(value: string): string | undefined {
    return value && isUuid(value)
      ? `${environment.apiEndpoint}/themeImageFiles/${value}`
      : undefined;
  }

  private mapValuesToTheme(props: KeyValueIdentifier[]): Theme {
    return {
      material: {
        colors: {
          primary: getKviValue(
            props,
            'material.colors.primary',
            defaultTheme.material.colors.primary
          ),
          accent: getKviValue(
            props,
            'material.colors.accent',
            defaultTheme.material.colors.accent
          ),
          warn: getKviValue(
            props,
            'material.colors.warn',
            defaultTheme.material.colors.warn
          ),
        },
        typography: {
          fontFamily: getKviValue(
            props,
            'material.typography.fontfamily',
            defaultTheme.material.typography.fontFamily
          ),
          body1: mapKviToTypographyLevel(
            props,
            'material.typography.bodyone',
            defaultTheme.material.typography.body1
          ),
          body2: mapKviToTypographyLevel(
            props,
            'material.typography.bodytwo',
            defaultTheme.material.typography.body2
          ),
          headline: mapKviToTypographyLevel(
            props,
            'material.typography.headline',
            defaultTheme.material.typography.headline
          ),
          title: mapKviToTypographyLevel(
            props,
            'material.typography.title',
            defaultTheme.material.typography.title
          ),
          subheading1: mapKviToTypographyLevel(
            props,
            'material.typography.subheadingone',
            defaultTheme.material.typography.subheading1
          ),
          subheading2: mapKviToTypographyLevel(
            props,
            'material.typography.subheadingtwo',
            defaultTheme.material.typography.subheading2
          ),
          button: mapKviToTypographyLevel(
            props,
            'material.typography.button',
            defaultTheme.material.typography.button
          ),
          // Intentionally use hardcoded values for input typography, required for Angular Material theme to compile
          input: defaultTheme.material.typography.input,
        },
      },
      regularColors: {
        hyperlink: getKviValue(
          props,
          'regularcolors.hyperlink',
          defaultTheme.regularColors.hyperlink
        ),
        requestCount: getKviValue(
          props,
          'regularcolors.requestcount',
          defaultTheme.regularColors.requestCount
        ),
      },
      contrastColors: {
        page: getKviValue(props, 'contrastcolors.page', defaultTheme.contrastColors.page),
        unsentRequest: getKviValue(
          props,
          'contrastcolors.unsentrequest',
          defaultTheme.contrastColors.unsentRequest
        ),
        submittedRequest: getKviValue(
          props,
          'contrastcolors.submittedrequest',
          defaultTheme.contrastColors.submittedRequest
        ),
        classRow: getKviValue(
          props,
          'contrastcolors.classrow',
          defaultTheme.contrastColors.classRow
        ),
      },
      images: {
        header: {
          logo: {
            url: this.getImageUrl(getKviValue(props, 'images.header.logo', '')),
          },
        },
      },
    };
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
      .map(([property, value]) => this.computeContrastColors(property, value as string))
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
          [`--theme-color-${property}`]: tinycolor(value as string).toHexString(),
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
    // Use "constantin" generation algorithm to produce higher contrast palette
    // See https://github.com/mbitson/mcg/blob/master/scripts/controllers/ColorGeneratorCtrl.js
    // and http://mcg.mbitson.com/#!?mcgpalette0=%2319381f&themename=mcgtheme
    const baseLight = tinycolor('#ffffff');
    const baseDark = ThemeService.multiply(
      tinycolor(baseHex).toRgb(),
      tinycolor(baseHex).toRgb()
    );

    // Note: there is a bug in the original source code, commented out below. A tetrad is retrieved
    // and the 4th element is used, but TypeScript correctly points out that there is no 4th element in
    // tuple array (starting from zero). So the original JavaScript code was actually using "undefined"
    // as the value. Replicating this behaviour will produce the same results as original colour generator
    // const baseTriad = tinycolor(baseHex).tetrad();
    // const triad4 = tinycolor(baseTriad[4]); // DOES NOT WORK! No 4th element in tuple

    // This does work, produces expected results
    const triad4 = tinycolor(undefined);

    return [
      this.getColorObject(tinycolor.mix(baseLight, baseHex, 12), '50'),
      this.getColorObject(tinycolor.mix(baseLight, baseHex, 30), '100'),
      this.getColorObject(tinycolor.mix(baseLight, baseHex, 50), '200'),
      this.getColorObject(tinycolor.mix(baseLight, baseHex, 70), '300'),
      this.getColorObject(tinycolor.mix(baseLight, baseHex, 85), '400'),
      this.getColorObject(tinycolor.mix(baseLight, baseHex, 100), '500'),
      this.getColorObject(tinycolor.mix(baseDark, baseHex, 87), '600'),
      this.getColorObject(tinycolor.mix(baseDark, baseHex, 70), '700'),
      this.getColorObject(tinycolor.mix(baseDark, baseHex, 54), '800'),
      this.getColorObject(tinycolor.mix(baseDark, baseHex, 25), '900'),
      this.getColorObject(
        tinycolor.mix(baseDark, triad4, 15).saturate(80).lighten(65),
        'A100'
      ),
      this.getColorObject(
        tinycolor.mix(baseDark, triad4, 15).saturate(80).lighten(55),
        'A200'
      ),
      this.getColorObject(
        tinycolor.mix(baseDark, triad4, 15).saturate(100).lighten(45),
        'A400'
      ),
      this.getColorObject(
        tinycolor.mix(baseDark, triad4, 15).saturate(100).lighten(40),
        'A700'
      ),
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
    const color = tinycolor(baseHex);
    return {
      [`--theme-color-${name}`]: color.toHexString(),
      [`--theme-color-${name}-light`]: color.lighten(25).toHexString(),
      [`--theme-color-${name}-dark`]: color.darken(25).toHexString(),
      [`--theme-color-${name}-contrast`]: color.isLight()
        ? lightContrastTextColor
        : darkContrastTextColor,
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
