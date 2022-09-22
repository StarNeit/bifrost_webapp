import { ReactElement, ComponentProps } from 'react';
import Switch from '@material-ui/core/Switch';
import clsx from 'clsx';
import {
  withStyles, makeStyles,
} from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import { Component, ClassNameProps } from '../types/component';

const WidthInfo = {
  small: {
    width: 5,
    transform: '40px',
  },
  medium: {
    width: 7.5,
    transform: '40px',
  },
};

type MuiSwitchProps = ComponentProps<typeof Switch> & {
  width: 'small' | 'medium';
};

const MuiSwitch = withStyles((theme) => ({
  root: {
    width: (props: MuiSwitchProps) => (theme.spacing(WidthInfo[props.width].width)),
    height: 21,
    margin: 0,
    borderRadius: 25,
    padding: 0,
    marginRight: theme.spacing(0.2),
  },
  switchBase: {
    padding: 2,
    '&$checked': {
      left: 'calc(100% - 40px)',
      '& + $track': {
        opacity: 1,
        backgroundColor: theme.palette.primary.main,
      },
    },
  },
  thumb: {
    width: theme.spacing(2),
    height: theme.spacing(2),
    color: 'white',
  },
  track: {
    opacity: 1,
    backgroundColor: theme.palette.surface[2],
  },
  checked: {},
}))(Switch);

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
    height: 'fit-content',
    marginRight: theme.spacing(1.75),
  },
  label: {
    fontSize: theme.spacing(1.5),
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    cursor: 'pointer',
    '& svg': {
      fontSize: theme.spacing(1.5),
    },
  },
  disabled: {
    transform: 'translate(70%, 0)',
    color: theme.palette.text.secondary,
    pointerEvents: 'none',
    '& svg': {
      transform: 'translate(100%, 0)',
    },
  },
  enabled: {
    transform: 'translate(35%, 0)',
    color: theme.palette.text.hint,
  },
}));

type Props = ClassNameProps & {
  isChecked: boolean;
  onChange(checked: boolean): void;
  unCheckedLabel?: string | ReactElement;
  checkedLabel?: string | ReactElement;
  size?: 'small' | 'medium';
  disabled?: boolean;
};

const ToggleButton: Component<Props> = ({
  isChecked,
  onChange,
  unCheckedLabel,
  checkedLabel,
  size = 'medium',
  disabled,
  className,
}) => {
  const classes = useStyles();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  const handleClickState = () => {
    onChange(!isChecked);
  };

  return (
    <div className={clsx(classes.wrapper, className)}>
      <MuiSwitch
        checked={isChecked}
        onChange={handleChange}
        width={size}
        disabled={disabled}
      />
      <Typography
        className={clsx(classes.label, isChecked ? classes.enabled : classes.disabled)}
        onClick={handleClickState}
      >
        {isChecked ? checkedLabel : unCheckedLabel }
      </Typography>
    </div>
  );
};

export default ToggleButton;
