import { ComponentProps } from 'react';

import { makeStyles } from '@material-ui/core';
import { Component } from '../../../types/component';
import { storeTestData } from '../../../utils/test-utils';
import ValidationInput from '../../../components/ValidationInput';

const useStyles = makeStyles((theme) => ({
  inputContainer: {
    width: theme.spacing(8.5),
  },
}));

type Props = Omit<ComponentProps<typeof ValidationInput>, 'onChange'> & {
  onChange(value: number): void;
  dataTestId?: string;
};

const ViscosityInput: Component<Props> = ({
  onChange,
  dataTestId,
  value,
  ...props
}) => {
  const classes = useStyles();

  const handleChangeInput = (newValue: string) => {
    const val = Number.parseFloat(newValue);

    onChange(val);
    storeTestData(dataTestId, val);
  };

  storeTestData(dataTestId, value);

  return (
    <ValidationInput
      dataTestId={dataTestId}
      type="number"
      unit="S"
      value={value}
      className={classes.inputContainer}
      onChange={handleChangeInput}
      min={0}
      {...props}
    />
  );
};

export default ViscosityInput;
