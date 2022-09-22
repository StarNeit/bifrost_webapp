import { Theme } from '@material-ui/core';
import { CreateCSSProperties } from '@material-ui/core/styles/withStyles';

export function input(theme: Theme): CreateCSSProperties {
  return {
    borderRadius: theme.spacing(0.75),
    background: theme.palette.action.active,
    transition: 'background 200ms ease-in-out',

    '&:hover': {
      background: theme.palette.action.hover,
    },
    '&:focus': {
      backgroundColor: theme.palette.surface[4],
    },
    '&:disabled': {
      color: theme.palette.text.disabled,
      cursor: 'not-allowed',
      '&:hover': {
        background: theme.palette.action.active,
      },
    },
  };
}
