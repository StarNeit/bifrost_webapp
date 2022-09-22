import { useEffect } from 'react';
import { makeStyles } from '@material-ui/core';
import { v4 as uuid } from 'uuid';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppearanceSample } from '@xrite/cloud-formulation-domain-model';

import { useAppearanceSample } from '../../data/api';
import Button from '../../components/Button';
import { Component } from '../../types/component';
import {
  setWorkingAppearanceSample,
  updateWorkingTrialMeasurement,
} from '../../data/reducers/common';
import { useSelectedAppearanceSample } from '../../utils/utilsSamples';
import { useBridgeApp } from '../../data/api/bridgeApp/bridgeAppHook';
import BridgeAppControlPanel from './BridgeAppControlPanel';
import { useFormulation } from '../../data/cfe';

const useStyles = makeStyles((theme) => ({
  section: {
    height: theme.spacing(7),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    background: theme.palette.background.paper,
    columnGap: 'inherit',
  },
  button: {
    fontSize: theme.spacing(1.5),
    height: theme.spacing(4.25),
    textTransform: 'capitalize',
  },
}));

type Props = ReturnType<typeof useBridgeApp> & {
  disabled?: boolean;
};

const BridgeAppMeasurementControls: Component<Props> = (props: Props) => {
  const {
    requestMeasurements: requestBridgeMeasurements,
    isRequestInProgress: isMeasurementInProgress,
    cancelRequest: cancelMeasurementRequest,
    measurement: bridgeAppMeasurement,
    disabled,
  } = props;

  const { t } = useTranslation();
  const classes = useStyles();

  const dispatch = useDispatch();

  const {
    selectedStandardId,
    selectedSample: originalSample,
  } = useSelectedAppearanceSample();

  const workingAppearanceSamples = useSelector((state) => state.common.workingAppearanceSamples);

  const selectedWorkingSample = workingAppearanceSamples.find(
    (sample) => sample.id === originalSample?.id,
  );

  const selectedSample = selectedWorkingSample ?? originalSample;

  const selectedSampleIsTrial = (
    Boolean(selectedSample)
    && Boolean(selectedSample?.parentAppearanceSampleId)
    && Boolean(selectedSample?.measurements.length)
  );

  const {
    result: savedAppearanceSamples,
  } = useAppearanceSample({ query: { parentId: selectedStandardId || '' } });

  const handleMeasure = () => {
    requestBridgeMeasurements(true, 'formulationMeasurement');
  };
  const {
    result: formulationResult,
  } = useFormulation();

  const selectedAppearanceSample = formulationResult
    ? [
      ...(formulationResult.formulationResults ?? []),
      ...(formulationResult.searchResults ?? []),
    ].find(
      ({ sample: { id } }) => id === selectedSample?.id,
    )?.sample : savedAppearanceSamples?.find(
      ({ id }) => id === selectedSample?.id,
    );

  useEffect(() => {
    if (!bridgeAppMeasurement || !selectedAppearanceSample) return;

    if (selectedWorkingSample) {
      dispatch(updateWorkingTrialMeasurement({
        sampleId: selectedWorkingSample.id,
        measurements: [bridgeAppMeasurement],
      }));
    } else {
      const measurementAppearanceSample = AppearanceSample
        .parse({
          name: 'Measurement',
          id: uuid(),
          creationDateTime: (new Date()).toISOString(),
          standardId: selectedAppearanceSample.standardId,
          substrateId: selectedAppearanceSample.substrateId,
          childAppearanceSamples: [],
          parentAppearanceSampleId: selectedAppearanceSample.id,
          measurements: [bridgeAppMeasurement],
        });
      dispatch(setWorkingAppearanceSample(measurementAppearanceSample));
    }
  }, [bridgeAppMeasurement]);

  return (
    <div className={classes.section}>
      <Button
        data-testid="measure-btn"
        variant="primary"
        className={classes.button}
        onClick={handleMeasure}
        disabled={isMeasurementInProgress || selectedSampleIsTrial || disabled}
      >
        {t('labels.measure')}
      </Button>
      <BridgeAppControlPanel
        isRequestInProgress={isMeasurementInProgress}
        cancelRequest={cancelMeasurementRequest}
      />
    </div>
  );
};

export default BridgeAppMeasurementControls;
