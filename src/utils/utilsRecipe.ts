import {
  BasicMaterial,
  BasicMaterialType,
  Colorant,
  ColorantType,
  Formula,
  FormulaComponent,
  FormulaLayer,
  Quantity,
  Solvent,
} from '@xrite/cloud-formulation-domain-model';
import keyBy from 'lodash/keyBy';

import { isFormulationSettings } from './utilsFormulation';
import { AdditiveWithConcentration } from '../types/cfe';
import {
  RecipeUnit,
  OutputRecipeLayerColorant,
  OutputComponentData,
  OutputComponentFractions,
  OutputRecipe,
  OutputRecipeComponent,
  OutputRecipeLayer,
  RecipeOutputMode,
  TotalMode,
} from '../types/recipe';
import { getCalibrationParameterValue, isColorantAClear, isColorantATechnicalVarnish } from './utils';

export const SOLVENT_COMPONENT_ID = 'the-solvent-id';

export type ComponentInLayer = {
  componentId: string,
  massAmount: number,
  massAmountOriginal: number,
}

export type ComponentsInLayer = ComponentInLayer[];

export const defaultGravimetricUnit: RecipeUnit = {
  id: 'g',
  name: 'g',
  isVolumetric: false,
  factorToDefaultUnit: 1,
};

export const defaultVolumetricUnit: RecipeUnit = {
  id: 'ml',
  name: 'ml',
  isVolumetric: true,
  factorToDefaultUnit: 1,
};

export const gravimetricRecipeUnits: RecipeUnit[] = [
  defaultGravimetricUnit,
  {
    id: 'kg',
    name: 'kg',
    isVolumetric: false,
    factorToDefaultUnit: 1000.0,
  },
  {
    id: 'lb',
    name: 'lb',
    isVolumetric: false,
    factorToDefaultUnit: 0.45359237 * 1000.0,
  },
  {
    id: 'oz',
    name: 'oz',
    isVolumetric: false,
    factorToDefaultUnit: 28.349523125,
  },
];

export const volumetricRecipeUnits: RecipeUnit[] = [
  defaultVolumetricUnit,
  {
    id: 'l',
    name: 'l',
    isVolumetric: true,
    factorToDefaultUnit: 1000.0,
  },
  {
    id: 'floz',
    name: 'fl. oz.',
    isVolumetric: true,
    factorToDefaultUnit: 29.5735295625,
  },
  {
    id: 'gallon',
    name: 'liq. gal.',
    isVolumetric: true,
    factorToDefaultUnit: 3785.411784,
  },
];

export const allRecipeUnits: RecipeUnit[] = [
  ...gravimetricRecipeUnits,
  ...volumetricRecipeUnits,
];

export const convertRecipeUnit = (
  input: number,
  sourceUnit: RecipeUnit,
  targetUnit: RecipeUnit,
  specificMass: number,
) => {
  if (sourceUnit.isVolumetric === targetUnit.isVolumetric) {
    return input * (sourceUnit.factorToDefaultUnit / targetUnit.factorToDefaultUnit);
  }
  if (sourceUnit.isVolumetric) {
    // volume to mass
    return input * specificMass * (sourceUnit.factorToDefaultUnit / targetUnit.factorToDefaultUnit);
  }
  // mass to volume
  return input * (sourceUnit.factorToDefaultUnit / targetUnit.factorToDefaultUnit / specificMass);
};

export const solventFractionFromViscosity = (
  [a, b, c]: number[],
  viscosity: number,
): number => {
  if (viscosity > c) { // unrestricted to the top -> negative ratio would be possible
    const relativeSolventAdd = (-1.0 / b) * Math.log((viscosity - c) / a);
    return relativeSolventAdd / (relativeSolventAdd + 1.0);
  }
  return 1.0;
};

export const getColorantSolventFraction = (
  colorant: Colorant | undefined,
  calibrationConditionId: string,
  assortmentViscosity: number,
): number => {
  if (!colorant) return 0;
  const viscoParams = getCalibrationParameterValue(colorant, calibrationConditionId, 'viscosityParameters');
  if (!viscoParams || viscoParams.length !== 3 || viscoParams[0] === 0) return 0;
  return solventFractionFromViscosity(viscoParams, assortmentViscosity);
};

const createBasicMaterialComponent = (
  colorant: Colorant,
  basicMaterial: BasicMaterial,
): OutputComponentData => ({
  ...colorant,
  id: basicMaterial.id,
  name: basicMaterial.name,
  basicMaterialType: basicMaterial.type,
  price: basicMaterial.price,
  specificMass: 0,
});

type OutputComponentInLayerData = {
  componentId: string,
  sourceColorants: OutputComponentFractions[],
}

type OutputLayerData = {
  sourceColorants: OutputRecipeLayerColorant[],
  components: OutputComponentInLayerData[],
};

type OutputComponentsData = {
  components: OutputComponentData[];
  layers: OutputLayerData[];
}

const getComponentsForOutputMode = (
  solvent: Solvent | undefined,
  formula: Formula,
  originalFormula: Formula | undefined,
  colorants: Colorant[],
  _assortmentViscosity: number,
  calibrationConditionId: string,
  recipeOutputMode: RecipeOutputMode,
): OutputComponentsData => {
  const colorantComponents = colorants.map(
    ({
      id,
      isLeftover,
      name,
      specificMass,
      price,
      type: colorantType,
    }): OutputComponentData => ({
      id,
      isLeftover,
      name,
      specificMass,
      price,
      colorantType,
    }),
  );
  const solventDensity = solvent?.specificMass || 1;

  const solventComponentInfo: OutputComponentData = {
    id: SOLVENT_COMPONENT_ID,
    name: solvent ? solvent.name : 'Solvent',
    isLeftover: false,
    specificMass: solvent ? solvent.specificMass : 1,
    price: solvent?.price,
    basicMaterialType: BasicMaterialType.Solvent,
  };

  const colorantsById = keyBy(colorants, 'id');

  type SplitColorantEntry = {
    info: OutputComponentData,
    massFraction: number, // D_i^j
    volumeToMassFraction: number, // E_i^j
  };

  const components: OutputComponentData[] = [];

  const addComponent = (component: OutputComponentData) => {
    if (!components.some(({ id }) => id === component.id)) {
      components.push(component);
    }
  };

  const layers = formula.formulaLayers.map(
    (layer: FormulaLayer, layerIndex: number): OutputLayerData => {
      const recipeViscosity = layer.viscosity || 0;

      const getSolventFraction = (
        colorant?: Colorant,
      ) => getColorantSolventFraction(colorant, calibrationConditionId, recipeViscosity);

      const splitColorant = (
        colorant: Colorant,
      ): SplitColorantEntry[] => {
        const result: SplitColorantEntry[] = [];
        const solventMassFraction = (recipeOutputMode !== RecipeOutputMode.ProductionReady)
          ? getSolventFraction(colorant)
          : 0;

        if (recipeOutputMode === RecipeOutputMode.BasicMaterial && !colorant.isLeftover) {
          colorant.components.forEach((colorantComponent) => {
            const basicMaterialMassFraction = colorantComponent.concentrationPercentage / 100.0;
            if (!(colorantComponent.basicMaterial instanceof BasicMaterial)) throw new Error('Require full BasicMaterial instances in Colorants');
            result.push({
              info: createBasicMaterialComponent(
                colorant,
                colorantComponent.basicMaterial,
              ),
              massFraction: (1.0 - solventMassFraction) * basicMaterialMassFraction,
              volumeToMassFraction: 1.0, // not supported in BM mode
            });
          });
        } else {
          const colorantComponent = colorantComponents.find(({ id }) => id === colorant?.id);
          if (colorantComponent) {
            result.push({
              info: colorantComponent,
              massFraction: 1.0 - solventMassFraction,
              volumeToMassFraction:
                1.0 / (colorant.specificMass || 1) - solventMassFraction / solventDensity,
            });
          }
        }

        if (solventMassFraction > 0) {
          result.push({
            info: solventComponentInfo,
            massFraction: solventMassFraction,
            volumeToMassFraction: solventMassFraction / solventDensity,
          });
        }

        return result;
      };

      const sourceColorants: OutputRecipeLayerColorant[] = [];
      const layerComponents: OutputComponentInLayerData[] = [];

      const addColorantSplitToComponents = (colorant: Colorant) => {
        const colorantId = colorant?.id;
        const split = splitColorant(colorant);
        split.forEach((splitEntry) => {
          const componentId = splitEntry.info.id;
          // add the component info
          addComponent(splitEntry.info);

          // and add the components to the layer or update them
          const fractions: OutputComponentFractions = {
            colorantId,
            massFraction: splitEntry.massFraction,
            volumeToMassFraction: splitEntry.volumeToMassFraction,
          };
          const layerOutputData = layerComponents.find(
            (data) => data.componentId === componentId,
          );
          if (layerOutputData) {
            layerOutputData.sourceColorants.push(fractions);
          } else {
            layerComponents.push({
              componentId,
              sourceColorants: [fractions],
            });
          }
        });
      };

      layer.formulaComponents.forEach(
        (layerComponent) => {
          const colorantId = layerComponent.colorant.id;
          const colorant = colorantsById[colorantId];

          // add source colorant
          sourceColorants.push({
            colorantId,
            massAmount: layerComponent.massAmount,
            massAmountOriginal: 0,
          });

          // now split the colorant into components based on the output mode
          addColorantSplitToComponents(colorant);
        },
      );

      if (originalFormula) {
        originalFormula.formulaLayers[layerIndex].formulaComponents.forEach((layerComponent) => {
          const colorantId = layerComponent.colorant.id;
          const colorant = colorantsById[colorantId];

          // update the original mass amount in the source colorant
          const targetCol = sourceColorants.find((tcomp) => tcomp.colorantId === colorantId);
          if (targetCol) {
            targetCol.massAmountOriginal = layerComponent.massAmount;
          } else {
            sourceColorants.push({
              colorantId,
              massAmount: 0,
              massAmountOriginal: layerComponent.massAmount,
            });
            addColorantSplitToComponents(colorant);
          }
        });
      }

      return {
        components: layerComponents,
        sourceColorants,
      };
    },
  );

  return {
    components,
    layers,
  };
};

const getTotalAmounts = (
  components: OutputRecipeComponent[],
) => {
  const solventComponent = components.find(({ id }) => id === SOLVENT_COMPONENT_ID);
  if (!solventComponent) {
    const [
      totalMassAmount,
      totalVolumeAmount,
    ] = components.reduce((sums, component) => [
      sums[0] + component.massAmount,
      sums[1] + component.massAmount / (component.specificMass || 1),
    ], [0, 0]);
    return {
      totalMassAmount,
      totalMassAmountBasicInk: totalMassAmount,
      totalVolumeAmount,
      totalVolumeAmountBasicInk: totalVolumeAmount,
    };
  }

  const solventDensity = solventComponent.specificMass || 1;

  const [
    totalMassAmount,
    totalMassAmountBasicInk,
    totalVolumeAmount,
    totalVolumeAmountBasicInk,
  ] = components.reduce((sums, component) => {
    if (component.id === solventComponent.id) {
      return [
        sums[0] + component.massAmount,
        sums[1],
        sums[2] + component.massAmount / solventDensity,
        sums[3],
      ];
    }
    const componentDensity = component.specificMass || 1;
    return [
      sums[0] + component.massAmount,
      sums[1] + component.massAmount,
      sums[2] + component.massAmount / componentDensity,
      sums[3] + component.massAmount / componentDensity,
    ];
  }, [0, 0, 0, 0]);

  return {
    totalMassAmount,
    totalMassAmountBasicInk,
    totalVolumeAmount,
    totalVolumeAmountBasicInk,
  };
};

const sumAmounts = (
  [sum, sumOrig]: [number, number],
  component: OutputRecipeComponent,
): [number, number] => [sum + component.amount, sumOrig + component.originalAmount];

const outputComponentSortFunction = (
  a: OutputRecipeComponent,
  b: OutputRecipeComponent,
): number => {
  if (a.id === SOLVENT_COMPONENT_ID) return 1;
  if (b.id === SOLVENT_COMPONENT_ID) return -1;
  return b.massAmount - a.massAmount;
};

const baseOutputComponent: OutputRecipeComponent = {
  id: '',
  name: '',
  specificMass: 1,
  isLeftover: false,
  percentage: 0,
  amount: 0,
  massAmount: 0,
  originalPercentage: 0,
  originalAmount: 0,
  percentageChange: 0,
  addAmount: 0,
  sourceColorants: [],
};

const addAdditives = (
  components: OutputRecipeComponent[],
  additives: AdditiveWithConcentration[],
  totalMode: TotalMode,
  recipeUnit: RecipeUnit,
  isAdditionMode: boolean,
): {
  outputComponents: OutputRecipeComponent[],
  changeWasRequired: boolean,
  requiredClearMassAmountToAdd: number,
} => {
  if (!additives || additives.length === 0) {
    return {
      outputComponents: components,
      changeWasRequired: false,
      requiredClearMassAmountToAdd: 0,
    };
  }

  const solventComponent = components.find(({ id }) => id === SOLVENT_COMPONENT_ID);
  const clearComponent = components.find(
    ({ basicMaterialType }) => basicMaterialType === BasicMaterialType.Binder,
  );

  const recipeClearBMAmount = clearComponent?.amount || 0; // C
  const originalRecipeClearBMAmount = clearComponent?.originalAmount || 0;
  const [oldAdditiveAmount, originalOldAdditiveAmount] = components.filter(
    ({ basicMaterialType }) => basicMaterialType === BasicMaterialType.Additive,
  ).reduce(sumAmounts, [0, 0]);
  const clearBasicInkFraction = clearComponent?.sourceColorants?.[0]?.massFraction || 1;

  const solventAmount = solventComponent?.amount ?? 0;
  const originalSolventAmount = solventComponent?.originalAmount ?? 0;

  const [leftoverAmount, originalLeftoverAmount] = components.filter(
    ({ isLeftover }) => isLeftover,
  ).reduce(sumAmounts, [0, 0]);

  const [totalAmount, originalTotalAmount] = components.reduce(sumAmounts, [0, 0]);

  const totalBasicInkAmount = totalAmount - solventAmount;
  const originalTotalBasicInkAmount = originalTotalAmount - originalSolventAmount;
  let totalBasicInkAmountNoLeftover = totalBasicInkAmount - leftoverAmount;
  let originalTotalBasicInkAmountNoLeftover = originalTotalBasicInkAmount
    - originalLeftoverAmount;

  const colorantsAndSolvent = components.filter((component) => {
    return component.basicMaterialType !== 'Binder' && component.basicMaterialType !== 'Additive';
  });

  const totalAdditiveConcentration = additives.reduce(
    (sum, additive) => sum + additive.concentrationPercentage * 0.01,
    0,
  );

  const initialAdditiveAmount = totalAdditiveConcentration * totalBasicInkAmountNoLeftover;
  const originalInitialAdditiveAmount = totalAdditiveConcentration
    * originalTotalBasicInkAmountNoLeftover;

  const remainingClearAmount = recipeClearBMAmount
    + oldAdditiveAmount - initialAdditiveAmount;
  const originalRemainingClearAmount = originalRecipeClearBMAmount
    + originalOldAdditiveAmount - originalInitialAdditiveAmount;

  let clearAmountToAdd = 0;
  let originalClearAmountToAdd = 0;
  if (remainingClearAmount < 0 || remainingClearAmount < originalRemainingClearAmount) {
    const clearToAdd = -remainingClearAmount
      / (1.0 - clearBasicInkFraction * totalAdditiveConcentration);
    const originalClearToAdd = -originalRemainingClearAmount
      / (1.0 - clearBasicInkFraction * totalAdditiveConcentration);

    clearAmountToAdd = Math.max(
      clearToAdd,
      isAdditionMode ? originalClearToAdd : 0,
    );
  }
  if (originalRemainingClearAmount < 0) {
    const originalClearToAdd = -originalRemainingClearAmount
      / (1.0 - clearBasicInkFraction * totalAdditiveConcentration);
    originalClearAmountToAdd = Math.max(
      0,
      originalClearToAdd,
    );
  }

  const requiredClearMassAmountToAdd = convertRecipeUnit(
    clearAmountToAdd,
    recipeUnit,
    defaultGravimetricUnit,
    1.0, // not needed, we are in gravimetric mode either
  );

  totalBasicInkAmountNoLeftover += clearAmountToAdd * clearBasicInkFraction;
  originalTotalBasicInkAmountNoLeftover += originalClearAmountToAdd * clearBasicInkFraction;

  const additiveComponents: OutputRecipeComponent[] = additives.map((additive) => {
    const { concentrationPercentage } = additive;
    // additives percentages are always with respect to total basic ink
    // also we need to take into account here, that leftovers are expected to already contain the
    // correct amount of additives, so the leftover amount needs to be excluded here
    const additiveAmount = (concentrationPercentage / 100) * totalBasicInkAmountNoLeftover;
    const originalAdditiveAmount = (concentrationPercentage / 100)
      * originalTotalBasicInkAmountNoLeftover;
    const additiveAmountDefaultUnit = convertRecipeUnit(
      additiveAmount,
      recipeUnit,
      defaultGravimetricUnit,
      1.0,
    );

    return {
      ...baseOutputComponent,
      name: additive.name ?? '',
      id: additive.id ?? '',
      basicMaterialType: BasicMaterialType.Additive,
      massAmount: additiveAmountDefaultUnit,
      amount: additiveAmount,
      price: additive.price,
      originalAmount: originalAdditiveAmount,
    };
  });

  let newComponents: OutputRecipeComponent[] = [
    ...additiveComponents, ...colorantsAndSolvent,
  ];

  // add clear component (if something left)
  if ((remainingClearAmount > 0 || originalRemainingClearAmount > 0) && clearComponent) {
    const clearAmount = isAdditionMode
      ? Math.max(0, remainingClearAmount, originalRemainingClearAmount)
      : Math.max(0, remainingClearAmount);
    const clearAmountDefaultUnit = convertRecipeUnit(
      clearAmount,
      recipeUnit,
      defaultGravimetricUnit,
      1.0, // not needed, we are in gravimetric mode either
    );
    const originalClearAmount = Math.max(0, originalRemainingClearAmount);
    const updatedClear: OutputRecipeComponent = {
      ...clearComponent,
      massAmount: clearAmountDefaultUnit,
      amount: clearAmount,
      percentage: (clearAmount / totalBasicInkAmount) * 100,
      originalAmount: originalClearAmount,
      originalPercentage: (originalClearAmount / Math.max(originalTotalBasicInkAmount, 1)) * 100,
    };
    newComponents = [updatedClear, ...newComponents];
  }

  return {
    outputComponents: newComponents,
    changeWasRequired: clearAmountToAdd > 0,
    requiredClearMassAmountToAdd,
  };
};

const getOutputRecipeLayer = ({
  recipeOutputMode,
  layerData,
  components,
  recipeUnit,
  totalMode,
  viscosity,
  additives,
  isAdditionMode,
}: {
  recipeOutputMode: RecipeOutputMode,
  layerData: OutputLayerData,
  components: OutputComponentData[],
  colorants: Colorant[],
  recipeUnit: RecipeUnit,
  totalMode: TotalMode,
  viscosity: number,
  additives: AdditiveWithConcentration[],
  isAdditionMode: boolean,
}): OutputRecipeLayer => {
  const componentsById = keyBy(components, 'id');
  const sourceColorantsById = keyBy(layerData.sourceColorants, 'colorantId');

  // now create the output components
  const outputComponentsUnsorted = layerData.components.map(({
    componentId,
    sourceColorants,
  }: OutputComponentInLayerData): OutputRecipeComponent => {
    const component = componentsById[componentId];

    // amounts in recipe units
    const amount = sourceColorants.reduce(
      (sum, { colorantId, massFraction }) => {
        return sum + convertRecipeUnit(
          massFraction * sourceColorantsById[colorantId].massAmount,
          defaultGravimetricUnit,
          recipeUnit,
          component.specificMass,
        );
      },
      0.0,
    );
    const originalAmount = sourceColorants.reduce(
      (sum, { colorantId, massFraction }) => {
        return sum + convertRecipeUnit(
          massFraction * sourceColorantsById[colorantId].massAmountOriginal,
          defaultGravimetricUnit,
          recipeUnit,
          component.specificMass,
        );
      },
      0.0,
    );

    // amount in default unit
    const massAmount = sourceColorants.reduce(
      (sum, { colorantId, massFraction }) => {
        return sum + massFraction * sourceColorantsById[colorantId].massAmount;
      },
      0.0,
    );

    return {
      ...baseOutputComponent,
      ...component,
      amount,
      massAmount,
      originalAmount,
      sourceColorants,
    };
  });

  // add the additives and exchange with clear if required
  const {
    outputComponents: outputComponentsWithAdditives,
    changeWasRequired: changeWasRequiredForAdditives,
    requiredClearMassAmountToAdd,
  } = (
    recipeOutputMode === RecipeOutputMode.BasicMaterial)
    ? addAdditives(
      outputComponentsUnsorted,
      additives,
      totalMode,
      recipeUnit,
      isAdditionMode,
    )
    : {
      outputComponents: outputComponentsUnsorted,
      changeWasRequired: false,
      requiredClearMassAmountToAdd: 0,
    };

  const [
    totalAmount,
    originalTotalAmount,
  ] = outputComponentsWithAdditives.reduce(sumAmounts, [0, 0]);

  const outputSolventComponent = outputComponentsWithAdditives.find(
    ({ id }) => id === SOLVENT_COMPONENT_ID,
  );

  const canSize = totalMode === 'Total'
    ? totalAmount
    : totalAmount - (outputSolventComponent?.massAmount || 0);

  const originalCanSize = totalMode === 'Total'
    ? originalTotalAmount
    : originalTotalAmount - (outputSolventComponent?.originalAmount || 0);

  // sort by concentration
  const outputComponents = outputComponentsWithAdditives.sort(outputComponentSortFunction);

  // and update the cumulative and other computed fields
  outputComponents.forEach((outputComponent, index) => {
    const percentage = (outputComponent.amount / canSize) * 100.0;
    const originalPercentage = (outputComponent.originalAmount
      / Math.max(originalCanSize, 1)) * 100.0;
    outputComponents[index] = {
      ...outputComponent,
      percentage,
      originalPercentage,
      addAmount: outputComponent.amount - outputComponent.originalAmount,
      percentageChange: ((outputComponent.amount - outputComponent.originalAmount)
        / (outputComponent.originalAmount || 1)) * 100,
    };
  });

  const totalAmounts = getTotalAmounts(outputComponents);

  // and finally assemble result data
  const result: OutputRecipeLayer = {
    components: outputComponents,
    colorants: layerData.sourceColorants,
    ...totalAmounts,
    canSizeInRecipeUnits: canSize,
    viscosity,
    changeWasRequiredForAdditives,
    requiredClearMassAmountToAdd,
  };

  return result;
};

export const getOutputRecipe = ({
  solvent,
  formula,
  originalFormula,
  colorants,
  recipeOutputMode,
  assortmentViscosity,
  calibrationConditionId,
  canUnit,
  recipeUnit,
  totalMode,
}: {
  solvent?: Solvent,
  formula: Formula,
  originalFormula?: Formula,
  colorants: Colorant[],
  recipeOutputMode: RecipeOutputMode,
  assortmentViscosity: number,
  calibrationConditionId: string,
  canUnit: RecipeUnit,
  recipeUnit: RecipeUnit,
  totalMode: TotalMode,
}): OutputRecipe => {
  const {
    layers,
    components,
  } = getComponentsForOutputMode(
    solvent,
    formula,
    originalFormula,
    colorants,
    assortmentViscosity || 0,
    calibrationConditionId,
    recipeOutputMode,
  );
  const { formulationSettings } = formula;
  const additives = isFormulationSettings(formulationSettings)
    ? formulationSettings.additives || []
    : [];

  const correctionMode = formula && originalFormula
    && isFormulationSettings(formula?.formulationSettings)
    ? (formula?.formulationSettings.correctionMode || 'New')
    : 'New';

  const result: OutputRecipe = {
    mode: recipeOutputMode,
    totalMode,
    canSize: 0,
    canUnit,
    layers: [],
    price: 0,
    currencyCode: colorants.find(({ price }) => !!price?.currencyCode)?.price?.currencyCode,
  };

  layers.forEach((layerData, layerIndex) => {
    const formulaLayer = formula.formulaLayers[layerIndex];
    const viscosity = formulaLayer.viscosity || assortmentViscosity || 0;
    const layer = getOutputRecipeLayer({
      layerData,
      components,
      colorants,
      recipeOutputMode,
      recipeUnit,
      totalMode,
      viscosity,
      additives,
      isAdditionMode: correctionMode === 'Add',
    });
    result.layers.push(layer);
    layer.components.forEach((layerComponent) => {
      result.price += layerComponent.massAmount * (layerComponent.price?.amount || 0);
    });
  });

  if (result.layers.length > 0) {
    const layer = result.layers[0];
    const averageDensity = (totalMode === 'Total')
      ? layer.totalMassAmount / (layer.totalVolumeAmount || 1)
      : layer.totalMassAmountBasicInk / (layer.totalVolumeAmountBasicInk || 1);
    result.canSize = convertRecipeUnit(
      layer.canSizeInRecipeUnits,
      recipeUnit,
      canUnit,
      averageDensity,
    );
  }

  return result;
};

export const scaledFormula = (
  formula: Formula,
  factor: number,
  newQuantity?: Quantity,
  totalMode?: TotalMode,
): Formula => new Formula({
  ...formula,
  formulaLayers: formula.formulaLayers.map((layer): FormulaLayer => new FormulaLayer({
    ...layer,
    quantity: newQuantity,
    formulaComponents: layer.formulaComponents.map((component) => ({
      ...component,
      massAmount: component.massAmount * factor,
    })),
  })),
  formulationSettings: {
    ...formula.formulationSettings,
    totalMode: totalMode ?? formula.formulationSettings?.totalMode,
  },
});

export const getQuantityAmount = (
  components: FormulaComponent[],
  canUnit: RecipeUnit,
  colorants: Colorant[],
) => {
  const newAmounts = components.map((component) => {
    const colorant = colorants.find(({ id }) => component.colorant.id === id);

    if (!colorant) return 0;

    const newComponentAmount = convertRecipeUnit(
      component.massAmount,
      defaultGravimetricUnit,
      canUnit,
      colorant?.specificMass,
    );

    return newComponentAmount;
  });

  return newAmounts.reduce((result, amount) => result + amount, 0);
};

type PartialComponent = {
  basicMaterialType?: BasicMaterialType,
  colorantType?: ColorantType
}

export const isComponentAClear = (
  component: PartialComponent,
  recipeOutputMode: RecipeOutputMode,
) => {
  const isBasicMaterial = recipeOutputMode === RecipeOutputMode.BasicMaterial;

  if (isBasicMaterial) return component.basicMaterialType === BasicMaterialType.Binder;

  return Boolean(
    component.colorantType
    && isColorantAClear({ type: component.colorantType }),
  );
};

export const isComponentAColorant = (
  component: PartialComponent,
  recipeOutputMode: RecipeOutputMode,
) => {
  const isBasicMaterial = recipeOutputMode === RecipeOutputMode.BasicMaterial;

  if (isBasicMaterial) return component.basicMaterialType === BasicMaterialType.Pigment;

  return component.colorantType === ColorantType.Colorant;
};

export const isComponentATechnicalVarnish = (
  component: PartialComponent,
  recipeOutputMode: RecipeOutputMode,
) => {
  const isBasicMaterial = recipeOutputMode === RecipeOutputMode.BasicMaterial;

  if (isBasicMaterial) return component.basicMaterialType === BasicMaterialType.TechnicalVarnish;

  return Boolean(
    component.colorantType
    && isColorantATechnicalVarnish({ type: component.colorantType }),
  );
};

export const isComponentAdditive = (
  component: { basicMaterialType?: BasicMaterialType },
) => {
  return component.basicMaterialType === BasicMaterialType.Additive;
};

export const isComponentSolvent = (
  component: { basicMaterialType?: BasicMaterialType },
) => {
  return component.basicMaterialType === BasicMaterialType.Solvent;
};

export const isComponentABlack = (
  component: { colorantType?: ColorantType },
) => {
  return component.colorantType === ColorantType.Black;
};

export const isComponentAWhite = (
  component: { colorantType?: ColorantType },
) => {
  return component.colorantType === ColorantType.White;
};

export const getComponentType = (
  component: PartialComponent & { isLeftover: boolean },
  recipeOutputMode: RecipeOutputMode,
) => {
  // LEFTOVER
  if (component.isLeftover) return 'Leftover';

  // COLORANT CLEAR
  if (isComponentAClear(component, recipeOutputMode)) return 'Clear';

  // BLACK
  if (isComponentABlack(component)) return 'Black';

  // WHITE
  if (isComponentAWhite(component)) return 'White';

  // TECHNICAL VARNISH
  if (isComponentATechnicalVarnish(component, recipeOutputMode)) return 'TechnicalVarnish';

  // ADDITIVE
  if (isComponentAdditive(component)) return 'Additive';

  // SOLVENT
  if (isComponentSolvent(component)) return 'Solvent';

  // COLORANT, when in Basic Material colorantType exists and basicMaterial
  if (isComponentAColorant(component, recipeOutputMode)) return 'Colorant';

  return '';
};

export const computeCanSizeFromComponents = (
  components: FormulaComponent[],
  viscosity: number,
  colorants: Colorant[],
  calibrationConditionId: string,
  totalMode: TotalMode,
  solvent?: Solvent,
): {
  massSum: number,
  volumeSum: number,
} => {
  return components.reduce(
    (previous, component) => {
      const colorant = colorants.find(({ id }) => id === component.colorant.id);
      const specificMass = colorant?.specificMass || 1;

      const solventFraction = getColorantSolventFraction(
        colorant,
        calibrationConditionId,
        viscosity,
      );

      let currentMass = component.massAmount;
      let currentVolume = component.massAmount / specificMass;

      if (totalMode === 'BasicInkTotal') {
        const solventDensity = solvent?.specificMass ?? 1;
        const basicInkMass = component.massAmount * (1 - solventFraction);
        const solventMass = component.massAmount * solventFraction;
        const solventVolume = solventMass / solventDensity;
        const basicInkVolume = currentVolume - solventVolume;

        currentMass = basicInkMass;
        currentVolume = basicInkVolume;
      }

      return {
        massSum: previous.massSum + currentMass,
        volumeSum: previous.volumeSum + currentVolume,
      };
    },
    { massSum: 0, volumeSum: 0 },
  );
};
