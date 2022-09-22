import { BasicMaterialType, ColorantType, Price } from '@xrite/cloud-formulation-domain-model';
import { RGB } from '@xrite/colorimetry-js';
import { ColorantRestriction, ColorimetricSettings, AdditiveWithConcentration } from './cfe';
import { RecipeOutputMode, RecipeUnit, TotalMode } from './recipe';

export enum OpacityMode {
  None = 1,
  OpacityFixed = 2,
  OpacityMinimum = 3,
  Transparent = 4,
  Opaque = 5,
  TargetOnWhiteAndBlack = 6,
  ContrastRatioFixed = 7,
  ContrastRatioMinimum = 8,
}

export enum MetricType {
  Colorimetric,
  Spectral,
  SpectralShape,
  Balanced,
}

export enum ThicknessOption {
  None,
  Thickness
}

export enum CombinatorialMode {
  Full = 'Full',
  FastMatch = 'Fast Match',
  Off = 'Off',
}

export enum SearchAndCorrectMode {
  Off = 'match',
  Search = 'searchOnly',
  SearchAndCorrect = 'searchAndCorrected',
}

export const ThicknessLabel = {
  [ThicknessOption.None]: 'None',
  [ThicknessOption.Thickness]: 'Thickness',
};

export type FormulationComponent = {
  id: string,
  name: string,
  colorantId?: string, // the colorant used for creating the component (in case of basic material)
  previewColor: RGB,
  type: ColorantType,
  basicMaterialType?: BasicMaterialType,
  specificMass: number,
  isLeftover: boolean,
  minConcentrationPercentage: number,
  maxConcentrationPercentage: number,
  price?: Price,
  tags?: string[],
};

export type FormulationDefaults = {
  defaultCanSize: number,
  defaultCanUnit: RecipeUnit,
};

export interface SwatchSet {
  colorOfStandard: RGB,
  colorOfRecipe?: RGB,
  condition: string,
}

export enum SubstrateTypeMode {
  None,
  Transparent,
  Metallic,
  Opaque,
}

export enum SubstrateQualityMode {
  None,
  Glossy,
  Matt,
  Coated,
  Uncoated,
  UserDefined,
}

export type ConcentrationPercentages = {
  [componentId: string]: {
    minConcentrationPercentage?: number;
    maxConcentrationPercentage?: number;
  }
}

// temporary type for the formulation settings saved in the db attached to sample
// ! all optional fields are optional because it's an old data
export type FormulationSettings = {
  recipeOutputMode: RecipeOutputMode;
  calibrationConditionId: string;
  engineId: string;
  targetViscosity: number;
  totalMode: TotalMode;
  selectedColorantIds?: string[];
  colorantRestrictions?: ColorantRestriction[],
  requiredColorantIds?: string[];
  metricType: MetricType;
  colorimetricSettings: ColorimetricSettings;
  relativeThicknessMin: number;
  relativeThicknessMax: number;
  opacityMode: OpacityMode;
  opacityMinPercent: number;
  opacityMaxPercent: number;
  additives?: AdditiveWithConcentration[];
  clearId: string;
  correctionMode: 'New' | 'Add' | undefined;
};

export type MeasurementAvailableCondition =
  'M0'|
  'M1'|
  'M2'|
  'M3'|
  'D8spin'|
  'D8spex';
