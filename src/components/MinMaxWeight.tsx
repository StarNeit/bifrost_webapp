import { makeStyles } from '@material-ui/core';
import { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import WeightInput from './WeightInput';
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
  unit?: string;
}

const MinMaxWeight = ({
  min,
  max,
  minLimit,
  maxLimit,
  onMinChange,
  onMaxChange,
  dataTestId,
  onError,
  disabled,
  unit,
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
        <WeightInput
          dataTestId={`${dataTestId}Min`}
          value={min}
          onChange={onMinChange}
          min={minLimit}
          max={Math.min(maxLimit, max + 1e-7)}
          onError={onError}
          disabled={disabled}
          unit={unit}
          step={0.1}
        />
      </div>
      <div className={classes.thicknessField}>
        <Tiny color="textSecondary" className={classes.label}>
          {t('labels.max')}
          :
        </Tiny>
        <WeightInput
          dataTestId={`${dataTestId}Max`}
          value={max}
          onChange={onMaxChange}
          min={Math.max(minLimit, min - 1e-7)}
          max={maxLimit}
          onError={onError}
          disabled={disabled}
          unit={unit}
          step={0.1}
        />
      </div>
    </div>
  );
};

export default MinMaxWeight;
