import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  InputBase as MuiInputBase,
  InputBaseProps,
  Tooltip,
} from '@material-ui/core';

import { useTranslation } from 'react-i18next';
import { Component } from '../../types/component';
import { input } from '../../theme/components';
import ArrowControls from './ArrowControls';

const InputBase = withStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.surface[3],
    '& span': {
      position: 'absolute',
      right: theme.spacing(2.6),
      color: theme.palette.text.disabled,
      pointerEvents: 'none',
    },
    padding: 0,
    ...input(theme),
  },
  input: {
    fontSize: theme.spacing(1.75),
    color: theme.palette.text.primary,
    padding: theme.spacing(1),
    paddingRight: theme.spacing(2.6),
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

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
  },
  endAdornmentInput: {
    paddingRight: theme.spacing(4.5),
  },
  error: {
    boxShadow: `0 0 1px 1px ${theme.palette.error.main}`,
  },
}));

type Props = Omit<InputBaseProps,
  'value'
  | 'onChange'
  | 'multiline'
  | 'onError'
> & {
  dataTestId?: string,
  value: string | number,
  onChange?(value: string): void,
  unit?: string,
  isMultiLine?: boolean,
  min?: number,
  max?: number,
  step?: number,
  inputClassName?: string,
  /** prop to forcefully show controllers if it's of type number */
  alwaysShowControls?: boolean,
  /** callback that is called when there's an error, this can be
   * used when we want to show disabled state in the parent component
   */
  onError?: (key?: string, message?: string) => void,
  /** If true, onChange will instantly be called, default: false   */
  invokeImmediately?: boolean,
  /** If true, a message will always be displayed bellow the input,
   * but errorMessage takes priority */
  tooltipMessage?: string,
}

const convertToString = (value: number | string) => {
  return Number(value).toLocaleString('fullwide', { useGrouping: false });
};

const ValidationInput: Component<Props> = ({
  dataTestId,
  value: propValue,
  onChange,
  onBlur,
  onFocus,
  unit,
  placeholder = '',
  type = 'text',
  className,
  inputClassName,
  isMultiLine = false,
  startAdornment = null,
  disabled = false,
  min,
  max,
  step = 1,
  readOnly,
  alwaysShowControls,
  endAdornment,
  onError,
  invokeImmediately,
  tooltipMessage,
  id,
  ...inputProps
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [value, setValue] = useState(convertToString(propValue));
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [openToolTip, setOpenToolTip] = useState(false);

  const [showError, setShowError] = useState('');

  const changeValue = invokeImmediately ? onChange || setValue : setValue;

  useEffect(() => {
    setValue(convertToString(propValue));
  }, [propValue]);

  const getMinMaxMessage = () => {
    if ((min !== undefined) && (max !== undefined)) {
      return t('messages.minMaxWithValues', { min, max });
    }
    if (min !== undefined) {
      return t('messages.minWithValue', { min });
    }
    return t('messages.maxWithValue', { max });
  };

  const validate = (valueToValidate = value) => {
    const valueIsHyphen = valueToValidate === '-';
    if (valueIsHyphen) return false;

    if ((max !== undefined && Number(valueToValidate) > max)
      || (min !== undefined && Number(valueToValidate) < min)) {
      const message = getMinMaxMessage();
      const fullMessage = t('messages.invalidRangeError', { message });
      onError?.(id, fullMessage);
      setShowError(fullMessage);
      setOpenToolTip(true);
      return false;
    }

    // todo: additional validations with custom error messages can be added here

    setShowError('');
    setOpenToolTip(false);
    onError?.(id);

    return true;
  };

  useEffect(() => {
    validate(value);
  }, [min, max]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    // eslint-disable-next-line no-useless-escape
    const re = /(^([0-9]|-[0-9])(([\.,\d]*))|^-|^)$/;
    const isNumber = type === 'number' && re.test(e.target.value);

    if (type === 'number' && !isNumber) return;

    validate(e.target.value);
    changeValue(e.target.value);
  };

  const handleIncrement = () => {
    // 0.1000001 => 0.100 (with toFixed) => 0.1 after it's converted to Number
    const userValue = value.toString().replace(',', '.');
    const incrementedValue = String(Number((Number(userValue) + step).toFixed(3)));

    changeValue(incrementedValue);

    const valid = validate(incrementedValue);
    // don't change value externally if it's not valid
    if (!valid) return;

    onChange?.(incrementedValue);
  };

  const handleDecrement = () => {
    const userValue = value.toString().replace(',', '.');
    const decrementedValue = String(Number((Number(userValue) - step).toFixed(3)));

    changeValue(decrementedValue);

    const valid = validate(decrementedValue);
    // don't change value externally if it's not valid
    if (!valid) return;

    onChange?.(decrementedValue);
  };

  // Change new value if user presses enter and it's a valid value
  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && validate()) {
      (e.target as HTMLInputElement).blur();

      return;
    }

    if (type === 'number') {
      if (e.key === 'ArrowUp') {
        handleIncrement();
        return;
      }
      if (e.key === 'ArrowDown') {
        handleDecrement();
      }
    }
  };

  const handleBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    setIsFocused(false);

    const isValid = validate();
    let userValue = value;

    if (type === 'number' && value === '') {
      changeValue('0');
    }
    if (type === 'number') {
      userValue = value.toString().replace(',', '.');
    }

    if (!isValid) return;

    onBlur?.(e);

    // removes leading/trailing zeroes
    const parsedValue = String(parseFloat(userValue));

    if (parsedValue !== userValue) setValue(parsedValue);
    onChange?.(parsedValue);
  };

  const handleFocus: React.FocusEventHandler<HTMLInputElement> = (e) => {
    if (type === 'number' && !alwaysShowControls) {
      setIsFocused(true);
    }

    onFocus?.(e);
  };

  const hasEndAdornment = Boolean(endAdornment || unit);

  const showControls = isHovered || isFocused;

  const message = showError || tooltipMessage || '';
  return (
    <Tooltip
      title={message}
      aria-label={message}
      open={openToolTip}
      onClose={() => setOpenToolTip(false)}
      onOpen={() => message && setOpenToolTip(true)}
    >
      <div
        className={classes.container}
        onMouseEnter={() => type === 'number' && setIsHovered(true)}
        onMouseLeave={() => type === 'number' && setIsHovered(false)}
      >
        <InputBase
          data-testid={dataTestId}
          className={clsx(className, {
            [classes.error]: showError,
          })}
          classes={{
            input: clsx(inputClassName, {
              [classes.endAdornmentInput]: hasEndAdornment,
            }),
          }}
          type={type === 'number' ? 'text' : type}
          value={value}
          multiline={isMultiLine}
          rows={isMultiLine ? 2 : 1}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          onBlur={handleBlur}
          startAdornment={startAdornment}
          endAdornment={endAdornment || (unit && <span>{unit}</span>)}
          disabled={disabled}
          readOnly={readOnly}
          onFocus={handleFocus}
          {...inputProps}
        />

        {/* The arrows controls when input is number */}
        {type === 'number' && (showControls || alwaysShowControls)
          && (
            <ArrowControls
              hasAdornment={Boolean(hasEndAdornment)}
              onArrowDown={handleDecrement}
              onArrowUp={handleIncrement}
              disableUpArrow={disabled || (max !== undefined && +value + step > max)}
              disableDownArrow={disabled || (min !== undefined && +value - step < min)}
            />
          )}
      </div>
    </Tooltip>
  );
};

export default ValidationInput;
