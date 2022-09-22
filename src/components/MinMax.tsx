import { makeStyles } from '@material-ui/core';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import PercentageInput from './PercentageInput';
import { Tiny } from './Typography';
import ValidationInput from './ValidationInput';

const useStyles = makeStyles((theme) => ({
  thicknessField: {
    display: 'flex',
    gap: theme.spacing(2),
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    '& svg': {
      fontSize: theme.spacing(2),
    },
  },
}));

type Props = Omit<ComponentProps<typeof ValidationInput>, 'value'> & {
  min: number;
  max: number;
  minLimit: number;
  maxLimit: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  dataTestId: string;
  onError: (message?: string) => void;
  disabled?: boolean;
}

const MinMax = ({
  min,
  max,
  minLimit,
  maxLimit,
  onMinChange,
  onMaxChange,
  dataTestId,
  onError,
  disabled,
}: Props) => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.thicknessField}>
      <div className={classes.thicknessField}>
        <Tiny color="textSecondary" className={classes.label}>
          {t('labels.min')}
          :
        </Tiny>
        <PercentageInput
          dataTestId={`${dataTestId}Min`}
          value={min}
          onChange={onMinChange}
          min={disabled ? -Infinity : minLimit}
          max={disabled ? Infinity : Math.min(maxLimit, max)}
          onError={onError}
          disabled={disabled}
        />
      </div>
      <div className={classes.thicknessField}>
        <Tiny color="textSecondary" className={classes.label}>
          {t('labels.max')}
          :
        </Tiny>
        <PercentageInput
          dataTestId={`${dataTestId}Max`}
          value={max}
          onChange={onMaxChange}
          min={disabled ? -Infinity : Math.max(minLimit, min)}
          max={disabled ? Infinity : maxLimit}
          onError={onError}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default MinMax;
