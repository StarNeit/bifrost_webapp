import { makeStyles, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { Body } from '../../components/Typography';
import { useColorimetricConfiguration } from '../../data/configurations';
import { Component } from '../../types/component';
import { useDefaultPrecision } from '../../utils/utils';
import { useSelectedStandard } from '../../utils/utilsSamples';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  indicator: {
    width: theme.spacing(0.75),
    height: theme.spacing(0.75),
    borderRadius: '50%',
    marginLeft: theme.spacing(1),
  },
  indicatorPass: {
    background: 'green',
  },
  indicatorFail: {
    background: 'red',
  },
}));

type Props = { value?: number | string };

const DeltaECell: Component<Props> = ({ value }) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { round, toString } = useDefaultPrecision();
  const { configuration } = useColorimetricConfiguration();
  const { result: standard } = useSelectedStandard();

  const checkToleranceRange = () => {
    const pickedToleranceLowerLimit = (
      standard?.tolerances?.[0]?.lowerLimit ?? configuration?.tolerance?.lowerLimit
    );
    const pickedToleranceUpperLimit = (
      standard?.tolerances?.[0]?.upperLimit ?? configuration?.tolerance?.upperLimit
    );

    if (
      pickedToleranceLowerLimit === undefined
      || pickedToleranceUpperLimit === undefined
    ) return undefined;

    if (value === undefined) return undefined;

    const parsedValue = Number(value);

    return (
      pickedToleranceLowerLimit <= parsedValue
      && parsedValue <= pickedToleranceUpperLimit
    );
  };

  const passed = checkToleranceRange();

  let tooltipMessage = '';
  if (passed !== undefined) {
    // standard has tolerance
    if (standard?.tolerances.length) {
      tooltipMessage = passed
        ? t('messages.successStandardTolerance', {
          lowerLimit: standard.tolerances[0].lowerLimit,
          upperLimit: standard.tolerances[0].upperLimit,
        })
        : t('messages.failStandardTolerance', {
          lowerLimit: standard.tolerances[0].lowerLimit,
          upperLimit: standard.tolerances[0].upperLimit,
        });
    } else if (configuration?.tolerance) {
      tooltipMessage = passed
        ? t('messages.successGlobalTolerance', {
          lowerLimit: configuration.tolerance.lowerLimit,
          upperLimit: configuration.tolerance.upperLimit,
        })
        : t('messages.failGlobalTolerance', {
          lowerLimit: configuration.tolerance.lowerLimit,
          upperLimit: configuration.tolerance.upperLimit,
        });
    }
  }

  return (
    <div className={clsx(classes.root)}>
      <Body>
        {Number.isNaN(round(value)) ? value : round(value, toString)}
      </Body>
      {passed !== undefined && (
        <Tooltip title={tooltipMessage}>
          <div className={clsx(classes.indicator, {
            [classes.indicatorPass]: passed,
            [classes.indicatorFail]: !passed,
          })}
          />
        </Tooltip>
      )}
    </div>
  );
};

export default memo(DeltaECell, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value;
});
