import { ChangeEvent } from 'react';
import {
  makeStyles,
  withStyles,
  Slider as MuiSlider,
} from '@material-ui/core';

import { Component } from '../types/component';

const Slider = withStyles((theme) => ({
  root: {
    color: theme.palette.primary.main,
    height: theme.spacing(0.25),
    borderRadius: theme.spacing(0.25),
    padding: theme.spacing(1.5, 0),
  },
  thumb: {
    height: theme.spacing(1.5),
    width: theme.spacing(1.5),
    marginTop: -theme.spacing(0.5),
    backgroundColor: theme.palette.primary.main,
    '&:focus, &:hover, &$active': {
      boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
    },
  },
  active: {},
  track: {
    height: theme.spacing(0.437),
    borderRadius: theme.spacing(3),
  },
  rail: {
    height: theme.spacing(0.437),
    backgroundColor: theme.palette.surface[3],
    borderRadius: theme.spacing(3),
  },
}))(MuiSlider);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    paddingLeft: theme.spacing(1.625),
  },
}));

type Props = {
  value: number,
  onChangeSlider(value: number): void,
};

const SliderBar: Component<Props> = ({
  value,
  onChangeSlider,
}) => {
  const classes = useStyles();

  const handleChange = (event: ChangeEvent<unknown>, newValue: number | number[]) => {
    onChangeSlider(newValue as number);
  };
  return (
    <div className={classes.root}>
      <Slider
        value={value}
        onChange={handleChange}
      />
    </div>
  );
};

export default SliderBar;
