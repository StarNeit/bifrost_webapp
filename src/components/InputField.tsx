import { forwardRef } from 'react';
import { withStyles } from '@material-ui/core/styles';
import {
  InputBase as MuiInputBase,
  InputBaseComponentProps,
  InputProps,
} from '@material-ui/core';

import { ClassNameProps, Component } from '../types/component';
import { input } from '../theme/components';

const InputBase = withStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.surface[3],
    '& span': {
      color: theme.palette.text.disabled,
    },
    padding: 0,
    ...input(theme),
  },
  input: {
    fontSize: theme.spacing(1.75),
    color: theme.palette.text.primary,
    padding: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    '&:focus': {
      backgroundColor: 'inherit',
      borderRadius: theme.spacing(0.5),
    },
  },
  disabled: {
    cursor: 'not-allowed',
  },
}))(MuiInputBase);

type Props = ClassNameProps & Omit<InputProps, 'onChange'> & {
  dataTestId?: string,
  type?: string,
  value?: string,
  onChange?(value: string): void,
  onBlur?(): void,
  placeholder?: string,
  unit?: string,
  isMultiLine?: boolean,
  startAdornment?: React.ReactNode,
  disabled?: boolean,
  min?: boolean | number,
  max?: boolean | number,
  step?: string | number,
  readOnly?: boolean,
  inputProps?: InputBaseComponentProps,
}

const InputField: Component<Props> = forwardRef(({
  dataTestId,
  value,
  onChange,
  onBlur,
  unit,
  placeholder = '',
  type = 'text',
  className,
  isMultiLine = false,
  startAdornment = null,
  disabled = false,
  step,
  readOnly,
  inputProps,
  ...rest
}, ref) => {
  return (
    <InputBase
      data-testid={dataTestId}
      className={className}
      type={type}
      value={value}
      multiline={isMultiLine}
      rows={isMultiLine ? 2 : 1}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
      onBlur={onBlur}
      startAdornment={startAdornment}
      endAdornment={<span>{unit}</span>}
      disabled={disabled}
      inputProps={{
        ...inputProps,
        step,
      }}
      readOnly={readOnly}
      inputRef={ref}
      {...rest}
    />
  );
});

export default InputField;
