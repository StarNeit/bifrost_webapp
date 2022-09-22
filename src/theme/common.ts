import { ThemeOptions } from '@material-ui/core';
import { TypographyStyleOptions } from '@material-ui/core/styles/createTypography';
import { Shadows } from '@material-ui/core/styles/shadows';
import NotoSans400URL from '@fontsource/noto-sans/files/noto-sans-all-400-normal.woff';
import NotoSans700URL from '@fontsource/noto-sans/files/noto-sans-all-700-normal.woff';

import colors from './colors';

const typographyStyleOptions: Record<string, TypographyStyleOptions> = {
  header: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: 2.5,
  },
  body: {
    fontSize: 14,
    fontWeight: 400,
    letterSpacing: 0.5,
  },
  tiny: {
    fontSize: 12,
    fontWeight: 400,
    letterSpacing: 0.5,
  },
  tinyBold: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  caption: {
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
};

const spacing = 8;

export const common: ThemeOptions = {
  spacing,
  shape: {
    borderRadius: 6,
  },
  palette: {
    primary: colors.primary,
    secondary: colors.secondary,
    error: colors.error,
    warning: colors.warning,
    info: colors.info,
    success: colors.success,
    recipeScore: {
      good: colors.recipeScore.good,
      medium: colors.recipeScore.medium,
      bad: colors.recipeScore.bad,
      veryBad: colors.recipeScore.veryBad,
      disabled: colors.recipeScore.disabled,
    },
  },
  typography: {
    fontFamily: 'Noto Sans',
    h1: typographyStyleOptions.title,
    h2: typographyStyleOptions.header,
    h3: typographyStyleOptions.subtitle,
    h4: typographyStyleOptions.caption,
    h5: typographyStyleOptions.tiny,
    h6: typographyStyleOptions.tinyBold,
    subtitle1: typographyStyleOptions.tiny,
    subtitle2: typographyStyleOptions.tinyBold,
    body1: typographyStyleOptions.body,
    body2: typographyStyleOptions.body,
    caption: typographyStyleOptions.tiny,
    button: typographyStyleOptions.tinyBold,
    overline: typographyStyleOptions.body,
  },
  shadows: Array(25).fill('none') as Shadows,
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [
          {
            fontFamily: 'Noto Sans',
            src: `url(${NotoSans400URL}) format("woff")`,
            fontStyle: 'normal',
            fontWeight: 400,
          },
          {
            fontFamily: 'Noto Sans',
            src: `url(${NotoSans700URL}) format("woff")`,
            fontStyle: 'normal',
            fontWeight: 700,
          },
        ],
      },
    },
    MuiFilledInput: {
      root: {
        borderRadius: 6,
      },
      input: {
        borderRadius: 'inherit',
        padding: spacing * 2,
      },
    },
    MuiLink: {
      root: {
        color: colors.info.main,
      },
    },
  },
  props: {
    MuiButton: {
      size: 'large',
      variant: 'contained',
    },
    MuiTextField: {
      variant: 'filled',
    },
    MuiFilledInput: {
      disableUnderline: true,
    },
  },
};
