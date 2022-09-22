import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import ValidationInput from '../../components/ValidationInput';
import { Component } from '../../types/component';
import { useDefaultPrecision } from '../../utils/utils';

const useStyles = makeStyles((theme) => ({
  root: {
    borderBottom: 'unset',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'right',
  },
  inputContainer: {
    height: theme.spacing(2.45),
    width: theme.spacing(11.5),
    paddingLeft: 0,
    background: theme.palette.action.hover,
  },
  input: {
    paddingRight: theme.spacing(3.6),
    textAlign: 'right',
    '&:focus': {
      background: 'unset',
    },
  },
}));

interface Props {
  value: string | number;
  testId: string;
  handleChange?: (value: number) => void;
  disabled?: boolean;
}

export const EditableCell: Component<Props> = ({
  testId, value, handleChange, disabled,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { round } = useDefaultPrecision();

  const message = disabled ? t('messages.componentInvalidEditable') : '';
  return (
    <div className={classes.root} data-testid={testId}>
      <ValidationInput
        onChange={(number) => handleChange?.(+number)}
        value={Number.isNaN(round(value)) ? value : round(value)}
        type="number"
        className={classes.inputContainer}
        inputClassName={classes.input}
        disabled={disabled}
        min={0}
        tooltipMessage={message}
      />
    </div>
  );
};
