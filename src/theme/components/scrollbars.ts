import { Theme } from '@material-ui/core';
import { CreateCSSProperties } from '@material-ui/core/styles/withStyles';

export function scrollbars(theme: Theme): CreateCSSProperties {
  return {
    '&::-webkit-scrollbar': {
      width: theme.spacing(1.25),
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.surface[3],
      borderRadius: 9999,
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: theme.palette.surface[4],
    },
    '&::-webkit-scrollbar-corner': {
      backgroundColor: 'transparent',
    },
  };
}

export function scrollbarsLight(theme: Theme): CreateCSSProperties {
  return {
    ...scrollbars(theme),
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.surface[4],
      borderRadius: 9999,
    },
  };
}
