import { ComponentProps } from 'react';
import clsx from 'clsx';
import {
  useTheme,
  makeStyles,
  Button as MuiButton,
  CircularProgress,
} from '@material-ui/core';

import { Component } from '../types/component';

const useStyles = makeStyles((theme) => ({
  base: {
    padding: theme.spacing(1.5, 3),
    borderRadius: theme.spacing(0.75),
  },
  primary: {
    background: theme.palette.action.active,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.text.disabled,
    color: theme.palette.primary.contrastText,
    textTransform: 'none',

    '&:hover': {
      background: theme.palette.divider,
      borderColor: theme.palette.text.hint,
    },

    '&:disabled': {
      background: theme.palette.action.active,
      borderColor: theme.palette.divider,
      color: theme.palette.text.hint,
      cursor: 'not-allowed',
      pointerEvents: 'auto',
    },
  },
  ghost: {
    background: 'none',
    color: theme.palette.text.primary,

    '&:hover': {
      background: theme.palette.action.hover,
    },

    '&:disabled': {
      background: 'none',
      color: theme.palette.text.hint,
      cursor: 'not-allowed',
      pointerEvents: 'auto',
    },
  },
  spinner: {
    position: 'absolute',
    color: theme.palette.text.primary,
  },
  hidden: {
    opacity: 0,
  },
}));

type Props = Omit<ComponentProps<typeof MuiButton>, 'variant'> & {
  showSpinner?: boolean;
  progress?: number;
  variant?: 'primary' | 'ghost';
};

const Button: Component<Props> = ({
  showSpinner,
  progress,
  children,
  className,
  variant = 'primary',
  ...props
}) => {
  const classes = useStyles();
  const theme = useTheme();

  return (
    <MuiButton
      className={clsx(
        classes.base,
        className,
        {
          [classes.ghost]: variant === 'ghost',
          [classes.primary]: variant === 'primary',
        },
      )}
      disabled={Boolean(showSpinner || progress)}
      {...props}
    >
      <span className={clsx({
        [classes.hidden]: Boolean(showSpinner || progress),
      })}
      >
        {children}
      </span>

      {progress ? (
        <CircularProgress
          variant="determinate"
          size={theme.spacing(3)}
          className={classes.spinner}
          value={progress}
        />
      ) : null}

      {showSpinner && !progress && (
        <CircularProgress size={theme.spacing(3)} className={classes.spinner} />
      )}
    </MuiButton>
  );
};

export default Button;
