import { useEffect, useState, useMemo } from 'react';
import Fade from '@material-ui/core/Fade';
import { makeStyles } from '@material-ui/core/styles';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import clsx from 'clsx';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';

import {
  AppearanceSample,
  Colorant,
  ColorantType,
  Formula,
} from '@xrite/cloud-formulation-domain-model';
import CollapsedPane from './CorrectionSetupPane/CollapsedPane';
import ExpandedPane from './CorrectionSetupPane/ExpandedPane';
import AnimationContainer from '../../components/AnimationContainer';
import { ClassNameProps, Component } from '../../types/component';
import {
  FormulationComponent,
  MetricType,
  OpacityMode,
} from '../../types/formulation';
import { scrollbars } from '../../theme/components';
import {
  useColorants,
  useAssortment,
  useSubstrate,
  useStandard,
} from '../../data/api/cfdb';
import Button from '../../components/Button';
import { useCorrection } from '../../data/cfe';
import {
  selectComponents as selectComponentsAction,
  selectClears as selectClearsAction,
  setConcentration,
  setRequiredComponentIds,
  setCorrectionResults,
  setTotalMode,
  toggleCorrectionSettings,
} from '../../data/reducers/correction';
import {
  isColorantAClear,
  isOpacityMode,
  isRecipeOutputMode,
} from '../../utils/utils';
import { useBridgeApp } from '../../data/api/bridgeApp/bridgeAppHook';
import { useColorimetricConfiguration } from '../../data/configurations';
import { convertColorantsToComponents, getFormulationInputColorants } from '../Formulation/utils';
import { setWorkingAppearanceSample, updateWorkingTrialMeasurement } from '../../data/reducers/common';
import { useSelectedAppearanceSample } from '../../utils/utilsSamples';
import { isFormulationSettings } from '../../utils/utilsFormulation';
import { storeTestData } from '../../utils/test-utils';
import useToast from '../../data/useToast';
import { useFormulationDefaults } from '../../data/api/formulationDefaults';
import { RecipeOutputMode } from '../../types/recipe';
import {
  allRecipeUnits,
  computeCanSizeFromComponents,
  convertRecipeUnit,
  defaultGravimetricUnit,
} from '../../utils/utilsRecipe';
import BridgeAppControlPanel from '../common/BridgeAppControlPanel';
import { getViewingConditions } from '../../data/common';
import { getColorimetricStandardColorSpec, isColorimetricStandard } from '../../utils/utilsStandard';
import { assembleMeasurementSamplesByConditionSingle, isCompatibleWithCondition } from '../../utils/utilsMeasurement';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflowY: 'auto',
    overflowX: 'hidden',
    ...scrollbars(theme),
  },
  fadeContent: {
    width: '100%',
    position: 'absolute',
  },
  buttonContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    marginTop: theme.spacing(2),
  },
  buttonMargin: {
    margin: theme.spacing(1.5, 0),
  },
  button: {
    fontSize: theme.spacing(1.5),
    letterSpacing: theme.spacing(0.25),
    height: theme.spacing(5.25),
    textTransform: 'capitalize',
  },
}));

const getDefaultComponentSelection = (
  formula: Formula | undefined,
  colorants: Colorant[] | undefined,
  components: FormulationComponent[] | undefined,
  recipeOutputMode: RecipeOutputMode,
  mode: 'New' | 'Add',
) => {
  if (!formula || !colorants || !components) {
    return { clearIds: [], componentIds: [] };
  }

  const defaultColorantFilter = (colorant: Colorant) => formula.formulaLayers.some(
    (layer) => layer.formulaComponents.some(
      (component) => component.colorant.id === colorant.id,
    ),
  );

  const colorantFilter = (mode === 'New')
    ? defaultColorantFilter
    : (colorant: Colorant) => {
      const contained = defaultColorantFilter(colorant);
      return contained && !colorant.isLeftover;
    };

  const selectedColorants = colorants
    .filter((colorant) => !isColorantAClear(colorant))
    .filter(colorantFilter);

  const selectedClears = colorants
    .filter(isColorantAClear)
    .filter(defaultColorantFilter);

  if (selectedClears.length === 0) {
    const clearIdFromSettings = formula.formulationSettings?.clearId;
    if (isString(clearIdFromSettings)) {
      const clear = colorants.find(
        (colorant) => colorant.id === clearIdFromSettings
          || colorant.components.some(
            ({ basicMaterial }) => basicMaterial.id === clearIdFromSettings,
          ),
      );
      if (clear) selectedClears.push(clear);
    }
  }

  if (selectedClears.length === 0) {
    const clear = colorants.find((colorant) => colorant.type === ColorantType.Clear);
    if (clear) selectedClears.push(clear);
  }

  const componentFilterFunc = recipeOutputMode === RecipeOutputMode.BasicMaterial
    ? (colorantList: Colorant[], { id }: { id: string }) => colorantList.some(
      (colorant) => id === colorant.id
        || colorant.components.some((comp) => comp.basicMaterial.id === id),
    )
    : (colorantList: Colorant[], { id }: { id: string }) => colorantList.some(
      (colorant) => id === colorant.id,
    );

  const componentIds = components
    .filter((component) => componentFilterFunc(selectedColorants, component))
    .map(({ id }) => id);

  const clearIds = components
    .filter((component) => componentFilterFunc(selectedClears, component))
    .map(({ id }) => id);

  return { clearIds, componentIds };
};

const CorrectionSetupPane: Component<ClassNameProps> = ({ className }) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { showToast } = useToast();

  const [isFolded, setIsFolded] = useState(false);

  const { configuration: colorimetricConfiguration } = useColorimetricConfiguration();
  const viewingConditions = useMemo(
    () => getViewingConditions(colorimetricConfiguration), [colorimetricConfiguration],
  );
  const [defaults] = useFormulationDefaults();

  const {
    correctionMode,
    maxAddPercentage,
    selectedClearIds,
    selectedComponentIds,
    totalMode,
    concentrationPercentages,
    requiredComponentIds,
  } = useSelector((state) => state.correction);

  const handleConcentrationChange = (
    componentId: string,
    minConcentrationPercentage?: number,
    maxConcentrationPercentage?: number,
  ) => {
    dispatch(setConcentration({
      componentId,
      minConcentrationPercentage,
      maxConcentrationPercentage,
    }));
  };

  const handleRequired = (componentId: string, checked: boolean) => {
    dispatch(setRequiredComponentIds({ componentId, operation: checked ? 'add' : 'remove' }));
  };

  const {
    selectedStandardId,
    selectedSample,
    formulaSample,
    type,
    fetching: samplesFetching,
  } = useSelectedAppearanceSample();

  const workingAppearanceSamples = useSelector((state) => state.common.workingAppearanceSamples);
  const selectedWorkingSample = workingAppearanceSamples.find(
    (sample) => sample.parentAppearanceSampleId === selectedSample?.id,
  );

  const trialMeasurements = selectedSample?.measurements;

  const {
    result: standard,
    fetching: standardFetching,
  } = useStandard({ id: selectedStandardId });

  const formula = formulaSample?.formula;
  const formulaAssortmentId = formula?.assortmentId;
  const {
    result: assortment,
    fetching: assortmentFetching,
  } = useAssortment(formulaAssortmentId);

  if (assortment) {
    storeTestData('correctionSelectedAssortment', {
      value: {
        id: assortment.id,
        industry: assortment.industry,
        name: assortment.name,
        subIndustry: assortment.subIndustry,
      },
      label: assortment.name,
    });
  }

  const {
    result: colorants,
    fetching: colorantsFetching,
  } = useColorants(formulaAssortmentId);
  const {
    result: substrate,
    fetching: substrateFetching,
  } = useSubstrate(formulaSample?.substrateId);

  // recover formulation parameters from formula settings object
  const settings = formula?.formulationSettings;
  const settingsOutputMode = settings?.recipeOutputMode;
  const recipeOutputMode = isRecipeOutputMode(settingsOutputMode)
    ? settingsOutputMode
    : RecipeOutputMode.ProductionReady;

  const settingsCalibCondition = settings?.calibrationConditionId;
  let calibrationConditionId = isString(settingsCalibCondition)
    ? settingsCalibCondition
    : assortment?.calibrationConditions[0]?.id;
  let calibrationCondition = assortment?.calibrationConditions.find(
    ({ id }) => id === calibrationConditionId,
  );
  if (!calibrationCondition && assortment?.calibrationConditions.length) {
    calibrationCondition = assortment?.calibrationConditions[0];
    calibrationConditionId = calibrationCondition?.id;
  }

  const additives = isFormulationSettings(settings)
    ? settings.additives || []
    : [];

  const {
    pigments: components,
    clears: clearComponents,
    technicalVarnishes,
  } = useMemo(
    () => {
      const colorantsSortedByName = colorants?.slice()
        .sort((a: Colorant, b: Colorant) => a.name.localeCompare(b.name))
        || [];
      return convertColorantsToComponents(
        recipeOutputMode,
        colorantsSortedByName,
        calibrationConditionId || '',
      );
    }, [recipeOutputMode, colorants, calibrationConditionId],
  );

  const modeNumber = recipeOutputMode as number + ((correctionMode === 'Add') ? 10 : 20);

  useEffect(
    () => {
      // prevent auto-select of components when correction result is selected
      if (!type || type === 'correctionEntry') return;

      const formulationSettings = formula?.formulationSettings;
      if (isFormulationSettings(formulationSettings)) {
        dispatch(setTotalMode(formulationSettings.totalMode));
      }

      const allComponents = [...components, ...technicalVarnishes, ...clearComponents];
      const { clearIds, componentIds } = getDefaultComponentSelection(
        formula,
        colorants,
        allComponents,
        recipeOutputMode,
        correctionMode,
      );
      dispatch(selectClearsAction(clearIds));
      dispatch(selectComponentsAction(componentIds));

      const settingsRestrictions = settings?.colorantRestrictions;
      if (Array.isArray(settingsRestrictions)) {
        settingsRestrictions.forEach(({
          id,
          minConcentrationPercentage,
          maxConcentrationPercentage,
        }) => {
          if (isString(id)) {
            // the id is always the colorant id, if we are in basic material mode
            // we need to translate it into the basic materials id
            const componentId = (recipeOutputMode === RecipeOutputMode.BasicMaterial)
              ? colorants?.find((colorant) => colorant.id === id)
                ?.components.find((comp) => allComponents.some(
                  (formuComp) => formuComp.id === comp.basicMaterial.id,
                ))
                ?.basicMaterial.id
              : id;
            if (componentId) {
              dispatch(setConcentration({
                componentId,
                minConcentrationPercentage,
                maxConcentrationPercentage,
              }));
            }
          }
        });
      }
    },
    [formula?.id, formulaAssortmentId, colorants?.length, modeNumber],
  );

  const selectedClear = clearComponents.find(({ id }) => selectedClearIds.includes(id));

  const handleFold = () => {
    setIsFolded(!isFolded);
  };

  const {
    correct,
    // clearResults,
    // results: correctionResults,
    fetching: correctionRunning,
  } = useCorrection();

  const handleCorrect = () => {
    if (
      !selectedSample
      || !trialMeasurements?.length
      || !formula
      || !assortment
      || !colorants
      || !substrate
      || !standard
      || !selectedClear
      || !viewingConditions
      || viewingConditions.length < 2
      || !calibrationCondition
    ) return;

    // recover formulation parameters from formula settings object
    const formulaThickness = formula.formulaLayers[0].relativeThickness || 1.0;
    const settingsThickMin = settings?.relativeThicknessMin;
    const settingsThickMax = settings?.relativeThicknessMax;
    const relativeThicknessMin = isNumber(settingsThickMin) ? settingsThickMin : formulaThickness;
    const relativeThicknessMax = isNumber(settingsThickMax) ? settingsThickMax : formulaThickness;

    const settingsOpacityMode = settings?.opacityMode;
    const settingsOpacityMin = settings?.opacityMinPercent;
    const settingsOpacityMax = settings?.opacityMaxPercent;
    const opacityMode = isOpacityMode(settingsOpacityMode) ? settingsOpacityMode : OpacityMode.None;
    const opacityMinPercent = isNumber(settingsOpacityMin) ? settingsOpacityMin : 0;
    const opacityMaxPercent = isNumber(settingsOpacityMax) ? settingsOpacityMax : 100;

    const settingsViscosity = settings?.targetViscosity;
    const viscosity = isNumber(settingsViscosity)
      ? settingsViscosity
      : formula.formulaLayers[0].viscosity;

    const { formulationColorants, fixedColorantIds } = getFormulationInputColorants(
      recipeOutputMode,
      colorants,
      selectedComponentIds,
      selectedClear.id,
      concentrationPercentages,
      requiredComponentIds,
    );

    const selectedColorantIds = formulationColorants.map(({ id }) => id);

    // ensure that the original colorants of the formula are transferred to the CFE
    formula.formulaLayers.forEach((layer) => {
      layer.formulaComponents.forEach((component) => {
        const colorantId = component.colorant.id;
        if (!formulationColorants.some(({ id }) => id === colorantId)) {
          const fullColorant = colorants.find(({ id }) => id === colorantId);
          if (fullColorant) formulationColorants.push(fullColorant);
        }
      });
    });

    let { observer, illuminant } = viewingConditions[0];
    let illuminant2 = viewingConditions[1].illuminant;

    if (standard && isColorimetricStandard(standard)) {
      const colorSpecification = getColorimetricStandardColorSpec(standard);
      observer = colorSpecification.observer || observer;
      illuminant = colorSpecification.illuminant || illuminant;
      illuminant2 = colorSpecification.illuminant || illuminant;
    }

    const { quantity, formulaComponents } = formula.formulaLayers[0];
    const canUnit = allRecipeUnits.find(({ id }) => quantity?.unit === id)
      || defaults?.defaultCanUnit
      || defaultGravimetricUnit;
    const { massSum: canSizeDefaultUnit, volumeSum: canVolume } = computeCanSizeFromComponents(
      formulaComponents,
      viscosity || 0,
      formulationColorants,
      calibrationCondition.id,
      totalMode,
      assortment.solvent,
    );
    const canSize = convertRecipeUnit(
      canSizeDefaultUnit,
      defaultGravimetricUnit,
      canUnit,
      canSizeDefaultUnit / canVolume,
    );

    correct({
      assortment,
      calibrationCondition,
      substrate,
      standard,
      colorants: formulationColorants,
      selectedColorantIds,
      fixedColorantIds,
      relativeThicknessMin,
      relativeThicknessMax,
      recipeOutputMode,
      totalMode,
      viscosity: viscosity || 0,
      correctionMode,
      trialSample: selectedSample,
      formula,
      maxAddPercentage,
      allowRemoveColorantsForCorrection: true,
      // feed the selected illuminants into the engine settings in the same way as IFS does it
      // will need to change this in case we also support the EFX engine
      metricType: MetricType.Colorimetric,
      colorimetricSettings: {
        illuminants: [
          { illuminant, weight: 1.0 },
          { illuminant: illuminant2, weight: 1.0 },
          { illuminant: illuminant2, weight: 0.0 },
        ],
        observer,
        deltaE2000Weights: {
          kl: colorimetricConfiguration?.metric.lRatio || 1,
          kc: colorimetricConfiguration?.metric.cRatio || 1,
          kh: colorimetricConfiguration?.metric.hRatio || 1,
        },
      },
      canUnit,
      canSize,
      opacityMode,
      opacityMinPercent,
      opacityMaxPercent,
      clearId: selectedClear.id,
      additives,
    })
      .then((corrected) => dispatch(
        setCorrectionResults(corrected?.map((entry) => ({
          ...entry,
          type: 'correction',
        }))),
      ))
      .catch(() => showToast('Invalid correction results data', 'error'));
  };

  const isLoading = colorantsFetching
    || samplesFetching
    || assortmentFetching
    || substrateFetching
    || standardFetching;

  const commonMeasurementData = trialMeasurements
    ? assembleMeasurementSamplesByConditionSingle(
      standard?.measurements,
      trialMeasurements,
    )
    : [];
  const isTrialCompatibleWithStandard = commonMeasurementData.length > 0;

  const canCorrect = !!selectedSample
    && !isLoading
    && !!trialMeasurements?.length
    && !!formula
    && !!assortment
    && !!colorants
    && !!substrate
    && !!standard
    && !!calibrationCondition
    && isCompatibleWithCondition(standard, calibrationCondition)
    && isCompatibleWithCondition(substrate, calibrationCondition)
    && isTrialCompatibleWithStandard;

  const {
    requestMeasurements: requestBridgeMeasurements,
    isRequestInProgress: isMeasurementInProgress,
    measurement: bridgeAppMeasurement,
    cancelRequest: cancelMeasurementRequest,
  } = useBridgeApp();
  const handleMeasure = () => {
    requestBridgeMeasurements(true, 'correctionMeasurement');
  };
  useEffect(() => {
    if (!bridgeAppMeasurement || !selectedSample) return;

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
          standardId: selectedSample.standardId,
          substrateId: selectedSample.substrateId,
          childAppearanceSamples: [],
          parentAppearanceSampleId: selectedSample.id,
          measurements: [bridgeAppMeasurement],
        });
      dispatch(setWorkingAppearanceSample(measurementAppearanceSample));
    }
  }, [bridgeAppMeasurement]);

  const handleChangeCorrectionSettings = (isAutomatic: boolean) => {
    // automatic mode should only use the components from the recipe
    if (isAutomatic) {
      const allComponents = [...components, ...technicalVarnishes, ...clearComponents];
      const { clearIds, componentIds } = getDefaultComponentSelection(
        formula,
        colorants,
        allComponents,
        recipeOutputMode,
        correctionMode,
      );

      dispatch(selectClearsAction(clearIds));
      dispatch(selectComponentsAction(componentIds));
    }

    dispatch(toggleCorrectionSettings());
  };

  const canMeasure = !isMeasurementInProgress && selectedSample?.formula;

  const enableTechnicalVarnishSelection = formula
    && !formula.formulaLayers.some((layer) => layer.formulaComponents.some((comp) => {
      const colorant = colorants?.find(({ id }) => id === comp.colorant.id);
      return !colorant?.isLeftover && comp.massAmount > 1e-10;
    }));

  return (
    <AnimationContainer
      dataTestId="correction-setup"
      header={t('titles.CorrectionSetup')}
      size="medium"
      isFolded={isFolded}
      onChangeFold={handleFold}
      className={className}
      isLoading={isLoading}
    >
      <div className={classes.root}>
        <div className={classes.content}>
          <Fade in={isFolded} timeout={{ enter: 500, exit: 400 }}>
            <div className={classes.fadeContent}>
              <CollapsedPane
                assortment={assortment}
                calibrationConditionId={calibrationConditionId}
                recipeOutputMode={recipeOutputMode}
                maxAddPercent={maxAddPercentage}
              />
            </div>
          </Fade>

          <Fade in={!isFolded} timeout={{ enter: 1000, exit: 300 }}>
            <div className={classes.fadeContent}>
              <ExpandedPane
                isFetching={colorantsFetching}
                calibrationConditionId={calibrationConditionId}
                assortment={assortment}
                substrate={substrate}
                recipeOutputMode={recipeOutputMode}
                components={components}
                colorants={colorants}
                selectedClear={selectedClear}
                technicalVarnishes={technicalVarnishes}
                totalMode={totalMode}
                concentrationPercentages={concentrationPercentages}
                onChangeConcentrationPercentages={handleConcentrationChange}
                requiredComponentIds={requiredComponentIds}
                onChangeColorantsRequired={handleRequired}
                onChangeCorrectionSettings={handleChangeCorrectionSettings}
                enableTechnicalVarnishSelection={enableTechnicalVarnishSelection}
              />
            </div>
          </Fade>
        </div>

        <div className={classes.buttonContainer}>
          <BridgeAppControlPanel
            isRequestInProgress={isMeasurementInProgress}
            cancelRequest={cancelMeasurementRequest}
          />
          <Button
            data-testid="correct-button"
            data-correctionrunning={correctionRunning}
            color="primary"
            className={clsx(classes.button, classes.buttonMargin)}
            onClick={handleCorrect}
            showSpinner={correctionRunning}
            disabled={!canCorrect || correctionRunning}
          >
            {t('labels.correct')}
          </Button>
          <Button
            data-testid="measure-button"
            variant="primary"
            className={classes.button}
            // eslint-disable-next-line no-console
            onClick={handleMeasure}
            showSpinner={false}
            disabled={!canMeasure}
          >
            {t('labels.measure')}
          </Button>
        </div>
      </div>
    </AnimationContainer>
  );
};

export default CorrectionSetupPane;
