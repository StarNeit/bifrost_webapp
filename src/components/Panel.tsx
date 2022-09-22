import { ComponentProps } from 'react';
import { Paper, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { Component } from '../types/component';

const useStyles = makeStyles((theme) => ({
  panel: {
    borderRadius: theme.spacing(1.5),
    padding: theme.spacing(1.5),
  },
}));

type Props = ComponentProps<typeof Paper>;

const Panel: Component<Props> = ({ className, ...partialProps }) => {
  const classes = useStyles();
  return (
    <Paper className={clsx(classes.panel, className)} {...partialProps} />
  );
};

export default Panel;
