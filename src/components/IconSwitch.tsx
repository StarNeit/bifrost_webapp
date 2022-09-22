import { makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CheckIcon from '@material-ui/icons/Check';

import { Component } from '../types/component';
import Switch from './Switch';

const useStyles = makeStyles((theme) => ({
  icon: {
    fontSize: theme.typography.pxToRem(16),
  },
}));

type Props = {
  isChecked?: boolean;
  onChange(checked: boolean): void;
  disabled?: boolean;
}

const IconSwitch: Component<Props> = ({ isChecked, onChange, disabled }) => {
  const classes = useStyles();

  return (
    <Switch
      isChecked={isChecked ?? false}
      onChange={onChange}
      uncheckedElement={<CloseIcon className={classes.icon} />}
      checkedElement={<CheckIcon className={classes.icon} />}
      width={6}
      disabled={disabled}
    />
  );
};

export default IconSwitch;
