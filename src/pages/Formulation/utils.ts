import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  BasicMaterial,
  BasicMaterialType,
  Colorant,
  ColorantType,
  SubIndustry,
} from '@xrite/cloud-formulation-domain-model';
import {
  ThicknessOption,
  OpacityMode,
  CombinatorialMode,
  FormulationComponent,
  SearchAndCorrectMode,
  ConcentrationPercentages,
} from '../../types/formulation';
import {
  selectAssortment as selectAssortmentAction,
  selectSubstrate as selectSubstrateAction,
  selectClear as selectClearAction,
  selectComponents as selectComponentsAction,
  selectAdditives as selectAdditivesAction,
  selectRecipeOutputMode as selectRecipeOutputModeAction,
  setOpacitySettings as setOpacitySettingsAction,
  setTargetViscosity as setTargetViscosityAction,
  setRelativeThicknessPercent as setRelativeThicknessPercentAction,
  setCombinatorialMode as setCombinatorialModeAction,
  setTotalMode as setTotalModeAction,
  setSearchAndCorrectModes,
  setFormulationSettings,
  selectThicknessRatio,
} from '../../data/reducers/formulation';
import {
  getCalibrationEngineClass,
  getCalibrationParameterScalarValue,
  hasColorantBasicMaterials,
  isColorantAClear,
  isColorantATechnicalVarnish,
  filterTruthy,
} from '../../utils/utils';
import { getStandardId } from '../../data/common';
import { getPreviewRGBForColorant } from '../../utils/colorimetry';
import {
  useAssortments,
  useAssortment,
  useStandard,
  useColorants,
  useSubstrates,
  useSubstrate,
  useAppearanceSample,
  useThicknessRatios,
} from '../../data/api';
import { WidgetType } from '../../widgets/WidgetLayout/types';
import { RecipeOutputMode, TotalMode } from '../../types/recipe';
import { useSelectedAppearanceSample } from '../../utils/utilsSamples';
import { isFormulationSettings } from '../../utils/utilsFormulation';
import { isCompatibleWithCondition } from '../../utils/utilsMeasurement';

export const createComponentFromColorant = (
  colorant: Colorant,
  calibrationConditionId: string,
): FormulationComponent => ({
  ...colorant,
  previewColor: getPreviewRGBForColorant(colorant, calibrationConditionId),
});

const getReadyFormulationComponents = (
  colorants: Colorant[],
  calibrationConditionId: string,
): {
  clears: FormulationComponent[],
  pigments: FormulationComponent[],
  technicalVarnishes: FormulationComponent[],
} => ({
  clears: colorants
    .filter(isColorantAClear)
    .map((colorant) => createComponentFromColorant(colorant, calibrationConditionId)),
  pigments: colorants
    .filter((colorant) => !isColorantAClear(colorant) && !isColorantATechnicalVarnish(colorant))
    .map((colorant) => createComponentFromColorant(colorant, calibrationConditionId)),
  technicalVarnishes: [],
});

const getBasicAndSolventFormulationComponents = (
  colorants: Colorant[],
  calibrationConditionId: string,
): {
  clears: FormulationComponent[],
  pigments: FormulationComponent[],
  technicalVarnishes: FormulationComponent[],
} => ({
  clears: colorants
    .filter(isColorantAClear)
    .map((colorant) => createComponentFromColorant(colorant, calibrationConditionId)),
  pigments: colorants
    .filter((colorant) => !isColorantAClear(colorant) && !isColorantATechnicalVarnish(colorant))
    .map((colorant) => createComponentFromColorant(colorant, calibrationConditionId)),
  technicalVarnishes: colorants
    .filter((colorant) => isColorantATechnicalVarnish(colorant))
    .map((colorant) => createComponentFromColorant(colorant, calibrationConditionId)),
});

const createBasicMaterialComponentFromColorant = (
  colorant: Colorant,
  calibrationConditionId: string,
  acceptedType: BasicMaterialType,
): FormulationComponent | undefined => {
  if (colorant.isLeftover) {
    return createComponentFromColorant(colorant, calibrationConditionId);
  }
  const basicMaterialComp = colorant.components.find(
    (comp) => {
      if (!(comp.basicMaterial instanceof BasicMaterial)) throw new Error('Require full BasicMaterial instances in Colorants');
      return comp.basicMaterial.type === acceptedType;
    },
  );
  if (!basicMaterialComp) return undefined;
  const { basicMaterial } = basicMaterialComp;
  if (!(basicMaterial instanceof BasicMaterial)) throw new Error('Require full BasicMaterial instances in Colorants');
  return {
    id: basicMaterial.id,
    name: basicMaterial.name,
    colorantId: colorant.id,
    isLeftover: colorant.isLeftover,
    type: colorant.type,
    previewColor: getPreviewRGBForColorant(colorant, calibrationConditionId),
    price: basicMaterial.price || colorant.price,
    specificMass: colorant.specificMass,
    maxConcentrationPercentage: colorant.maxConcentrationPercentage,
    minConcentrationPercentage: colorant.minConcentrationPercentage,
  };
};

const getBasicMaterialFormulationComponents = (
  colorants: Colorant[],
  calibrationConditionId: string,
): {
  clears: FormulationComponent[],
  pigments: FormulationComponent[],
  technicalVarnishes: FormulationComponent[],
} => ({
  clears: filterTruthy(colorants
    .filter(isColorantAClear)
    .map((colorant) => createBasicMaterialComponentFromColorant(
      colorant,
      calibrationConditionId,
      BasicMaterialType.Binder,
    ))),
  pigments: filterTruthy(colorants
    .filter((colorant) => !isColorantAClear(colorant) && !isColorantATechnicalVarnish(colorant))
    .map((colorant) => createBasicMaterialComponentFromColorant(
      colorant,
      calibrationConditionId,
      BasicMaterialType.Pigment,
    ))),
  technicalVarnishes: filterTruthy(colorants
    .filter((colorant) => isColorantATechnicalVarnish(colorant))
    .map((colorant) => createBasicMaterialComponentFromColorant(
      colorant,
      calibrationConditionId,
      BasicMaterialType.TechnicalVarnish,
    ))),
});

export const convertColorantsToComponents = (
  outputMode: RecipeOutputMode,
  colorants: Colorant[],
  calibrationConditionId: string,
) => {
  switch (outputMode) {
    case RecipeOutputMode.BasicMaterial:
      return getBasicMaterialFormulationComponents(colorants, calibrationConditionId);
    case RecipeOutputMode.BasicInksAndSolvent:
      return getBasicAndSolventFormulationComponents(colorants, calibrationConditionId);
    default:
      return getReadyFormulationComponents(colorants, calibrationConditionId);
  }
};

const getReadyFormulationInputColorants = (
  colorants: Colorant[],
  selectedComponentIds: string[],
  selectedClearId: string | undefined,
  concentrationRestrictions: ConcentrationPercentages,
  requiredComponentIds: string[],
  includeTechnicalVarnish: boolean,
) => {
  const formulationColorants = colorants
    .filter(({ type }) => includeTechnicalVarnish || type !== ColorantType.TechnicalVarnish)
    .filter(({ id }) => (selectedComponentIds.includes(id) || selectedClearId === id))
    .map((colorant) => {
      const restrictions = concentrationRestrictions[colorant.id];
      if (!restrictions) return colorant;

      const modifiedColorant = new Colorant(colorant);

      modifiedColorant.minConcentrationPercentage = restrictions.minConcentrationPercentage
        ?? colorant.minConcentrationPercentage;
      modifiedColorant.maxConcentrationPercentage = restrictions.maxConcentrationPercentage
        ?? colorant.maxConcentrationPercentage;

      return modifiedColorant;
    });
  const fixedColorantIds = formulationColorants
    .filter(({ id, isLeftover }) => requiredComponentIds.includes(id) || isLeftover)
    .map(({ id }) => id);

  return { formulationColorants, fixedColorantIds };
};

const getBasicMaterialsFormulationInputColorants = (
  colorants: Colorant[],
  selectedComponentIds: string[],
  selectedClearId: string | undefined,
  concentrationRestrictions: ConcentrationPercentages,
  requiredComponentIds: string[],
) => {
  const colorantHasBasicMaterial = (colorant: Colorant, id: string) => {
    return colorant.components.some(
      (component) => (id === component.basicMaterial.id),
    );
  };

  const formulationColorants = colorants
    .filter(
      (colorant) => selectedComponentIds.some((id) => colorantHasBasicMaterial(colorant, id))
        || colorantHasBasicMaterial(colorant, selectedClearId || '')
        || selectedComponentIds.includes(colorant.id),
    )
    .map((colorant) => {
      const restrictedComponent = colorant.components.find(
        (component) => (component.basicMaterial as BasicMaterial).type !== 'Additive' && concentrationRestrictions[component.basicMaterial.id],
      );

      const restrictedComponentId = restrictedComponent
        ? restrictedComponent.basicMaterial.id
        : colorant.id;
      const restrictions = concentrationRestrictions[restrictedComponentId];
      if (!restrictions) return colorant;

      const modifiedColorant = new Colorant(colorant);

      const factor = restrictedComponent
        ? (100 / restrictedComponent.concentrationPercentage)
        : 1.0;
      modifiedColorant.minConcentrationPercentage = restrictions.minConcentrationPercentage
        ? restrictions.minConcentrationPercentage * factor
        : colorant.minConcentrationPercentage;
      modifiedColorant.maxConcentrationPercentage = restrictions.maxConcentrationPercentage
        ? Math.min(100, restrictions.maxConcentrationPercentage * factor)
        : colorant.maxConcentrationPercentage;

      return modifiedColorant;
    });

  const fixedColorantIds = formulationColorants
    .filter((colorant) => colorant.isLeftover || colorant.components.some(
      (component) => requiredComponentIds.includes(component.basicMaterial.id),
    ))
    .map(({ id }) => id);

  return { formulationColorants, fixedColorantIds };
};

export const getFormulationInputColorants = (
  outputMode: RecipeOutputMode,
  colorants: Colorant[],
  selectedComponentIds: string[],
  selectedClearId: string | undefined,
  concentrationRestrictions: ConcentrationPercentages,
  requiredComponentIds: string[],
): {
  formulationColorants: Colorant[],
  fixedColorantIds: string[],
} => {
  switch (outputMode) {
    case RecipeOutputMode.BasicMaterial:
      return getBasicMaterialsFormulationInputColorants(
        colorants,
        selectedComponentIds,
        selectedClearId,
        concentrationRestrictions,
        requiredComponentIds,
      );
    case RecipeOutputMode.BasicInksAndSolvent:
    default:
      return getReadyFormulationInputColorants(
        colorants,
        selectedComponentIds,
        selectedClearId,
        concentrationRestrictions,
        requiredComponentIds,
        outputMode === RecipeOutputMode.BasicInksAndSolvent,
      );
  }
};

export const useFormulationSetup = () => {
  const dispatch = useDispatch();

  // standard
  const standardId = useSelector(getStandardId);
  const { result: standard } = useStandard({ id: standardId });

  // assortment
  const {
    result: assortments,
    fetching: assortmentsFetching,
  } = useAssortments();
  const selectedAssortmentId = useSelector((state) => state.formulation.selectedAssortmentId);
  const setSelectedAssortmentId = (id?: string) => dispatch(selectAssortmentAction(id));
  const {
    result: selectedAssortment,
    fetching: assortmentFetching,
  } = useAssortment(selectedAssortmentId);
  const {
    result: colorantsList,
    fetching: colorantsFetching,
  } = useColorants(selectedAssortmentId);
  const assortmentHasBasicMaterials = !!colorantsList?.some(hasColorantBasicMaterials);

  // calibration condition and engine
  // temporarily using first calibrationCondition, will be selectable in the future
  const calibrationConditionId = selectedAssortment?.calibrationConditions[0]?.id;
  const calibrationCondition = selectedAssortment?.calibrationConditions?.find(
    ({ id }) => id === calibrationConditionId,
  );
  const engineClass = getCalibrationEngineClass(calibrationCondition);
  const isIFS = engineClass === 'IFS';
  const allowBasicMaterials = isIFS && assortmentHasBasicMaterials;
  const assortmentViscosity = (selectedAssortment && calibrationConditionId)
    ? getCalibrationParameterScalarValue(
      selectedAssortment,
      calibrationConditionId,
      'calibrationViscosity',
    ) : 0.0;
  const canUseViscosity = (isIFS && selectedAssortment?.subIndustry === SubIndustry.Flexo);

  // substrates
  const {
    result: substrates,
  } = useSubstrates();
  const selectedSubstrateId = useSelector((state) => state.formulation.selectedSubstrateId);
  const {
    result: selectedSubstrate,
    mutation: [createSubstrate],
    fetching: substrateFetching,
    removal: [deleteSubstrate, deleteSubstrateResult],
    update: [updateSubstrate, updateSubstrateResult],
  } = useSubstrate(selectedSubstrateId);
  const setSelectedSubstrateId = (id?: string) => dispatch(selectSubstrateAction(id));
  // recipe output mode
  const selectedRecipeOutputMode = useSelector((state) => state.formulation.recipeOutputMode);
  const setSelectedRecipeOutputMode = (
    mode: RecipeOutputMode,
  ) => dispatch(selectRecipeOutputModeAction(mode));

  const availableRecipeOutputModes = [
    RecipeOutputMode.ProductionReady,
  ];
  if (canUseViscosity) {
    availableRecipeOutputModes.push(RecipeOutputMode.BasicInksAndSolvent);
  }
  if (allowBasicMaterials) {
    availableRecipeOutputModes.push(RecipeOutputMode.BasicMaterial);
  }
  let usedRecipeOutputMode = selectedRecipeOutputMode;
  if (!availableRecipeOutputModes.includes(selectedRecipeOutputMode)) {
    [usedRecipeOutputMode] = availableRecipeOutputModes;
  }

  // colorants / components / clears
  const colorantsListSorted = colorantsList
    ?.slice()
    .sort((a: Colorant, b: Colorant) => a.name.localeCompare(b.name))
    || [];
  const {
    pigments: components,
    clears: clearComponents,
    technicalVarnishes,
  } = useMemo(
    () => convertColorantsToComponents(
      usedRecipeOutputMode,
      colorantsListSorted,
      calibrationConditionId || '',
    ),
    [usedRecipeOutputMode, colorantsListSorted, calibrationConditionId],
  );
  const selectedComponentIds = useSelector((state) => state.formulation.selectedComponentIds);
  const selectedAdditiveIds = useSelector((state) => state.formulation.selectedAdditiveIds);
  const selectedClearId = useSelector((state) => state.formulation.selectedClearId);
  const setSelectedClearId = (id?: string) => dispatch(selectClearAction(id));
  const setSelectedComponentIds = (ids: string[]) => dispatch(selectComponentsAction(ids));
  const setSelectedAdditiveIds = (ids: string[]) => dispatch(selectAdditivesAction(ids));
  const selectedComponents = components.filter(({ id }) => selectedComponentIds?.includes(id));
  const selectedClear = clearComponents.find(({ id }) => id === selectedClearId);

  useEffect(() => {
    if (!selectedClear && clearComponents.length === 1) {
      setSelectedClearId(clearComponents[0].id);
    }
  }, [selectedClear, clearComponents]);

  // opacity settings
  const {
    selectedOpacityMode,
    opacityMinPercent,
    opacityMaxPercent,
  } = useSelector((state) => ({
    selectedOpacityMode: state.formulation.opacityMode,
    opacityMinPercent: state.formulation.opacityMinPercent,
    opacityMaxPercent: state.formulation.opacityMaxPercent,
  }));
  const setOpacitySettings = (
    mode: OpacityMode,
    minPercent: number,
    maxPercent: number,
  ) => dispatch(setOpacitySettingsAction({
    mode,
    minPercent,
    maxPercent,
  }));

  const availableOpacityModesIFS = [
    OpacityMode.None,
    OpacityMode.OpacityFixed,
    OpacityMode.OpacityMinimum,
    OpacityMode.Transparent,
    OpacityMode.Opaque,
  ];
  const availableOpacityModes = isIFS ? availableOpacityModesIFS : [];

  // various settings
  const [selectedThickness, setSelectedThickness] = useState(ThicknessOption.None);
  const selectedCombinatorialMode = useSelector((state) => state.formulation.combinatorialMode);
  const selectedSearchAndCorrectModes = useSelector((s) => s.formulation.searchAndCorrectModes);
  const selectedThicknessRatioId = useSelector((s) => s.formulation.selectedThicknessRatioId);
  const viscosity = useSelector((state) => state.formulation.targetViscosity);
  const [
    minThicknessPercent,
    maxThicknessPercent,
  ] = useSelector((state) => [
    state.formulation.relativeMinThicknessPercent,
    state.formulation.relativeMaxThicknessPercent,
  ]);
  const setViscosity = (visc: number) => dispatch(setTargetViscosityAction(visc));
  const setThicknessPercent = ({ type, value }: {value: number, type: 'min' | 'max' | 'minAndMax' | 'default'}) => dispatch(
    setRelativeThicknessPercentAction({
      type,
      value,
    }),
  );
  // color application device
  const { result: thicknessRatios } = useThicknessRatios(selectedAssortmentId);
  const thicknessRatioOptions = useMemo(() => {
    if (!thicknessRatios || !thicknessRatios.length) return undefined;
    return [
      ...thicknessRatios,
      {
        deviceId: 'custom',
        deviceName: 'Custom',
        assortmentId: '',
        ratio: undefined,
      },
    ];
  }, [thicknessRatios]);
  const selectedThicknessRatio = thicknessRatioOptions
    ?.find(({ deviceId }) => deviceId === selectedThicknessRatioId);

  useEffect(() => {
    if (!selectedThicknessRatio) {
      dispatch(selectThicknessRatio({ deviceId: 'custom' }));
    }
  }, [thicknessRatioOptions, selectedThicknessRatio]);

  const setCombinatorialMode = (
    mode: CombinatorialMode,
  ) => dispatch(setCombinatorialModeAction(mode));
  const setSearchAndCorrect = (
    mode: SearchAndCorrectMode,
  ) => dispatch(setSearchAndCorrectModes(mode));
  const setThicknessRatio = (
    deviceId: string,
    ratio?: number,
  ) => dispatch(selectThicknessRatio({ deviceId, ratio }));
  const totalMode = useSelector((state) => state.formulation.totalMode);
  const setTotalMode = (mode: TotalMode) => dispatch(setTotalModeAction(mode));

  const usedViscosity = (selectedRecipeOutputMode === RecipeOutputMode.ProductionReady)
    ? (assortmentViscosity || 0)
    : ((viscosity || assortmentViscosity) ?? 0);

  const applicableAssortments = useMemo(() => assortments?.filter(
    (assortment) => {
      if (standard && assortment.calibrationConditions.length > 0) {
        return isCompatibleWithCondition(standard, assortment.calibrationConditions[0]);
      }
      return false;
    },
  ), [standard]);
  const applicableSubstrates = useMemo(() => substrates?.filter(
    (substrate) => {
      if (calibrationCondition) {
        return isCompatibleWithCondition(
          substrate,
          calibrationCondition,
        );
      }
      return false;
    },
  ), [calibrationCondition, substrates]);

  return {
    standardId,
    standard,
    assortments: applicableAssortments,
    selectedAssortment,
    selectedAssortmentId,
    setSelectedAssortmentId,
    calibrationConditionId,
    calibrationCondition,
    substrates: applicableSubstrates,
    selectedSubstrate,
    selectedSubstrateId,
    setSelectedSubstrateId,
    createSubstrate,
    colorants: colorantsListSorted,
    components,
    selectedComponents,
    selectedComponentIds,
    selectedAdditiveIds,
    setSelectedComponentIds,
    setSelectedAdditiveIds,
    clearComponents,
    technicalVarnishes,
    selectedClear,
    selectedClearId,
    setSelectedClearId,
    thicknessRatioOptions,
    selectedThicknessRatio,
    setThicknessRatio,
    availableRecipeOutputModes,
    selectedRecipeOutputMode: usedRecipeOutputMode,
    setSelectedRecipeOutputMode,
    availableOpacityModes,
    selectedOpacityMode,
    opacityMinPercent,
    opacityMaxPercent,
    setOpacitySettings,
    minThicknessPercent,
    maxThicknessPercent,
    setThicknessPercent,
    canUseViscosity,
    viscosity: usedViscosity,
    setViscosity,
    selectedCombinatorialMode,
    setCombinatorialMode,
    selectedThickness,
    setSelectedThickness,
    selectedSearchAndCorrectModes,
    setSearchAndCorrect,
    deleteSubstrate,
    deleteSubstrateResult,
    updateSubstrate,
    updateSubstrateResult,
    totalMode,
    setTotalMode,
    isFetching:
      assortmentsFetching
      || colorantsFetching
      || substrateFetching
      || assortmentFetching,
  };
};

export const useWidgetTypeLabels = (): Partial<Record<WidgetType, string>> => {
  const { t } = useTranslation();
  return {
    [WidgetType.ColorSwatch]: t('labels.colorSwatch'),
    [WidgetType.ColorData]: t('labels.colorData'),
    [WidgetType.ColorPlot]: t('labels.colorPlot'),
    [WidgetType.SpectralGraph]: t('labels.spectralGraph'),
    [WidgetType.RecipeDisplay]: t('labels.recipeDisplay'),
    [WidgetType.CorrectionResult]: t('labels.correctionResults'),
    [WidgetType.FormulationResult]: t('labels.formulationResults'),
  };
};

export const useAutoSelectFormulationSettings = () => {
  const dispatch = useDispatch();

  const standardId = useSelector(getStandardId);

  const {
    result: savedAppearanceSamples,
  } = useAppearanceSample({ query: { parentId: standardId } });
  const { selectedSample, type } = useSelectedAppearanceSample();
  const sampleIsFormula = !selectedSample?.parentAppearanceSampleId || type === 'formulaEntry';

  const {
    result: colorants, fetching,
  } = useColorants(selectedSample?.formula?.assortmentId);

  // effect for handling auto selection on new recipe/formula selection
  useEffect(() => {
    const selectedSampleIsSaved = savedAppearanceSamples?.find(
      ({ id }) => id === selectedSample?.id,
    );

    if (
      !sampleIsFormula
      || !selectedSampleIsSaved
      || !isFormulationSettings(selectedSample?.formula?.formulationSettings)
      || !selectedSample?.formula?.assortmentId
      || !selectedSample?.substrateId
      || !colorants
      || fetching
    ) return;

    dispatch(setFormulationSettings({
      formulationSettings: selectedSample.formula.formulationSettings,
      assortmentId: selectedSample.formula.assortmentId,
      substrateId: selectedSample.substrateId,
      colorants,
    }));
  }, [selectedSample?.id, fetching]);

  return { isAutoSelecting: (fetching && sampleIsFormula) };
};
