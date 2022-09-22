import { makeStyles } from '@material-ui/core/styles';

import { ObserverType } from '@xrite/cloud-formulation-domain-model';
import { Body } from '../../../components/Typography';
import ToggleButton from '../../../components/ToggleButton';
import { Component } from '../../../types/component';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(0.5),
  },
  toggle: {
    margin: theme.spacing(0, 0.625),
  },
}));

type Props = {
  handleToggle(toggledObserver: ObserverType): void;
  value: ObserverType;
  disabled?: boolean;
}

const ObserverSwitch: Component<Props> = ({ value, handleToggle, disabled }) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Body>2°</Body>
      <ToggleButton
        className={classes.toggle}
        isChecked={value === ObserverType.TenDegree}
        onChange={() => handleToggle(value === ObserverType.TenDegree
          ? ObserverType.TwoDegree : ObserverType.TenDegree)}
        size="small"
        disabled={disabled}
      />
      <Body>10°</Body>
    </div>
  );
};

export default ObserverSwitch;
