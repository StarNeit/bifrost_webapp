/* eslint-disable @typescript-eslint/no-empty-interface */
/*
  Rule explanation:
  @typescript-eslint/no-empty-interface - We want to be able to augment the existing Material-UI
  interfaces without repeating the extension interface multiple types. This pattern looks like an
  empty declaration to the linter but we're actually composing the existing interface.
*/

interface PaletteExtension {
  surface: string[],
  recipeScore: {
    good: string;
    medium: string;
    bad: string;
    veryBad: string;
    disabled: string;
  };
}

// Adding our custom palette properties to the Material-UI interfaces
declare module '@material-ui/core/styles/createPalette' {
  // Used in Theme
  interface Palette extends PaletteExtension {}
  // Used in ThemeOptions, during creation
  interface PaletteOptions extends Partial<PaletteExtension> {}
}

export enum ThemeMode {
  Light = 'light',
  Dark = 'dark'
}
