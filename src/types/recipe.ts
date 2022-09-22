import { BasicMaterialType, ColorantType, Price } from '@xrite/cloud-formulation-domain-model';
import { RGB } from '@xrite/colorimetry-js';

export enum RecipeOutputMode {
  BasicMaterial = 1,
  BasicInksAndSolvent = 2,
  ProductionReady = 3,
}

export type TotalMode = 'BasicInkTotal' | 'Total';

export type RecipeUnit = {
  id: string,
  name: string,
  isVolumetric: boolean,
  factorToDefaultUnit: number, // g for gravimetric, ml for volumetric
};

export type OutputComponentFractions = {
  colorantId: string,
  massFraction: number, // D_i^j
  volumeToMassFraction: number, // E_i^j
};

export type OutputRecipeLayerColorant = {
  colorantId: string,
  massAmount: number, // M_i
  massAmountOriginal: number,
};

export type OutputComponentData = {
  id: string,
  name: string,
  colorantType?: ColorantType,
  basicMaterialType?: BasicMaterialType,
  specificMass: number,
  isLeftover: boolean,
  price?: Price,
};

export type OutputRecipeComponent = OutputComponentData & {
  percentage: number,
  amount: number, // A_j
  massAmount: number, // amount in g
  originalPercentage: number,
  originalAmount: number,
  percentageChange: number,
  addAmount: number,
  sourceColorants: OutputComponentFractions[],
}

export type OutputRecipeComponentWithEditing = OutputRecipeComponent & {
  isAmountEditable: boolean,
  allowEditingAdditives: boolean,
  recipeOutputMode: RecipeOutputMode,
  recipeUnit: RecipeUnit,
};

export type OutputRecipeComponentWithColor = OutputRecipeComponentWithEditing & {
  previewColor: RGB;
};

export type OutputRecipeLayer = {
  components: OutputRecipeComponent[],
  colorants: OutputRecipeLayerColorant[],
  viscosity: number,
  canSizeInRecipeUnits: number,
  totalMassAmount: number,
  totalVolumeAmount: number,
  totalMassAmountBasicInk: number,
  totalVolumeAmountBasicInk: number,
  changeWasRequiredForAdditives: boolean,
  requiredClearMassAmountToAdd: number,
};

export type OutputRecipeLayerWithColors = Omit<OutputRecipeLayer, 'components'> & {
  components: OutputRecipeComponentWithColor[],
};

export type OutputRecipe = {
  mode: RecipeOutputMode,
  totalMode: TotalMode,
  canSize: number,
  canUnit: RecipeUnit,
  price: number,
  currencyCode?: string,
  layers: OutputRecipeLayer[],
}

export type OutputRecipeWithColors = Omit<OutputRecipe, 'layers'> & {
  layers: OutputRecipeLayerWithColors[],
};
