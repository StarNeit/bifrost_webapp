import { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

import { Tiny } from '../../components/Typography';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { Component } from '../../types/component';
import Panel from '../../components/Panel';
import { makeShortName } from '../../../cypress/support/util/selectors';
import useToast from '../../data/useToast';
import { useBridgeApp } from '../../data/api/bridgeApp/bridgeAppHook';
import { useAppearanceSample } from '../../data/api';
import { useSampleId, useStandardId } from '../../data/common';
import { MeasurementIn } from '../../data/api/graphql/generated';
import BridgeAppControlPanel from './BridgeAppControlPanel';

const useStyles = makeStyles((theme) => ({
  bottomBar: {
    height: theme.spacing(7),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    background: theme.palette.background.paper,
    marginTop: theme.spacing(1.5),
  },
  section: {
    height: theme.spacing(7),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    background: theme.palette.background.paper,
  },
  input: {
    maxWidth: theme.spacing(24),
    marginLeft: theme.spacing(1.25),
    flexShrink: 0,
  },
  sampleName: {
    flexShrink: 0,
  },
  button: {
    fontSize: theme.spacing(1.5),
    letterSpacing: theme.spacing(0.25),
    height: theme.spacing(4.25),
    minWidth: theme.spacing(24),
    marginLeft: theme.spacing(1.25),
  },
}));

type Props = {
  dataTestId?: string,
};

const SaveAppearanceSampleQC: Component<Props> = ({
  dataTestId,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);
  const [sampleName, setSampleName] = useState('');
  const {
    isRequestInProgress: isMeasurementInProgress,
    requestMeasurements,
    cancelRequest,
    isReadyForRequest,
  } = useBridgeApp();

  const { selectedStandardId } = useStandardId();
  const { setSampleId } = useSampleId();
  const {
    mutation: [saveAppearanceSample],
  } = useAppearanceSample();

  const handleNameChange = (name: string) => {
    setSampleName(name);
  };

  const handleSaveAppearanceSample = async () => {
    try {
      setSaving(true);
      const measurement = await requestMeasurements();
      const newAppearanceSample = {
        name: sampleName,
        id: uuid(),
        creationDateTime: (new Date()).toISOString(),
        standardId: selectedStandardId,
        childAppearanceSamples: [],
        measurements: [measurement] as MeasurementIn[],
      };
      await saveAppearanceSample(newAppearanceSample);
      setSampleId(newAppearanceSample.id);
    } catch (e) {
      showToast('messages.sampleCreateError', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel data-testid={dataTestId} className={classes.bottomBar}>
      <div className={classes.section}>
        {saving ? (
          <BridgeAppControlPanel
            isRequestInProgress={isMeasurementInProgress}
            cancelRequest={cancelRequest}
          />
        ) : (
          <>
            <Tiny className={classes.sampleName} data-testid={`${makeShortName(dataTestId)}-label`}>{t('labels.sampleName')}</Tiny>
            <InputField
              dataTestId={`${makeShortName(dataTestId)}-input-name`}
              className={classes.input}
              value={sampleName}
              onChange={handleNameChange}
              disabled={saving}
            />
            <Button
              data-testid={`${makeShortName(dataTestId)}-button`}
              onClick={handleSaveAppearanceSample}
              className={classes.button}
              showSpinner={false}
              variant="primary"
              disabled={saving || !sampleName || !isReadyForRequest}
            >
              {t('labels.measureAndSave')}
            </Button>
          </>
        )}
      </div>
    </Panel>
  );
};

export default SaveAppearanceSampleQC;
