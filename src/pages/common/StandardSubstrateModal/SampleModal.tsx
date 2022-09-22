import { makeStyles } from '@material-ui/core';
import { AppearanceSample, Measurement } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';
import { v4 as uuid } from 'uuid';
import {
  MouseEvent, useEffect, useMemo, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

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
import { useSelectedAppearanceSample } from '../../../utils/utilsSamples';
import { useAppearanceSample } from '../../../data/api';
import { Maybe, MeasurementIn } from '../../../data/api/graphql/generated';
import { setWorkingAppearanceSample, selectSampleId, setExpandedSampleTreeIds } from '../../../data/reducers/common';
import { useSampleModalWidgetConfiguration } from '../../../data/configurations';

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    display: 'flex',
    marginTop: theme.spacing(4),
    overflow: 'hidden',
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
    measurements: [Measurement.parse({
      ...measurement,
      id: uuid(),
    })] as unknown as Maybe<MeasurementIn>[],
    formula: undefined,
  });
};

type Props = ModalProps & {
  isStandardSelected: boolean;
};

const getAncestorSampleIds = (samples: AppearanceSample[], id: string): string[] => {
  const sample = samples.find((s) => s.id === id);
  if (!sample) return [];
  const parent = samples.find((s) => s.id === sample.parentAppearanceSampleId);
  if (!parent) return [id];
  return [...getAncestorSampleIds(samples, parent.id), id];
};

const SampleModal: Component<Props> = ({
  isOpen,
  closeModal,
  isStandardSelected,
}) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [importSource, setImportSource] = useState<IMPORT_SOURCE>();
  const [measurement, setMeasurement] = useState<Measurement>();

  // confirmation
  const [isEdited, setIsEdited] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement>();

  const [creatingSample, setCreatingSample] = useState(false);

  // TODO: remove when modal is refactored to mount/unmount (EFXW-1903)
  useEffect(() => {
    setMeasurement(undefined);
    setIsEdited(false);
  }, [isOpen]);

  const {
    selectedStandardId,
    selectedSample,
  } = useSelectedAppearanceSample();

  const {
    result: savedAppearanceSamples,
    fetching,
    mutation: [saveAppearanceSample],
  } = useAppearanceSample({ query: { parentId: selectedStandardId || '' } });

  const selectedSampleId = selectedSample?.id || '';
  const isParentSampleSavedInDB = savedAppearanceSamples?.find(
    (sample) => sample.id === selectedSampleId,
  );

  const [sampleName, setSampleName] = useState<string>('');
  useEffect(() => {
    setSampleName(selectedSample?.name ?? '');
  }, [selectedSampleId]);

  const handleNameChange = (name: string) => {
    setSampleName(name);
    setIsEdited(true);
  };

  const handleClose = (e: MouseEvent<HTMLButtonElement>) => {
    if (isEdited) {
      setAnchorEl(e.currentTarget);
    } else {
      closeModal();
    }
  };

  const handleMeasurementChange = (newMeasurement: Measurement) => {
    setMeasurement(newMeasurement);
    setIsEdited(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleStandardSelected = (newMeasurement: Measurement, name: string) => {
    handleMeasurementChange(newMeasurement);
  };

  const handleSave = async () => {
    if (!sampleName || !measurement) return;
    setCreatingSample(true);

    if (isStandardSelected) {
      const newRecipeSample = new AppearanceSample({
        id: uuid(),
        name: sampleName,
        standardId: selectedStandardId,
        measurements: [Measurement.parse({
          ...measurement,
          id: uuid(),
        })],
      });

      // TODO: MeasurementSpot is not the same for the Domain Model and GRAPHQL Schema
      // TODO: After Dani fix this, remove any and everything will work fine
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await saveAppearanceSample(newRecipeSample as any);

      dispatch(selectSampleId(newRecipeSample.id));
    } else if (selectedSample) {
      const newTrialSample = toSaveSample(selectedSample, sampleName, measurement);
      // if parent recipe is in the database, save the trial
      if (isParentSampleSavedInDB && savedAppearanceSamples) {
        await saveAppearanceSample(newTrialSample);

        dispatch(selectSampleId(newTrialSample.id));

        const ancestorIds = getAncestorSampleIds(
          savedAppearanceSamples, newTrialSample.parentAppearanceSampleId,
        );

        dispatch(setExpandedSampleTreeIds({ ids: ancestorIds, persist: true }));
      } else {
        // if the sample is on the fly (formulation entry...) add it to working sample
        dispatch(setWorkingAppearanceSample(AppearanceSample.parse(newTrialSample)));
      }
    }

    setCreatingSample(false);

    closeModal();
  };

  const canSave = useMemo(
    () => Boolean(measurement && sampleName && !fetching && !creatingSample),
    [measurement, sampleName, fetching, creatingSample],
  );

  const {
    configuration: widgetConfiguration,
    debouncedSetConfiguration: setConfiguration,
  } = useSampleModalWidgetConfiguration();

  return (
    <>
      <FullScreenDialog
        headerTitle={isStandardSelected ? t('labels.newSample') : t('labels.newTrial')}
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
                value={sampleName}
                onChange={handleNameChange}
              />
            </div>
            <Button
              data-testid="save-new-standard-button"
              color="primary"
              className={classes.saveButton}
              disabled={!canSave}
              onClick={handleSave}
              showSpinner={creatingSample}
            >
              {isParentSampleSavedInDB && t('labels.saveTrial')}
              {!isParentSampleSavedInDB && !isStandardSelected && t('labels.associateTrial')}
              {isStandardSelected && t('labels.saveSample')}
            </Button>
          </div>
          <div className={classes.section}>
            <div className={clsx(classes.row, classes.widget)}>
              { widgetConfiguration && (
                <ModalWidget
                  dataTestId="new-sample"
                  configuration={widgetConfiguration}
                  setConfiguration={setConfiguration}
                  measurement={measurement}
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
            {importSource === IMPORT_SOURCE.PANTONE && (
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

export default SampleModal;
