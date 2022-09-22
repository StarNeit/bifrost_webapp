import {
  AppearanceSample,
  Formula,
  FormulaComponent,
  FormulaLayer,
  Measurement,
  Quantity,
  SubIndustry,
  BasicMaterialType,
} from '@xrite/cloud-formulation-domain-model';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  makeStyles,
} from '@material-ui/core/styles';
import { v4 as uuid } from 'uuid';
import cloneDeep from 'lodash/cloneDeep';
import { RGB } from '@xrite/colorimetry-js';

import { useDispatch, useSelector } from 'react-redux';
import { Component } from '../types/component';
import Actions from '../pages/common/Actions';
import { WidgetProps } from './WidgetLayout/types';
import WidgetPanel from './WidgetLayout/WidgetPanel';
import RecipeDisplay from './RecipeDisplay';
import {
  useAssortment,
  useColorants,
  useSubstrate,
} from '../data/api';
import Select from '../components/Select';
import { Body } from '../components/Typography';
import LoadingContainer from '../components/LoadingContainer';
import {
  getCalibrationEngineClass,
  getCalibrationParameterScalarValue,
  getCurrencySymbol,
  hasColorantBasicMaterials,
  isRecipeOutputMode,
  useDefaultPrecision,
} from '../utils/utils';
import {
  allRecipeUnits,
  defaultGravimetricUnit,
  gravimetricRecipeUnits,
  getOutputRecipe,
  convertRecipeUnit,
  scaledFormula,
  SOLVENT_COMPONENT_ID,
  getQuantityAmount,
} from '../utils/utilsRecipe';
import {
  removeRelatedWorkingAppearanceSamples,
  setWorkingAppearanceSample,
  updateFormulaAmountOfWorkingAppearanceSample as updateFormula,
} from '../data/reducers/common';
import { getRecipeOutputModeLabel } from '../pages/common/utilsFormulation';
import {
  OutputRecipe,
  OutputRecipeComponent,
  OutputRecipeComponentWithColor,
  OutputRecipeWithColors,
  RecipeOutputMode,
  RecipeUnit,
  TotalMode,
} from '../types/recipe';
import { useSelectedAppearanceSample } from '../utils/utilsSamples';
import { getPreviewRGBForColorant } from '../utils/colorimetry';
import RefreshIcon from '../components/RefreshIcon';
import { usePrediction } from '../data/cfe';
import { isFormulationSettings } from '../utils/utilsFormulation';

const useStyles = makeStyles((theme) => ({
  noDataMessage: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: theme.spacing(2),
    padding: theme.spacing(1, 0),
    marginLeft: theme.spacing(4),
  },
}));

const RecipeDisplayWidget: Component<WidgetProps> = ({
  dataTestId,
  widgetSelect,
  onChange,
  tableSettings,
}) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { round } = useDefaultPrecision();

  const [recipeUnit, updateRecipeUnit] = useState<RecipeUnit>(defaultGravimetricUnit);
  const [editing, setEditing] = useState(false);

  const { predict } = usePrediction();

  const {
    selectedSample,
    formulaSample: selectedFormulaSample,
    originalFormulaSample,
    fetching: fetchingSamples,
    type,
  } = useSelectedAppearanceSample();
  const selectedSampleIsTrial = Boolean(
    selectedSample?.parentAppearanceSampleId
    && selectedSample.measurements.length,
  );

  useEffect(() => setEditing(false), [selectedSample?.id]);

  const workingSamples = useSelector((state) => state.common.workingAppearanceSamples);

  const workingSelectedSample = workingSamples.find(({ id }) => (id === selectedSample?.id));

  // parent
  const workingParentSample = workingSamples.find(
    ({ id }) => (id === selectedSample?.parentAppearanceSampleId),
  );

  // trial/child
  const workingChildSample = workingSamples.find(({ parentAppearanceSampleId }) => (
    parentAppearanceSampleId === selectedSample?.id
  ));
  const workingChildIsTrial = Boolean(workingChildSample?.parentAppearanceSampleId
    && workingChildSample.measurements.length);

  const formulaSample = workingChildSample
    ?? workingSelectedSample
    ?? selectedSample;
  const formula = workingChildSample?.formula
    ?? workingSelectedSample?.formula
    ?? selectedSample?.formula
    ?? workingParentSample?.formula
    ?? selectedFormulaSample?.formula;

  const formulationSettings = isFormulationSettings(formula?.formulationSettings)
    ? formula?.formulationSettings
    : undefined;

  const totalMode = formulationSettings?.totalMode ?? 'Total';

  const hasAdditives = !!formulationSettings?.additives?.length;
  const outputModeFromFormula = formulationSettings?.recipeOutputMode;

  const initialOutputMode = isRecipeOutputMode(outputModeFromFormula)
    ? outputModeFromFormula
    : RecipeOutputMode.ProductionReady;

  const [recipeOutputMode, setRecipeOutputMode] = useState<RecipeOutputMode>(
    initialOutputMode,
  );
  const assortmentId = formula?.assortmentId;

  const {
    result: assortment, fetching: assortmentFetching,
  } = useAssortment(assortmentId);
  const {
    result: colorants, fetching: colorantsFetching,
  } = useColorants(assortmentId);
  const {
    result: substrate,
  } = useSubstrate(selectedSample?.substrateId);
  const dispatch = useDispatch();

  const assortmentHasBasicMaterials = !!colorants?.some(hasColorantBasicMaterials);
  // temporarily using first calibrationCondition, will be selectable in the future
  const calibrationCondition = assortment?.calibrationConditions[0];
  const calibrationConditionId = calibrationCondition?.id;
  const engineClass = getCalibrationEngineClass(calibrationCondition);
  const isIFS = engineClass === 'IFS';
  const allowBasicMaterials = isIFS && assortmentHasBasicMaterials;
  const assortmentViscosity = (assortment && calibrationConditionId)
    ? getCalibrationParameterScalarValue(
      assortment,
      calibrationConditionId,
      'calibrationViscosity',
    ) : 0.0;
  const canUseViscosity = (isIFS && assortment?.subIndustry === SubIndustry.Flexo);

  const editingPossible = substrate
    && calibrationCondition
    && assortment
    && colorants;
  const toggleEdit = editingPossible
    ? () => { setEditing(!editing); }
    : undefined;

  const recipeOutputModes = [
    RecipeOutputMode.ProductionReady,
  ];
  if (canUseViscosity) {
    recipeOutputModes.push(RecipeOutputMode.BasicInksAndSolvent);
  }
  if (allowBasicMaterials) {
    recipeOutputModes.push(RecipeOutputMode.BasicMaterial);
  }

  const availableRecipeUnits = (recipeOutputMode === RecipeOutputMode.BasicMaterial)
    ? gravimetricRecipeUnits
    : allRecipeUnits;

  const recipeViscosity = (recipeOutputMode !== RecipeOutputMode.ProductionReady)
    ? formula?.formulaLayers[0].viscosity
    : assortmentViscosity;

  const isFetching = fetchingSamples || assortmentFetching || colorantsFetching;

  const sumAmounts = formula?.formulaLayers?.reduce(
    (sum, layer) => sum + layer.formulaComponents.reduce(
      (sumLayer, comp) => sumLayer + comp.massAmount,
      0.0,
    ),
    0.0,
  );

  const correctionModeFromState = useSelector((state) => state.correction.correctionMode);
  const correctionMode = formulationSettings
    ? (formulationSettings.correctionMode || correctionModeFromState)
    : correctionModeFromState;

  const getCanUnitForFormula = (form?: Formula): RecipeUnit => (form?.formulaLayers[0]?.quantity
    ? allRecipeUnits.find(({ id }) => formula?.formulaLayers[0]?.quantity?.unit === id)
    || defaultGravimetricUnit
    : defaultGravimetricUnit);
  const canUnit = getCanUnitForFormula(formula);

  const additivesSum = formulationSettings?.additives?.reduce(
    (sum, { concentrationPercentage }) => sum + concentrationPercentage,
    0,
  );

  const { data } = useMemo(() => {
    const recipeData = assortment && formula && colorants && calibrationConditionId
      ? getOutputRecipe({
        solvent: assortment.solvent,
        formula,
        originalFormula: originalFormulaSample?.formula,
        colorants,
        recipeOutputMode: recipeOutputMode || RecipeOutputMode.ProductionReady,
        calibrationConditionId,
        assortmentViscosity: assortmentViscosity || 0,
        canUnit,
        recipeUnit,
        totalMode,
      })
      : {
        mode: recipeOutputMode || RecipeOutputMode.ProductionReady,
        totalMode,
        canSize: 1,
        price: 0,
        layers: [],
        canUnit,
        recipeUnit,
      } as OutputRecipe;

    return { data: recipeData };
  }, [
    selectedSample?.id,
    formulaSample?.id,
    workingSelectedSample?.id,
    workingChildSample?.id,
    workingParentSample?.id,
    formula?.id,
    sumAmounts || 0,
    assortment?.id,
    colorants?.length,
    recipeUnit.id,
    canUnit.id,
    totalMode,
    recipeOutputMode,
    additivesSum,
  ]);

  const dataWithColors: OutputRecipeWithColors = useMemo(() => {
    const getComponentPreviewColor = (component: OutputRecipeComponent): RGB => {
      if (
        component.basicMaterialType === 'Additive'
        || component.basicMaterialType === 'Solvent'
        || component.sourceColorants.length !== 1
      ) {
        return [255, 255, 255];
      }
      const { colorantId } = component.sourceColorants[0];
      const colorant = colorants?.find(({ id }) => id === colorantId);
      if (!colorant) return [255, 255, 255];
      return getPreviewRGBForColorant(colorant, calibrationConditionId || '');
    };

    return {
      ...data,
      layers: data.layers.map((layer) => ({
        ...layer,
        components: layer.components.map((component): OutputRecipeComponentWithColor => {
          return {
            ...component,
            previewColor: getComponentPreviewColor(component),
            recipeOutputMode,
            isAmountEditable: editing,
            allowEditingAdditives: hasAdditives,
            recipeUnit,
          };
        }),
      })),
    };
  }, [data, editing, hasAdditives, recipeOutputMode]);

  // auto select recipe unit and output mode on selection of new formula
  useEffect(() => {
    if (formula
      && recipeOutputModes.includes(initialOutputMode)) {
      setRecipeOutputMode(initialOutputMode);
    } else if (!recipeOutputModes.includes(initialOutputMode)) {
      setRecipeOutputMode(recipeOutputModes[0]);
    }
    updateRecipeUnit(canUnit);
  }, [
    selectedSample?.id,
    initialOutputMode,
    formula?.formulaLayers.length || 0,
    assortment?.id,
    colorants?.length,
  ]);

  const getPrediction = async (newFormula: Formula) => {
    if (!assortment
      || !colorants
      || !formulaSample
      || !data
      || !calibrationCondition
      || !substrate
    ) return undefined;

    return predict({
      assortment,
      colorants,
      calibrationCondition,
      substrate,
      formula: newFormula,
    });
  };

  const createEditedFormula = (
    originalFormula: Formula,
    currentWorkingFormula: Formula,
    colorantId: string | undefined,
    newColorantAmount: number | undefined,
    assignNewIds: boolean,
    newFormulationSettings?: Record<string, unknown>,
  ) => {
    const id = assignNewIds ? uuid() : currentWorkingFormula.id;
    const currentPredictionMeasurements = (currentWorkingFormula?.predictionMeasurements
      ?? originalFormula.predictionMeasurements
      ?? []);
    const predictionMeasurements = assignNewIds
      ? currentPredictionMeasurements
        .map((measurement) => Measurement.parse({ ...measurement, id: uuid() }))
      : currentPredictionMeasurements;
    return new Formula({
      id,
      predictionMeasurements,
      assortmentId: currentWorkingFormula?.assortmentId ?? originalFormula.assortmentId,
      formulaLayers: cloneDeep(currentWorkingFormula?.formulaLayers
        ?? originalFormula.formulaLayers)
        .map((formulaLayer) => {
          const formulaComponents = formulaLayer.formulaComponents.map(
            (formulaComponent) => {
              if (
                !colorantId || !newColorantAmount || formulaComponent.colorant.id !== colorantId
              ) return formulaComponent;
              return FormulaComponent.parse({
                ...formulaComponent,
                massAmount: newColorantAmount,
              });
            },
          );

          if (!colorants) return formulaLayer;

          const amount = getQuantityAmount(formulaComponents, canUnit, colorants);
          return FormulaLayer.parse({
            ...formulaLayer,
            quantity: {
              amount,
              unit: canUnit.id,
            },
            formulaComponents,
          });
        }),
      formulationSettings: newFormulationSettings
        || cloneDeep(
          currentWorkingFormula?.formulationSettings ?? originalFormula.formulationSettings,
        ),
    });
  };

  // this stores exact copy of the original entry with
  // scaled values (can size increase/total mode changed)
  const storeScaledFormulaSample = (newFormula: Formula) => {
    if (!colorants) return;
    // update the quantity
    const quantity = newFormula.formulaLayers[0]?.quantity;
    if (quantity) {
      quantity.amount = getQuantityAmount(
        newFormula.formulaLayers[0].formulaComponents,
        getCanUnitForFormula(newFormula),
        colorants,
      );
    }

    const isSampleWithoutFormula = !formulaSample?.formula;

    let targetedSample = formulaSample;

    if (isSampleWithoutFormula) {
      targetedSample = workingSelectedSample ?? selectedSample; // pick the parent/current sample
      if (!targetedSample?.formula) {
        targetedSample = selectedFormulaSample; // pick the parent/grandparent that has a formula
      }
    }

    if (!targetedSample) return;

    const newAppearanceSample = new AppearanceSample({
      ...targetedSample,
      formula: newFormula,
    });

    dispatch(setWorkingAppearanceSample(newAppearanceSample));
  };

  const storeChildSample = (newFormula: Formula) => {
    // the newly created child will either point to the modified parent sample or original sample
    const originalSample = workingSelectedSample ?? selectedSample;

    if (!originalSample) return;

    const newAppearanceSample = new AppearanceSample({
      ...originalSample,
      // only if it's trial it modified itself, in every different case a child is created
      id: selectedSampleIsTrial ? originalSample.id : uuid(),
      parentAppearanceSampleId: selectedSampleIsTrial
        ? originalSample.parentAppearanceSampleId // if it's trial, persist the parent id
        : originalSample.id, // if it's a newly created child point to the parent
      formula: {
        ...newFormula,
        id: uuid(),
      },
    });

    dispatch(setWorkingAppearanceSample(newAppearanceSample));
  };

  // trial is without formula
  const isTrialWithoutFormula = selectedSampleIsTrial && !formulaSample?.formula;
  const createFormulaToModify = () => (isTrialWithoutFormula
    ? Formula.parse({
      ...formula,
      id: uuid(),
      predictionMeasurements: selectedFormulaSample?.formula?.predictionMeasurements.map(
        (measurement) => Measurement.parse({ ...measurement, id: uuid() }),
      ),
    }) // formula is the parent formula but with it's own unique id
    : formula); // formula is the already existing original/modified formula

  const updateCanSize = (newCanSize: number) => {
    if (newCanSize === data.canSize) return;
    const formulaToModify = createFormulaToModify();
    if (!formulaToModify) return;
    const safeNewCanSize = Math.max(newCanSize || 1, 1);
    const factor = safeNewCanSize / data.canSize;
    const updatedFormula = scaledFormula(
      formulaToModify,
      factor,
      new Quantity({
        amount: safeNewCanSize || 1,
        unit: canUnit.id,
      }),
      totalMode,
    );
    storeScaledFormulaSample(updatedFormula);
  };

  const updateCanUnit = (newCanUnit: RecipeUnit) => {
    if (newCanUnit.id === canUnit.id) return;
    const formulaToModify = createFormulaToModify();
    if (!formulaToModify) return;
    const updatedFormula = new Formula({
      ...formulaToModify,
      formulaLayers: formulaToModify.formulaLayers.map((layer) => new FormulaLayer({
        ...layer,
        quantity: new Quantity({
          amount: 1, // will get updated in storeScaledFormulaSample
          unit: newCanUnit.id,
        }),
      })),
    });
    storeScaledFormulaSample(updatedFormula);
  };

  const updateTotalMode = (newTotalMode: TotalMode) => {
    if (newTotalMode === totalMode) return;
    const formulaToModify = createFormulaToModify();
    if (!formulaToModify) return;
    const firstLayer = data.layers[0];
    if (!firstLayer) return;
    const solventComponent = firstLayer.components.find(
      ({ id }) => id === SOLVENT_COMPONENT_ID,
    );
    const solventPercentage = solventComponent?.percentage || 0;

    const factor = (newTotalMode === 'Total')
      ? 1.0 / (1.0 + solventPercentage / 100.0)
      : 1.0 / (1.0 - solventPercentage / 100.0);

    const updatedFormula = scaledFormula(
      formulaToModify,
      factor,
      new Quantity({
        amount: 1, // will get updated in storeScaledFormulaSample
        unit: canUnit.id,
      }),
      newTotalMode,
    );

    storeScaledFormulaSample(updatedFormula);
  };

  const pendingPredictionFormula = useRef<Formula>();
  /**
   * Will discard prediction results if a newer prediction has been started.
   * Only the most recent prediction is saved.
   */
  const predictAndSave = async (
    newFormula: Formula,
    save: (updatedFormula: Formula) => void,
  ) => {
    pendingPredictionFormula.current = newFormula;
    const predictionMeasurements = await getPrediction(newFormula);

    if (pendingPredictionFormula.current === newFormula) {
      const formulaWithPrediction = new Formula({
        ...newFormula,
        predictionMeasurements: predictionMeasurements ?? newFormula.predictionMeasurements,
      });
      save(formulaWithPrediction);
      pendingPredictionFormula.current = undefined;
    }
  };

  // the amount changes doesn't scale the original formula, that means
  // it creates a new child entry under the original sample
  // however, if it's a saved trial it updated itself
  const handleAmountChange = async (
    componentId: string,
    layerIndex: number,
    newAmountRecipeUnit: number,
  ) => {
    const originalFormula = type === 'trialEntry' && !selectedSample?.formula
      ? selectedFormulaSample?.formula // if it's a trial and it doesn't contain it's own formula
      : selectedSample?.formula; // own formula
    const modifiedChildFormula = workingChildSample?.formula;
    const modifiedParentFormula = workingSelectedSample?.formula;
    const assignNewIds = !(modifiedChildFormula || (modifiedParentFormula && !workingChildIsTrial));

    // take formula from child/trial or take it from the modified parent or from the original parent
    const selectedFormula = modifiedChildFormula ?? modifiedParentFormula ?? originalFormula;

    const layer = data.layers?.[layerIndex];

    if (
      !selectedFormula
      || !assortment
      || !colorants
      || !calibrationConditionId
      || !calibrationCondition
      || !formulaSample
      || !substrate
      || !originalFormula
      || !layer
    ) return;

    const component = layer.components.find(({ id }) => componentId === id);
    if (!component) return;

    if (Math.abs(component.amount - newAmountRecipeUnit) < 1e-4) return; // no edit at all?

    const newComponentAmount = convertRecipeUnit(
      newAmountRecipeUnit,
      recipeUnit,
      defaultGravimetricUnit,
      component.specificMass,
    );

    let newFormula: Formula;
    // edit of additive?
    const editedAdditive = formulationSettings?.additives?.find(({ id }) => id === componentId);
    if (component.basicMaterialType === BasicMaterialType.Additive && editedAdditive) {
      // for additives we need to adjust the percentage wrt basic ink in the settings...
      // they are not part of the regular formula object (as this is PR-only)
      const newConcentration = (newComponentAmount / layer.totalMassAmountBasicInk) * 100.0;
      const newFormulationSettings = {
        ...formulationSettings,
        additives: formulationSettings?.additives?.map((additive) => ({
          ...additive,
          concentrationPercentage: (additive.id === componentId)
            ? newConcentration
            : additive.concentrationPercentage,
        })),
      };
      newFormula = createEditedFormula(
        originalFormula,
        selectedFormula,
        undefined,
        undefined,
        assignNewIds,
        newFormulationSettings,
      );
    } else if (component.sourceColorants.length === 1) {
      // edit of entry with exactly one source colorant
      const { massFraction, colorantId } = component.sourceColorants[0];

      const newColorantAmount = newComponentAmount / massFraction;

      newFormula = createEditedFormula(
        originalFormula,
        selectedFormula,
        colorantId,
        newColorantAmount,
        assignNewIds,
      );
    } else {
      // unsupported edit
      return;
    }

    // child or trial exist in the store
    if (workingChildSample) {
      dispatch(updateFormula({
        parentSampleId: workingChildSample.parentAppearanceSampleId,
        formula: newFormula,
      }));
    } else {
      // if it's not entered in the store create a new working entry
      storeChildSample(newFormula);
    }

    predictAndSave(
      newFormula,
      (formulaWithPrediction: Formula) => {
        // child or trial exist in the store
        if (workingChildSample) {
          dispatch(updateFormula({
            parentSampleId: workingChildSample.parentAppearanceSampleId,
            formula: formulaWithPrediction,
          }));
        } else {
          // if it's not entered in the store create a new working entry
          storeChildSample(newFormula);
        }
      },
    );
  };

  const handleReset = () => {
    if (selectedSample) {
      dispatch(removeRelatedWorkingAppearanceSamples({
        sampleId: selectedSample.id,
        parentSampleId: selectedSample.parentAppearanceSampleId,
      }));
    }
  };

  return (
    <WidgetPanel
      dataTestId={dataTestId}
      headerLeft={(
        <>
          {widgetSelect}
          {assortment && (recipeOutputModes.length > 1) && (
            <div className={classes.row}>
              <Body>{`${t('labels.recipeOutput')}:`}</Body>
              <Select
                id="display-recipe-output-mode-select"
                instanceId="display-recipe-output-mode-select"
                data={recipeOutputModes}
                value={recipeOutputMode}
                isMulti={false}
                onChange={setRecipeOutputMode}
                disabled={isFetching}
                labelProp={
                  (mode: RecipeOutputMode) => t(getRecipeOutputModeLabel(
                    mode, assortment.industry,
                  ))
                }
              />
            </div>
          )}
        </>
      )}
      headerRight={isFetching
        ? (<RefreshIcon fetching />)
        : (
          <Actions
            onClickEdit={toggleEdit}
            onClickReset={handleReset}
            resetDisabled={
              !workingSelectedSample
              && !workingChildSample
              && !workingParentSample
            }
          />
        )}
    >
      {(data.layers.length && !isFetching) ? (
        <RecipeDisplay
          data={dataWithColors}
          dataTestId={dataTestId}
          canSize={data.canSize}
          updateCanSize={updateCanSize}
          canUnit={canUnit}
          updateCanUnit={updateCanUnit}
          recipeUnit={recipeUnit}
          updateRecipeUnit={updateRecipeUnit}
          totalMode={totalMode}
          updateTotalMode={updateTotalMode}
          recipeCost={data.price ? `${round(data.price)} ${getCurrencySymbol(data.currencyCode)}` : undefined}
          viscosity={canUseViscosity ? recipeViscosity : undefined}
          assortment={assortment}
          substrateName={substrate?.name}
          handleAmountChange={handleAmountChange}
          showTotalMode={(recipeOutputMode === RecipeOutputMode.BasicInksAndSolvent
            || recipeOutputMode === RecipeOutputMode.BasicMaterial) && canUseViscosity}
          availableRecipeUnits={availableRecipeUnits}
          relativeThickness={formula?.formulaLayers[0]?.relativeThickness}
          disableCanResize={!!originalFormulaSample && correctionMode === 'Add'}
          onChange={onChange}
          tableSettings={tableSettings}
          correctionMode={correctionMode}
          isCorrection={Boolean(originalFormulaSample)}
          originalAppearanceSample={originalFormulaSample}
        />
      ) : (
        <LoadingContainer fetching={isFetching}>
          <Body className={classes.noDataMessage}>{t('messages.noRecipeSelected')}</Body>
        </LoadingContainer>
      )}
    </WidgetPanel>
  );
};

export default RecipeDisplayWidget;
