import { ReactElement, useMemo } from 'react';
import {
  Switch as MuiSwitch,
  withStyles,
  makeStyles,
} from '@material-ui/core';
import clsx from 'clsx';

import { Component } from '../types/component';
import { Tiny } from './Typography';
import { storeTestData } from '../utils/test-utils';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'relative',
    height: 'fit-content',
  },
  label: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  checkedLabel: {
    right: theme.spacing(2),
    left: theme.spacing(1),
  },
  uncheckedLabel: {
    left: theme.spacing(3),
  },
  disabledLabel: {
    color: theme.palette.text.disabled,
  },
}));

type Props = {
  isChecked: boolean;
  onChange(checked: boolean): void;
  uncheckedElement: ReactElement | string;
  checkedElement: ReactElement | string;
  className?: string;
  width: number;
  disabled?: boolean;
  dataTestId?: string;
}

const Switch: Component<Props> = ({
  isChecked, onChange, uncheckedElement, checkedElement, width, disabled, dataTestId,
}) => {
  const classes = useStyles();

  // We have to keep the MSwitch component inside and memoized
  // because currently Material UI doesn't compile the styles
  // when using Props within the "&$checked" scope
  const MSwitch = useMemo(() => withStyles((theme) => ({
    root: {
      width: theme.spacing(width),
      height: theme.spacing(2.5),
      padding: 0,
      borderRadius: 9999,
    },
    input: {
      left: theme.spacing(width * -1),
      width: theme.spacing(width * 2),
    },
    thumb: {
      width: theme.spacing(2),
      height: theme.spacing(2),
      color: theme.palette.text.primary,
    },
    switchBase: {
      padding: theme.spacing(0.25),
      '&$checked': {
        transform: `translateX(${theme.spacing(width - 2.5)}px)`,
        '& + $track': {
          backgroundColor: theme.palette.primary.main,
          opacity: 1,
        },
        '&$disabled + $track': {
          backgroundColor: theme.palette.action.active,
        },
      },
      '&$disabled + $track': {
        cursor: 'not-allowed',
      },
    },
    track: {
      backgroundColor: theme.palette.action.hover,
      opacity: 1,
    },
    // necessary for the checked styles to apply
    checked: {},
    disabled: {},
  }))(MuiSwitch), [width]);

  const toggle = () => {
    storeTestData(dataTestId, !isChecked);
    onChange(!isChecked);
  };

  storeTestData(dataTestId, isChecked);

  return (
    <div data-testid={dataTestId} className={classes.wrapper}>
      <MSwitch
        data-testid={dataTestId}
        checked={isChecked}
        onChange={toggle}
        disabled={disabled}
      />
      <Tiny
        className={clsx(
          classes.label,
          { [classes.checkedLabel]: isChecked },
          { [classes.disabledLabel]: disabled },
          { [classes.uncheckedLabel]: !isChecked },
        )}
      >
        {isChecked ? checkedElement : uncheckedElement}
      </Tiny>
    </div>
  );
};

export default Switch;
