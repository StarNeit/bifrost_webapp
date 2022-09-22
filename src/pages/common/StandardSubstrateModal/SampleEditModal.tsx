import { makeStyles } from '@material-ui/core';
import { AppearanceSample, Measurement } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import { v4 as uuid } from 'uuid';
import {
  MouseEvent, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { Component } from '../../../types/component';
import DMSBrowser from '../DMSBrowser';
import ConfirmationPopover from '../../../components/ConfirmationPopover';
import FullScreenDialog from '../../../components/FullScreenDialog';
import Header from './Header';
import ModalWidget from '../../../widgets/ModalWidget';
import FileBrowserForStandard from './FileBrowser/FileBrowserForStandard';
import { ModalProps } from '../../../types/modal';
import { IMPORT_SOURCE } from '../../../constants/ui';
import { Body } from '../../../components/Typography';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { useAppearanceSample } from '../../../data/api';
import { FormulaIn, Maybe, MeasurementIn } from '../../../data/api/graphql/generated';
import { useSampleModalWidgetConfiguration } from '../../../data/configurations';
import { useSampleId, useStandardId } from '../../../data/common';

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    display: 'flex',
    marginTop: theme.spacing(4),
    overflow: 'hidden',
    '& > div:first-child': {
      flex: `0 0 ${theme.spacing(69.75)}px`,
    },
  },
  section: {
    flex: 1,
    marginLeft: theme.spacing(3),
  },
  row: {
    display: 'flex',
    marginBottom: theme.spacing(3.5),
  },
  widget: {
    minHeight: theme.spacing(60),
  },
  label: {
    minWidth: theme.spacing(12.5),
    paddingTop: theme.spacing(1),
  },
  formInput: {
    width: '100%',
  },
  saveButton: {
    fontSize: theme.spacing(1.5),
    letterSpacing: '1.5px',
    height: theme.spacing(5.25),
    width: `calc(100% - ${theme.spacing(12.5)}px)`,
    textTransform: 'capitalize',
    float: 'right',
  },
}));

const toUpdateSample = (sample: AppearanceSample, name: string, measurement?: Measurement) => {
  const { id } = sample;
  const creationDateTime = (new Date()).toISOString();
  return ({
    id,
    name,
    creationDateTime,
    standardId: sample.standardId,
    substrateId: sample.substrateId,
    parentAppearanceSampleId: sample.parentAppearanceSampleId,
    measurements: (measurement
      ? [measurement]
      : sample.measurements
    ) as unknown as Maybe<MeasurementIn>[],
    formula: sample.formula ? {
      ...sample.formula,
      formulationSettings: JSON.stringify(sample.formula?.formulationSettings),
    } as unknown as FormulaIn : undefined,
  });
};

const toSaveSample = (sample: AppearanceSample, name: string, measurement: Measurement) => {
  const id = uuid();
  const creationDateTime = (new Date()).toISOString();
  return ({
    id,
    name,
    creationDateTime,
    standardId: sample.standardId,
    substrateId: sample.substrateId,
    parentAppearanceSampleId: sample.id,
    measurements: [measurement] as unknown as Maybe<MeasurementIn>[],
    formula: undefined,
  });
};

const SampleEditModal: Component<ModalProps> = ({
  isOpen,
  closeModal,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();

  // confirmation
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const [updatingSample, setUpdatingSample] = useState(false);

  const { selectedStandardId } = useStandardId();
  const { selectedSampleId } = useSampleId();
  const { result: savedAppearanceSamples } = useAppearanceSample(
    { query: { parentId: selectedStandardId } },
  );
  const selectedSample = savedAppearanceSamples?.find(({ id }) => id === selectedSampleId);

  const initialSampleName = selectedSample?.name;
  const [modifiedSampleName, setModifiedSampleName] = useState<string>();
  const selectedSampleName = modifiedSampleName ?? initialSampleName;

  const initialMeasurement = selectedSample?.measurements[0];
  const [modifiedMeasurement, setModifiedMeasurement] = useState<Measurement>();
  const selectedMeasurement = modifiedMeasurement ?? initialMeasurement;

  const nameWasModified = Boolean(
    modifiedSampleName
    && modifiedSampleName.trim() !== initialSampleName,
  );
  const measurementWasModified = Boolean(
    modifiedMeasurement
    && modifiedMeasurement?.id !== initialMeasurement?.id,
  );

  const isTrial = Boolean(selectedSample?.measurements.length);

  // TODO: remove when modal is refactored to mount/unmount (EFXW-1903)
  useEffect(() => {
    setModifiedMeasurement(undefined);
    setModifiedSampleName(undefined);
  }, [isOpen]);

  const {
    fetching,
    mutation: [saveAppearanceSample],
    update: [updateAppearanceSample],
  } = useAppearanceSample({ query: { parentId: selectedStandardId || '' } });

  const handleNameChange = (name: string) => {
    setModifiedSampleName(name);
  };

  const handleMeasurementChange = (newMeasurement: Measurement) => {
    setModifiedMeasurement(newMeasurement);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStandardSelected = (newMeasurement: Measurement, name: string) => {
    handleMeasurementChange(newMeasurement);
  };

  const handleSubmit = async () => {
    if (!selectedSample || !selectedSampleName || (isTrial && !selectedMeasurement)) return;

    setUpdatingSample(true);

    if (isTrial) {
      // update new trial
      await updateAppearanceSample({
        appearanceSampleAppearanceSampleIn: toUpdateSample(
          selectedSample,
          selectedSampleName,
          selectedMeasurement,
        ),
      });
    } else if (!isTrial && modifiedMeasurement) {
      // create a new trial
      await saveAppearanceSample(
        toSaveSample(selectedSample, selectedSampleName, modifiedMeasurement),
      );
    } else {
      // update the sample, currently only updating of the name is available
      await updateAppearanceSample({
        appearanceSampleAppearanceSampleIn: toUpdateSample(
          selectedSample,
          selectedSampleName,
          selectedMeasurement,
        ),
      });
    }

    setUpdatingSample(false);

    closeModal();
  };

  const canUpdate = Boolean(
    (
      measurementWasModified
      || nameWasModified
    )
    && !fetching
    && !updatingSample,
  );

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    if (canUpdate) {
      setAnchorEl(e.currentTarget);
    } else {
      closeModal();
    }
  };

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useSampleModalWidgetConfiguration();

  let buttonTitle = '';
  if (isTrial) {
    buttonTitle = t('labels.updateTrial');
  } else if (measurementWasModified) {
    buttonTitle = t('labels.saveTrial');
  } else {
    buttonTitle = t('labels.updateSample');
  }
  return (
    <>
      <FullScreenDialog
        headerTitle={isTrial ? t('labels.editTrial') : t('labels.editSample')}
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <Header
          importSource={importSource}
          onImportSourceChange={setImportSource}
          onMeasurementChange={handleMeasurementChange}
          pantoneImportEnabled={false}
        />

        <div className={classes.content}>
          <div className={classes.section}>
            <div className={classes.row}>
              <Body className={classes.label}>{t('labels.sample')}</Body>
              <InputField
                dataTestId="new-sample-name"
                className={classes.formInput}
                placeholder={t('labels.enterName')}
                value={selectedSampleName}
                onChange={handleNameChange}
              />
            </div>
            <Button
              data-testid="save-new-standard-button"
              color="primary"
              className={classes.saveButton}
              disabled={!canUpdate}
              onClick={handleSubmit}
              showSpinner={updatingSample}
            >
              {buttonTitle}
            </Button>
          </div>
          <div className={classes.section}>
            <div className={clsx(classes.row, classes.widget)}>
              {widgetConfiguration && (
                <ModalWidget
                  dataTestId="new-sample"
                  configuration={widgetConfiguration}
                  setConfiguration={setConfiguration}
                  measurement={selectedMeasurement}
                  measurementName={selectedSampleName}
                />
              )}
            </div>
          </div>

          <div className={classes.section}>
            {importSource === IMPORT_SOURCE.DMS && (
              <DMSBrowser onJobSelected={handleMeasurementChange} />
            )}
            {importSource === IMPORT_SOURCE.FILE && (
              <FileBrowserForStandard onFileSelected={handleStandardSelected} />
            )}
          </div>
        </div>
      </FullScreenDialog>
      <ConfirmationPopover
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(undefined)}
        onConfirm={() => {
          setAnchorEl(undefined);
          closeModal();
        }}
        anchorEl={anchorEl}
        message={t('labels.doYouWantToSave')}
        cancelText={t('labels.cancel')}
        confirmText={t('labels.dontSave')}
      />
    </>
  );
};

export default SampleEditModal;
