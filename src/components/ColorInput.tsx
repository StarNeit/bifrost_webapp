import { makeStyles } from '@material-ui/core/styles';

import { Body } from './Typography';
import ValidationInput from './ValidationInput';
import { Component } from '../types/component';
import { ColorRange } from '../types/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(-0.25),
    display: 'flex',
    alignItems: 'center',
    '& > div:last-child': {
      marginRight: 0,
    },
  },
  label: {
    color: theme.palette.text.secondary,
    marginRight: theme.spacing(1.375),
  },
  input: {
    width: theme.spacing(7),
    marginRight: theme.spacing(1.5),
  },
}));

type Props = {
  disabled: boolean;
  aValue: string;
  bValue: string;
  cValue: string;
  aValueRange?: ColorRange,
  bValueRange?: ColorRange,
  cValueRange?: ColorRange,
  aLabel: string;
  bLabel: string;
  cLabel: string;
  handleAValueChange(aValue: number): void;
  handleBValueChange(bValue: number): void;
  handleCValueChange(cValue: number): void;
}

const ColorInput: Component<Props> = ({
  disabled,
  aValue,
  bValue,
  cValue,
  aValueRange,
  bValueRange,
  cValueRange,
  aLabel,
  bLabel,
  cLabel,
  handleAValueChange,
  handleBValueChange,
  handleCValueChange,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Body className={classes.label}>{aLabel}</Body>
      <ValidationInput
        className={classes.input}
        value={aValue}
        onChange={(newValue) => handleAValueChange(+newValue)}
        type="number"
        step={0.1}
        min={aValueRange?.min || 0}
        max={aValueRange?.max || Number.MAX_SAFE_INTEGER}
        disabled={disabled}
      />
      <Body className={classes.label}>:</Body>
      <Body className={classes.label}>{bLabel}</Body>
      <ValidationInput
        className={classes.input}
        value={bValue}
        onChange={(newValue) => handleBValueChange(+newValue)}
        type="number"
        step={0.1}
        min={bValueRange?.min || 0}
        max={bValueRange?.max || Number.MAX_SAFE_INTEGER}
        disabled={disabled}
      />
      <Body className={classes.label}>:</Body>
      <Body className={classes.label}>{cLabel}</Body>
      <ValidationInput
        className={classes.input}
        value={cValue}
        onChange={(newValue) => handleCValueChange(+newValue)}
        type="number"
        step={0.1}
        min={cValueRange?.min || 0}
        max={cValueRange?.max || Number.MAX_SAFE_INTEGER}
        disabled={disabled}
      />
    </div>
  );
};

export default ColorInput;
