import { IconButton, makeStyles, Slider as MuiSlider } from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import clsx from 'clsx';
import { ComponentProps } from 'react';
import { Component } from '../../../../types/component';

const useStyles = makeStyles((theme) => ({
  slider: {
    width: '100%',
    margin: 'auto',
    background: theme.palette.background.default,
    padding: theme.spacing(0.5, 1),
    display: 'flex',
    alignItems: 'center',
    borderRadius: theme.spacing(1),
    gap: theme.spacing(1.2),
  },
  sliderArrow: {
    color: theme.palette.text.secondary,
    padding: 0,
    '&:disabled': {
      color: theme.palette.text.disabled,
    },
  },
  sliderDisabled: {
    cursor: 'not-allowed',
  },
}));

type Props = {
  disabled: boolean;
  handleArrowChange(position: number): void;
  handleDraggingInProgress: ComponentProps<typeof MuiSlider>['onChange'];
  handleDraggingDone: ComponentProps<typeof MuiSlider>['onChangeCommitted'];
  position: number;
  numberOfSamples: number;
}

const Slider: Component<Props> = ({
  disabled,
  handleArrowChange,
  handleDraggingDone,
  handleDraggingInProgress,
  position,
  numberOfSamples,
}) => {
  const classes = useStyles();

  return (
    <div className={clsx(classes.slider, {
      [classes.sliderDisabled]: disabled,
    })}
    >
      <IconButton
        className={classes.sliderArrow}
        onClick={() => handleArrowChange(Math.max(position - 1, 0))}
        disabled={disabled || position === 0}
      >
        <ChevronLeft />
      </IconButton>

      <MuiSlider
        color="primary"
        min={0}
        max={numberOfSamples}
        value={position}
        disabled={disabled}
        onChange={handleDraggingInProgress}
        onChangeCommitted={handleDraggingDone}
      />

      <IconButton
        className={classes.sliderArrow}
        onClick={() => handleArrowChange(
          Math.min(position + 1, numberOfSamples),
        )}
        disabled={disabled || position === numberOfSamples}
      >
        <ChevronRight />
      </IconButton>
    </div>
  );
};

export default Slider;
