import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';

import {
  IlluminantType, ObserverType,
} from '@xrite/cloud-formulation-domain-model';
import { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/Button';
import { Body } from '../../../components/Typography';
import Select from '../../../components/Select';
import ObserverSwitch from './ObserverSwitch';
import ColorInput from '../../../components/ColorInput';
import { useColorimetricConfiguration } from '../../../data/configurations';
import { useDefaultPrecision, useStateObject } from '../../../utils/utils';
import ValidationInput from '../../../components/ValidationInput';
import ToggleableSection from '../../../components/ToggleableSection';
import ToggleButton from '../../../components/ToggleButton';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
    display: 'flex',
  },
  title: {
    color: theme.palette.text.secondary,
  },
  header: {
    display: 'flex',
    marginBottom: theme.spacing(0.875),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
  },
  subRow: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(1.5),
    // marginTop: theme.spacing(-1.5),
    marginBottom: theme.spacing(1.5),
  },
  left: {
    width: theme.spacing(64.5),
  },
  right: {
    marginLeft: theme.spacing(7.5),
    marginTop: theme.spacing(-0.5),
    width: theme.spacing(49.5),
  },
  illuminant: {
    flexBasis: '80%',
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(2),
  },
  observer: {
    flexBasis: '20%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flexGrow: 1,
    minWidth: theme.spacing(17.5),
  },
  selectWrapper: {
    width: theme.spacing(28),
  },
  submit: {
    marginTop: theme.spacing(2.75),
    fontSize: theme.spacing(1.5),
    height: theme.spacing(5.25),
    textTransform: 'capitalize',
  },
  toleranceInput: {
    width: theme.spacing(7.2),
  },
  toleranceToggleButton: {
    marginRight: theme.spacing(0),
  },
}));

type GenericState<T> = {
  primary: T;
  secondary: T;
  tertiary: T;
};

const availableIlluminants = Object.values(IlluminantType).filter(
  (illuminant) => illuminant !== IlluminantType.E,
);

const availableDeltaEMetrics = ['dE00', 'dE76'];

const Colorimetric = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { round } = useDefaultPrecision();

  const {
    configuration,
    isLoading,
    setConfiguration,
    isUpdating,
  } = useColorimetricConfiguration();

  const disableControls = isLoading || isUpdating;

  // illuminants state
  const [illuminants, updateIlluminants] = useStateObject<GenericState<IlluminantType>>({
    primary: IlluminantType.D50,
    secondary: IlluminantType.A,
    tertiary: IlluminantType.FL12,
  });

  // observer state
  const [observers, updateObservers] = useStateObject<GenericState<ObserverType>>({
    primary: ObserverType.TwoDegree,
    secondary: ObserverType.TwoDegree,
    tertiary: ObserverType.TwoDegree,
  });

  // metric state
  const deltaEMetricLabels: Record<string, string> = useMemo(() => ({
    dE00: t('labels.dE.dE00'),
    dE76: t('labels.dE.dE76'),
  }), [t]);

  // tolerance state
  const [tolerance, setTolerance] = useState(0);
  const [isToleranceEnabled, setIsToleranceEnabled] = useState(false);

  const [metric, updateMetric] = useStateObject({
    deltaE: 'dE76',
    lRatio: 1.0,
    cRatio: 1.0,
    hRatio: 1.0,
  });

  useEffect(() => {
    if (!configuration) return;
    updateIlluminants(configuration.illuminants);

    updateMetric(configuration.metric);

    updateObservers(configuration.observers);

    setTolerance(configuration.tolerance?.upperLimit ?? 0);
    setIsToleranceEnabled(Boolean(configuration.tolerance));
  }, [configuration]);

  const handleAllObserversChange = () => {
    if (Object.values(observers).every((observer) => observer === ObserverType.TenDegree)) {
      updateObservers({
        primary: ObserverType.TwoDegree,
        secondary: ObserverType.TwoDegree,
        tertiary: ObserverType.TwoDegree,
      });
      return;
    }
    updateObservers({
      primary: ObserverType.TenDegree,
      secondary: ObserverType.TenDegree,
      tertiary: ObserverType.TenDegree,
    });
  };

  const handleSaveChanges: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();

    const toleranceConfig = isToleranceEnabled
      ? {
        lowerLimit: 0,
        upperLimit: tolerance,
      }
      : undefined;

    setConfiguration({
      illuminants,
      metric,
      observers,
      tolerance: toleranceConfig,
    });
  };

  return (
    <form className={classes.root}>
      <div className={classes.left}>
        <div className={classes.header}>
          <Body className={clsx(classes.title, classes.illuminant)}>{t('labels.illuminant')}</Body>
          <Body className={clsx(classes.title, classes.observer)}>{t('labels.observer')}</Body>
        </div>

        <div className={classes.row}>
          <div className={classes.illuminant}>
            <Body className={classes.label}>{t('labels.primary')}</Body>
            <div className={classes.selectWrapper}>
              <Select
                isFullWidth
                id="primary-select"
                instanceId="primary-select"
                isMulti={false}
                value={illuminants.primary}
                data={availableIlluminants}
                onChange={(primary) => updateIlluminants({ primary })}
                disabled={disableControls}
              />
            </div>
          </div>
          <div className={classes.observer}>
            <ObserverSwitch
              handleToggle={(primary) => updateObservers({ primary })}
              value={observers.primary}
              disabled={disableControls}
            />
          </div>
        </div>

        <div className={classes.row}>
          <div className={classes.illuminant}>
            <Body className={classes.label}>{t('labels.secondary')}</Body>
            <div className={classes.selectWrapper}>
              <Select
                isFullWidth
                id="secondary-select"
                instanceId="secondary-select"
                isMulti={false}
                value={illuminants.secondary}
                data={availableIlluminants}
                onChange={(secondary) => updateIlluminants({ secondary })}
                disabled={disableControls}
              />
            </div>
          </div>
          <div className={classes.observer}>
            <ObserverSwitch
              handleToggle={(secondary) => updateObservers({ secondary })}
              value={observers.secondary}
              disabled={disableControls}
            />
          </div>
        </div>

        <div className={classes.row}>
          <div className={classes.illuminant}>
            <Body className={classes.label}>{t('labels.tertiary')}</Body>
            <div className={classes.selectWrapper}>
              <Select
                isFullWidth
                id="tertiary-select"
                instanceId="tertiary-select"
                isMulti={false}
                value={illuminants.tertiary}
                data={availableIlluminants}
                onChange={(tertiary) => updateIlluminants({ tertiary })}
                disabled={disableControls}
              />
            </div>
          </div>
          <div className={classes.observer}>
            <ObserverSwitch
              handleToggle={(tertiary) => updateObservers({ tertiary })}
              value={observers.tertiary}
              disabled={disableControls}
            />
          </div>
        </div>

        <div className={classes.row}>
          <div className={classes.illuminant}>
            <Body className={classes.label}>{t('labels.toggleAllObservers')}</Body>
          </div>
          <div className={classes.observer}>
            <ObserverSwitch
              handleToggle={handleAllObserversChange}
              value={[
                observers.primary,
                observers.secondary,
                observers.tertiary].every((observer) => observer === ObserverType.TenDegree)
                ? ObserverType.TenDegree : ObserverType.TwoDegree}
              disabled={disableControls}
            />
          </div>
        </div>

        <Button
          size="small"
          className={classes.submit}
          type="submit"
          onClick={handleSaveChanges}
          disabled={disableControls}
          showSpinner={isUpdating}
        >
          {t('labels.saveChanges')}
        </Button>
      </div>

      <div className={classes.right}>
        <div className={classes.row}>
          <Body className={classes.label}>
            {`${t('labels.defaultDeltaMetric')}:`}
          </Body>
          <Select
            id="default-metric-select"
            instanceId="default-metric-select"
            isFullWidth
            isMulti={false}
            value={metric.deltaE}
            data={availableDeltaEMetrics}
            labelProp={(option: string) => deltaEMetricLabels[option]}
            onChange={(deltaE) => updateMetric({ deltaE })}
            disabled={disableControls}
          />
        </div>

        {/* default dE tolerance */}
        <div className={classes.row}>
          <Body className={classes.label}>
            {`${t('labels.defaultDeltaTolerance')}:`}
          </Body>
          <ToggleButton
            className={classes.toleranceToggleButton}
            isChecked={isToleranceEnabled}
            onChange={setIsToleranceEnabled}
            size="small"
          />
        </div>
        <ToggleableSection show={isToleranceEnabled}>
          <div className={classes.subRow}>
            <Body className={classes.label}>
              {`${t('labels.value')}:`}
            </Body>
            <ValidationInput
              value={tolerance}
              className={classes.toleranceInput}
              onChange={(newTolerance) => setTolerance(round(newTolerance))}
              type="number"
              step={0.1}
              min={0}
            />
          </div>
        </ToggleableSection>

        <div className={classes.row}>
          <Body className={classes.label}>
            {`L:C:h ${t('labels.ratio')}`}
          </Body>
          <ColorInput
            aValue={String(metric.lRatio)}
            bValue={String(metric.cRatio)}
            cValue={String(metric.hRatio)}
            aLabel="L"
            bLabel="C"
            cLabel="h"
            handleAValueChange={(lRatio) => updateMetric({ lRatio })}
            handleBValueChange={(cRatio) => updateMetric({ cRatio })}
            handleCValueChange={(hRatio) => updateMetric({ hRatio })}
            disabled={disableControls}
          />
        </div>
      </div>
    </form>
  );
};

export default Colorimetric;
