import { useEffect, useState } from 'react';
import { makeStyles, Link } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppearanceSample, Formula } from '@xrite/cloud-formulation-domain-model';
import clsx from 'clsx';

import { Tiny } from '../../components/Typography';
import { useAppearanceSample } from '../../data/api';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import { Component } from '../../types/component';
import Panel from '../../components/Panel';
import useToast from '../../data/useToast';
import {
  FormulaIn, FormulaLayerIn, Maybe, MeasurementIn,
} from '../../data/api/graphql/generated';
import {
  clearWorkingAppearanceSamples,
  removeRelatedWorkingAppearanceSamples,
  selectSampleId,
  setIsNewSamplePopupVisible,
} from '../../data/reducers/common';
import { useSelectedAppearanceSample } from '../../utils/utilsSamples';
import { makeShortName } from '../../../cypress/support/util/selectors';
import BridgeAppMeasurementControls from './BridgeAppMeasurementControls';
import { useBridgeApp } from '../../data/api/bridgeApp/bridgeAppHook';

const useStyles = makeStyles((theme) => ({
  bottomBar: {
    height: theme.spacing(7),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    columnGap: theme.spacing(2),
  },
  rightSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  input: {
    maxWidth: theme.spacing(24),
    marginLeft: theme.spacing(1.25),
    flexShrink: 0,
  },
  linkProceed: {
    marginLeft: theme.spacing(1.5),
    flexShrink: 0,
  },
  sampleName: {
    flexShrink: 0,
  },
  button: {
    fontSize: theme.spacing(1.5),
    height: theme.spacing(4.25),
    textTransform: 'capitalize',
    flexShrink: 0,
  },
}));

type Props = {
  isCorrectionSample?: boolean,
  dataTestId?: string,
};

const toSaveFormula = (formula: Formula): Maybe<FormulaIn> => ({
  id: formula.id,
  assortmentId: formula.assortmentId,
  predictionMeasurements: formula.predictionMeasurements as unknown as Maybe<MeasurementIn>[],
  formulaLayers: formula.formulaLayers as Array<Maybe<FormulaLayerIn>>,
  formulationSettings: JSON.stringify(formula.formulationSettings),
});

const toSaveSample = (sample: AppearanceSample, name: string) => ({
  id: sample.id,
  name: name.trim(),
  creationDateTime: sample.creationDateTime,
  standardId: sample.standardId,
  substrateId: sample.substrateId,
  parentAppearanceSampleId: sample.parentAppearanceSampleId ?? null,
  measurements: sample.measurements as unknown as Maybe<MeasurementIn>[],
  formula: !sample.formula ? null : toSaveFormula(sample.formula),
});

const SaveAppearanceSample: Component<Props> = ({
  isCorrectionSample = false,
  dataTestId,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const dispatch = useDispatch();

  const {
    selectedStandardId,
    selectedSample: originalSample,
    type,
  } = useSelectedAppearanceSample();

  const {
    isRequestInProgress: isMeasurementInProgress,
    ...restBrigeAppProps
  } = useBridgeApp();

  const [sampleName, setSampleName] = useState<string>('');

  // the sample when it's formula is edited or newly measured sample
  const workingAppearanceSamples = useSelector((state) => state.common.workingAppearanceSamples);

  const selectedWorkingSample = workingAppearanceSamples.find(
    (sample) => sample.id === originalSample?.id,
  );
  const selectedWorkingSampleIsTrial = Boolean(
    selectedWorkingSample?.parentAppearanceSampleId && selectedWorkingSample.measurements,
  );
  const selectedWorkingSampleIsChild = Boolean(
    selectedWorkingSample?.parentAppearanceSampleId && !selectedWorkingSample.measurements,
  );

  const selectedParentWorkingSample = workingAppearanceSamples.find(
    (sample) => sample.id === originalSample?.parentAppearanceSampleId,
  );
  const selectedChildWorkingSample = workingAppearanceSamples.find(
    (sample) => sample.parentAppearanceSampleId === originalSample?.id,
  );
  const { isNewSamplePopupVisible } = useSelector((state) => state.common);

  const selectedSample = selectedWorkingSample ?? originalSample;
  const selectedSampleIsChild = (
    Boolean(selectedSample)
    && Boolean(selectedSample?.parentAppearanceSampleId)
    && !selectedSample?.measurements.length
  );
  const selectedSampleIsTrial = Boolean(
    selectedSample
    && selectedSample?.parentAppearanceSampleId
    && selectedSample?.measurements.length,
  );

  const selectedSampleIsModified = Boolean(selectedWorkingSample);

  // in case of a trial without formula and can size change happens
  const selectedSampleHasModifiedParent = Boolean(selectedParentWorkingSample);

  const selectedSampleHasModifiedChild = Boolean(
    Boolean(selectedChildWorkingSample)
    && !selectedChildWorkingSample?.measurements.length,
  );

  const selectedSampleHasModifiedTrial = Boolean(
    selectedChildWorkingSample
    && selectedChildWorkingSample.measurements.length,
  );

  const selectedSampleIsCorrection = type === 'correctionEntry';

  const {
    result: savedAppearanceSamples,
    fetching,
    mutation: [saveAppearanceSample],
    update: [updateAppearanceSample],
  } = useAppearanceSample({ query: { parentId: selectedStandardId || '' } });

  const isSavedInDB = savedAppearanceSamples?.some(
    ({ id }) => id === selectedSample?.id,
  );
  const isChildSavedInDB = savedAppearanceSamples?.some(
    ({ id }) => id === selectedChildWorkingSample?.id,
  );

  useEffect(() => {
    setSampleName(originalSample?.name ?? '');
    return () => {
      if (isSavedInDB && selectedSample) {
        dispatch(removeRelatedWorkingAppearanceSamples({
          sampleId: selectedSample.id,
          parentSampleId: selectedSample?.parentAppearanceSampleId,
        }));
      }
    };
  }, [originalSample?.id]);

  const sampleHasMeasurements = Boolean(originalSample?.measurements?.length);
  const handleNameChange = (name: string) => {
    setSampleName(name);
  };

  const nameChanged = sampleName && originalSample?.name !== sampleName.trim();

  let buttonTitle = t('labels.save');
  if (selectedSample) {
    if (!isSavedInDB) {
      if (selectedSampleIsCorrection) {
        buttonTitle = t('labels.saveCorrection');
        if (selectedSampleHasModifiedChild) {
          buttonTitle = t('labels.saveCorrectionAndRecipe');
        }
        if (selectedSampleHasModifiedTrial) {
          buttonTitle = t('labels.saveCorrectionAndTrial');
        }
      } else if (selectedSampleIsModified && selectedSampleHasModifiedChild) {
        buttonTitle = t('labels.saveFormulas');
      } else if (selectedSampleHasModifiedChild) {
        buttonTitle = t('labels.saveFormulas');
      } else if (selectedSampleHasModifiedTrial) {
        buttonTitle = t('labels.saveFormulaAndTrial');
      } else if (selectedSampleIsModified) {
        buttonTitle = t('labels.saveFormula');
      } else {
        // if it's the initial recipe
        buttonTitle = t('labels.saveFormula');
      }
    } else {
      // we also have to do it for the current type, and we can pull that from type
      // if the working sample is saved and it's only modified itself
      if (selectedSampleIsChild || selectedWorkingSampleIsChild) {
        buttonTitle = t('labels.updateFormula');
      } if (selectedSampleHasModifiedParent) {
        buttonTitle = t('labels.updateFormula');
        if (selectedWorkingSampleIsTrial) {
          buttonTitle = t('labels.updateFormulaAndTrial');
        }
      } else if (selectedWorkingSampleIsTrial || selectedSampleIsTrial) {
        buttonTitle = t('labels.updateTrial');
      } else {
        buttonTitle = t('labels.updateFormula');
      }

      // if the saved entry has modified child or trial
      if (selectedSampleHasModifiedChild) {
        buttonTitle = t('labels.saveFormula');

        if (selectedSampleIsModified) {
          buttonTitle = t('labels.saveFormulas');
        }
      } else if (selectedSampleHasModifiedTrial) {
        buttonTitle = t('labels.saveTrial');

        if (selectedSampleIsModified) {
          buttonTitle = t('labels.saveFormulaAndTrial');
        }
      }
    }
  }

  const handleSaveAppearanceSample = async () => {
    if (!sampleName) {
      showToast(t('messages.enterTheName'), 'error');
      return;
    }
    try {
      setSaving(true);

      if (isSavedInDB) {
        // selected sample itself logic
        if (selectedSampleIsModified && selectedWorkingSample) {
          // selectedChildWorkingSample is original/modified original recipe
          const sampleToBeUpdated = toSaveSample(selectedWorkingSample, sampleName);

          await updateAppearanceSample({
            appearanceSampleAppearanceSampleIn: sampleToBeUpdated,
          });
        } else if (
          nameChanged
          && originalSample
          // makes sure the original sample does not take the name from the trial/child/parent
          && !selectedSampleHasModifiedParent
          && !selectedSampleHasModifiedChild
          && !selectedSampleHasModifiedTrial
        ) {
          // only name was changed of the recipe
          const sampleToBeUpdated = toSaveSample(originalSample, sampleName);

          await updateAppearanceSample({
            appearanceSampleAppearanceSampleIn: sampleToBeUpdated,
          });
        }

        // parent logic
        if (selectedSampleHasModifiedParent && selectedParentWorkingSample) {
          const sampleToBeUpdated = toSaveSample(selectedParentWorkingSample, sampleName);

          await updateAppearanceSample({
            appearanceSampleAppearanceSampleIn: sampleToBeUpdated,
          });
        }

        // child/trial logic
        if (
          (selectedSampleHasModifiedChild || selectedSampleHasModifiedTrial)
          && selectedChildWorkingSample
        ) {
          // selectedChildWorkingSample is either a child or a trial
          const sampleToBeUpdated = toSaveSample(selectedChildWorkingSample, sampleName);

          if (isChildSavedInDB) {
            await updateAppearanceSample({
              appearanceSampleAppearanceSampleIn: sampleToBeUpdated,
            });
          } else {
            // create a new child
            await saveAppearanceSample(sampleToBeUpdated);
          }
        }

        return;
      }

      if (selectedSampleIsModified && selectedWorkingSample) {
        const sampleToBeCreated = toSaveSample(selectedWorkingSample, sampleName);

        await saveAppearanceSample(sampleToBeCreated);
      } else if (originalSample) {
        const sampleToBeCreated = toSaveSample(originalSample, sampleName);

        await saveAppearanceSample(sampleToBeCreated);
      }

      if (
        (selectedSampleHasModifiedChild || selectedSampleHasModifiedTrial)
        && selectedChildWorkingSample
      ) {
        const sampleToBeCreated = toSaveSample(selectedChildWorkingSample, sampleName);

        await saveAppearanceSample(sampleToBeCreated);
      }
    } finally {
      setSaving(false);
      dispatch(clearWorkingAppearanceSamples());
      const sampleId = (
        selectedChildWorkingSample?.id
        ?? selectedWorkingSample?.id
        ?? selectedParentWorkingSample?.id
        ?? originalSample?.id
      );

      if (sampleId) dispatch(selectSampleId(sampleId));
    }
  };

  const disabledInput = fetching || saving;
  const disabledButton = fetching || saving || !selectedSample || (isSavedInDB && !(
    nameChanged
    || selectedSampleIsModified
    || selectedSampleHasModifiedParent
    || selectedSampleHasModifiedChild
    || selectedSampleHasModifiedTrial
  ));

  return (
    <Panel data-testid={dataTestId} className={classes.bottomBar}>
      <div className={classes.section}>
        <BridgeAppMeasurementControls
          {...restBrigeAppProps}
          isRequestInProgress={isMeasurementInProgress}
          disabled={!selectedSample || selectedSampleIsTrial}
        />
        {!isMeasurementInProgress && (
          <Button
            variant="primary"
            className={classes.button}
            onClick={() => dispatch(setIsNewSamplePopupVisible(!isNewSamplePopupVisible))}
            disabled={!selectedSample || selectedSampleIsTrial}
          >
            {t('labels.newTrial')}
          </Button>
        )}
      </div>
      {!isMeasurementInProgress && (
        <div className={clsx(classes.section, classes.rightSection)}>
          <Tiny className={classes.sampleName} data-testid={`${makeShortName(dataTestId)}-label`}>{t('labels.sampleName')}</Tiny>
          <InputField
            dataTestId={`${makeShortName(dataTestId)}-input-name`}
            className={classes.input}
            value={sampleName}
            onChange={handleNameChange}
            disabled={disabledInput}
          />
          <Button
            data-testid={`${makeShortName(dataTestId)}-button`}
            onClick={handleSaveAppearanceSample}
            className={classes.button}
            showSpinner={fetching || saving}
            variant="primary"
            disabled={disabledButton}
          >
            {buttonTitle}
          </Button>
          {(!isCorrectionSample && isSavedInDB && sampleHasMeasurements) && (
          <Link
            data-testid={`${makeShortName(dataTestId)}-proceed`}
            href="/#/correct"
            className={classes.linkProceed}
          >
            {t('labels.proceedingCorrection')}
          </Link>
          )}

        </div>
      )}
    </Panel>
  );
};

export default SaveAppearanceSample;
