import { ComponentProps } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Component } from '../types/component';
import { storeTestData } from '../utils/test-utils';
import ValidationInput from './ValidationInput';

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    width: theme.spacing(12.5),
  },
}));

type Props = Omit<ComponentProps<typeof ValidationInput>, 'onChange'> & {
  onChange(value: number): void;
  dataTestId?: string
};

const PercentageInput: Component<Props> = ({
  value,
  onChange,
  dataTestId,
  ...rest
}) => {
  const classes = useStyles();

  const handleChangeInput = (newValue: string) => {
    const changedValue = Number(newValue);

    storeTestData(dataTestId, changedValue);
    onChange(changedValue);
  };

  storeTestData(dataTestId, value);

  return (
    <ValidationInput
      dataTestId={dataTestId}
      type="number"
      unit="%"
      value={value}
      onChange={handleChangeInput}
      className={classes.inputContainer}
      min={0}
      max={100}
      {...rest}
    />
  );
};

export default PercentageInput;
