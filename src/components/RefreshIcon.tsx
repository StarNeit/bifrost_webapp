import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import MuiRefreshIcon from '@material-ui/icons/Refresh';

import { Component, ClassNameProps } from '../types/component';

const useStyles = makeStyles((theme) => ({
  '@keyframes spin': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(360deg)',
    },
  },
  spinner: {
    animation: '$spin 1s linear infinite',
    position: 'absolute',
    right: theme.spacing(0.75),
    top: theme.spacing(0.75),
    color: theme.palette.text.disabled,
  },
}));

type Props = ClassNameProps & {
  fetching?: boolean,
};

const RefreshIcon: Component<Props> = ({
  className,
  fetching,
}) => {
  const classes = useStyles();

  if (fetching) {
    return (
      <MuiRefreshIcon data-testid="loading-spinner" className={clsx(classes.spinner, className)} />
    );
  }

  return null;
};

export default RefreshIcon;
