import { makeStyles } from '@material-ui/core/styles';
import ErrorIcon from '@material-ui/icons/Error';

import { Component } from '../types/component';

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: theme.spacing(2.5),
    marginInlineEnd: theme.spacing(1),
  },
}));

const SnackbarErrorIcon: Component = () => {
  const classes = useStyles();

  return <ErrorIcon className={classes.icon} />;
};

export default SnackbarErrorIcon;
