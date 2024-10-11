# Theming of Secure Data Environment User Portal

Theming of the Secure Data Environment User Portal is made up of a few concepts which are customisable. The theme as a whole is comprised of:

1. An [Angular Material theme](https://material.angular.io/guide/theming) to control the colours for the Angular Material components - buttons, form controls etc.
2. Additional colours for the application as whole, based on the core colours from the Angular Material theme with some extensions.
3. Images to replace areas such as logos in the header.

All theme settings are controlled via the `ThemeService` in the `./src/app/shared` module.

## Theme control flow

In essence, the theme is applied to the application as follows:

1. The main `AppComponent` will use `ThemeService` to load and apply a `Theme` object to the DOM.
2. The `ThemeService` will create [CSS3 custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*) and add them to the document root element of the DOM so they can be referenced through the entire page.
3. Stylesheets under the `./src/styles` folder then use the [var()](https://developer.mozilla.org/en-US/docs/Web/CSS/var) CSS syntax to refer to the theme variables.
4. At runtime, the browser then uses the CSS custom properties as the realtime values for things such as colours or other CSS rules.
5. Finally, image sources are replaced where appropriate.

Changing the theme (e.g. colour scheme) is then simply a matter of swapping some values in the `Theme` object to apply across the entire document _without_ having to re-compile `mdm-explorer`.

All CSS theme properties can be inspected from the browser using the browser tools. Inspect the `<html>` `style` element for the full list.

# Loading a theme

The following endpoint from `mdm-plugin-explorer` will locate all Mauro API properties and return a key/value list:

```
GET /api/explorer/theme
```

The `ThemeService` then maps this list to a `Theme` object. This can then be applied to the application.

# Applying a theme

Application of a `Theme` is broken down as follows:

## Angular Material

### Configuration

This Angular application is configured to use a single Angular Material theme called `active-theme`. Normally an Angular Material theme has to be compiled as source code from SASS files, but this does not allow future developers or administrators to alter the `mdm-explorer` look and feel without compilation knowledge.

Instead, the concepts from [this article](https://medium.com/angular-in-depth/build-truly-dynamic-theme-with-css-variables-539516e95837) were used to setup the Angular Material theme using CSS custom properties. Now the theme can be compiled via SASS once but the variable values can be changed at browser runtime.

The Angular Material theme is configured as follows:

1. `./src/styles.scss` imports `mat.core()` and the `./src/styles/themes/_active.scss` stylesheet to setup the Angular Material theme.
2. The theme is encapsulated within the overall CSS class `active-theme`.
3. The `active-theme` class is then applied to the overall page container in `./src/app/app.component.html`
4. Finally, the `CoreModule` customises the Angular Material overlay styles to also use the `active-theme` so that overlay background colours are set correctly.

### Colour Palettes

An Angular Material colour palette is made up of a base colour with lighter, darker and contrasting variants to cover all possibilities. There are also three palettes which make up the entire colour scheme:

1. "primary" - the main, dominant colour of the application
2. "accent" - the secondary colour used sparingly for some variation, e.g to highlight secondary actions.
3. "warn" - to represent warnings or errors, or dangerous actions such as delete buttons.

Each of these palettes then contains numbers representing

1. The colour hues, from 50 to 900 - 500 is the original base colour, the "middle" of the palette.
2. Fewer saturated colours from A100 to A700.
3. Contrasting colours mapped to the same numbers above. For instance, if `500` were a background colour, then `contrasting.500` would be the suitable foreground colour.

The Angular Material system determines the best colour hues to use, it just needs to be provided the full colour palette to be configured. Since setting every colour hue is cumbersome, the `ThemeService` simplifies this by autogenerating the hues and contrasts from just a single colour provided.

Finally, the `ThemeService` will map all colour values to CSS custom properties, as follows:

```json
// For the "primary" palette...
{
  '--theme-mat-color-primary-50': '#8ecc9a',
  '--theme-mat-color-primary-100': '#59b56b',
  // etc ...
  '--theme-mat-color-primary-500': '#19381f',
  // etc ...
  "contrast": {
    "--theme-mat-color-primary-contrast-50": "rgba(black, 0.87)",
    "--theme-mat-primary-contrast-100": "rgba(black, 0.87)",
    // etc ...
    "--theme-mat-primary-contrast-500": "white",
    // etc ...
  }
}
```

### Typography

The typography of Angular Material components is also controlled with CSS custom properties. The key property is for the overall `font-family`:

```json
{
  "--theme-mat-typography-font-family": "Roboto, 'Helvetica Neue', sans-serif"
}
```

Then Angular Material uses a set of [typography levels](https://material.angular.io/guide/typography#typography-levels) to correspond to specific parts of an application's structure, e.g. "header", "body", "button" etc. Each level is then defined as the following properties:

```json
{
  // For "body1"...
  "--theme-mat-typography-body1-font-size": "14px",
  "--theme-mat-typography-body1-line-height": "20px",
  "--theme-mat-typography-body1-font-weight": "400",
  // For "title"...
  "--theme-mat-typography-title-font-size": "20px",
  "--theme-mat-typography-title-line-height": "32px",
  "--theme-mat-typography-title-font-weight": "500",
  // ...etc
}
```

**Note:** only `--theme-mat-typography-input-*` is different, since `line-height` must be set to a particular value for `<input>` elements to avoid SASS compilation issues.

## Application Colours

### Core Colours

The colour palettes listed above only work for the Angular Material controls, but they are useful for other parts of the application, such as the primary colour acting as the header/footer. The `ThemeService` therefore takes the three core `primary`, `accent` and `warn` colours and applies them to CSS variables separate from the Angular Material system so that any component or DOM element can reference them.

The `ThemeService` will automatically generate some light and dark variants of each colour in case they are useful:

```json
{
  "--theme-color-primary": "#19381f",
  "--theme-color-primary-light": "#409050",
  "--theme-color-primary-dark": "#000000",
  // ...etc
}
```

These CSS properties are referenced in the `./src/styles/base/_colours.scss` stylesheet as SASS variables, which can then be used in any other stylesheet - global or component level.

### Regular and Contrasting Colours

For any colours that don't fit inside the core colours above, more colour variables are defined for specific purposes. They are grouped as follows:

1. Regular colours - which represent an element which only ever has one colour, for instance a hyperlink. These are named like so:

```json
{
  "--theme-color-hyperlink": "#003752"
}
```

2. Contrasting colours - which represent an element which has a background colour, then the `ThemeService` will automatically determine a complimentary, contrasting foreground colour. For instance, the page as a whole. These are named like so:

```json
{
  "--theme-color-page": "#ffffff",
  "--theme-color-page-contrast": "rgba(black, 0.87)"
}
```

## Images

Custom images are referenced via URL, which is the Mauro endpoint:

```
GET /api/themeImageFiles/{id}
```

Where `{id}` is the ID of a stored image in Mauro. IDs are mapped to API properties, such as `explorer.theme.images.header.logo`.

### Header Logo

The logo in the header can be changed by uploading an image via the Mauro Data Mapper (as an administrator) to the `explorer.theme.images.header.logo` API property.

The logo image should be no larger than 260 x 100 pixels to ensure it fits correctly in the header layout.
