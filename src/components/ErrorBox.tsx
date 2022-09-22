import { makeStyles } from '@material-ui/core';
import ErrorIcon from '@material-ui/icons/Error';
import clsx from 'clsx';

import { Component } from '../types/component';
import Panel from './Panel';

const useStyles = makeStyles((theme) => ({
  panel: {
    backgroundColor: theme.palette.error.main,
    borderRadius: theme.spacing(0.75),
    color: theme.palette.error.contrastText,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
    fontSize: 'inherit',
  },
}));

type Props = { message?: string, className?: string };

const ErrorBox: Component<Props> = ({ message, className }) => {
  const classes = useStyles();

  return (
    <Panel className={clsx(classes.panel, className)}>
      <ErrorIcon className={classes.icon} />
      {message}
    </Panel>
  );
};

export default ErrorBox;
