import { makeStyles } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

import { Component } from '../types/component';
import Panel from './Panel';

const useStyles = makeStyles((theme) => ({
  panel: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.warning.contrastText,
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing(1),
    fontSize: 'inherit',
  },
}));

type Props = { message?: string };

const WarningBox: Component<Props> = ({ message }) => {
  const classes = useStyles();

  return (
    <Panel className={classes.panel}>
      <WarningIcon className={classes.icon} />
      {message}
    </Panel>
  );
};

export default WarningBox;
