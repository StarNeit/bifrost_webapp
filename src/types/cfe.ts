import * as CFDM from '@xrite/cloud-formulation-domain-model';
import {
  CombinatorialMode,
  OpacityMode,
  MetricType,
} from './formulation';
import {
  RecipeUnit,
  RecipeOutputMode,
  TotalMode,
} from './recipe';

export type IndustryType =
  | 'Ink'
  | 'Paint'
  | 'Plastics'
  | 'Effects';

export type IndustrySubType =
  | 'Flexo'
  | 'Offset'
  | 'Screen'
  | 'Undefined';

export type EngineType =
  | 'EFX1.6'
  | 'IFS6.5';

type ComputationType =
  | 'Full'
  | 'LookupTable';

export type CombinationType =
  | 'FullCombinatorial'
  | 'ColorantGroups'
  | 'TypeRestricted'
  | 'ClearWhiteBlackPlusColorants'
  | 'FastMatch'
  | 'AddColorants'
  | 'ExchangeColorants';

export type ColorantType =
  | 'Base'
  | 'AlternativeBase'
  | 'White'
  | 'Black'
  | 'Colorant'
  | 'Disorienter' // EFX
  | 'Metallic' // EFX
  | 'Pearl' // EFX
  | 'Special' // EFX
  | 'TechnicalVarnish'; // IFS

export const geometries = [
  '45_0',
  'SphereSpecularIncluded',
  'SphereSpecularExluded',
  'SphereTransmission',
  '45asMinus15',
  '45as15',
  '45as25',
  '45as45',
  '45as75',
  '45as110',
  '15asMinus45',
  '15asMinus15',
  '15as15',
  '15as45',
  '15as80',
  '45as60azMinus125.3',
  '45as60az125.3',
  '45as25azMinus90',
  '45as25az90',
  '15as46.9azMinus104.5',
  '15as46.9az104.5',
  '15as38.3azMinus43',
  '15as38.3az43',
] as const;

export type Geometry = typeof geometries[number];

export const substrateTypes = [
  'OpaqueSubstrate',
  'Transparent',
  'MetallicSurface',
] as const;
export type SubstrateType = typeof substrateTypes[number];

export const filterConditions = [
  'M0',
  'M1',
  'M2',
  'M3',
] as const;
export type FilterCondition = typeof filterConditions[number];

export const backingTypes = [
  'Light',
  'Dark',
] as const;
export type BackingType = typeof backingTypes[number];

export const surfaceTypes = [
  'Coated',
  'Uncoated',
  'Metalized',
  'MetalizedOpaque',
] as const;
export type SurfaceType = typeof surfaceTypes[number];

export const illuminantTypes = [
  'A',
  'C',
  'D50',
  'D55',
  'D65',
  'D75',
  'E',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
] as const;
export type IlluminantType = typeof illuminantTypes[number];

export const observerTypes = [
  'TwoDeg',
  'TenDeg',
] as const;
export type ObserverType = typeof observerTypes[number];

export type RecipeOutputType =
  | 'PrintReadyInks'
  | 'BasicInksAndSolvent'
  | 'BasicMaterials';

type DeltaEFormulaType =
  | 'CIELab'
  | 'CMC'
  | 'DE94'
  | 'LABmg'
  | 'DE2000';

type IFSLabComputationType =
  | 'CIELab'
  | 'Lab94W';

export type OpacitySettingsType =
  | 'None'
  | 'Opaque'
  | 'Transparent'
  | 'DeltaEDifference'
  | 'Opacity'
  | 'Contrast'
  | 'AverageTransmission'
  | 'HidingPower';

export interface OpacitySettingsNone {
  opacitySettingsType: 'None';
}

export interface OpacitySettingsDeltaEDifference {
  opacitySettingsType: 'DeltaEDifference';
  deltaEValue: number;
}

export interface OpacitySettingsOther {
  opacitySettingsType: Exclude<OpacitySettingsType, 'None' | 'DeltaEDifference'>;
  minValuePercentage: number;
  maxValuePercentage: number;
}

export type OpacitySettings =
  | OpacitySettingsNone
  | OpacitySettingsDeltaEDifference
  | OpacitySettingsOther;

export interface CalibrationData {
  name: string;
  values: number[];
}

export interface Colorant {
  id: string;
  name: string;
  type: ColorantType;
  specificWeight: number;
  isLeftover?: boolean;
  minConcentrationPercentage: number;
  maxConcentrationPercentage: number;
  calibrationData: CalibrationData[];
}

interface ColorantConstraintRatio {
  colorantId: string;
  anchorColorantId: string;
  coat?: number;
  ratio: number;
}
interface ColorantConstraintFixed {
  colorantId: string;
  concentrationPercentage: number;
  coat?: number;
}
type ColorantConstraint =
  | ColorantConstraintRatio
  | ColorantConstraintFixed;

export interface FormulaComponent {
  colorantId: string;
  massAmount: number;
}

export interface Formula {
  components: FormulaComponent[];
  viscosity?: number;
}

export type LAB = {
  illuminant: IlluminantType;
  observer: ObserverType;
  values: [number, number, number]
};

export interface ColorSpectrum {
  geometry: Geometry;
  filterCondition?: FilterCondition;
  lab?: LAB;
  spectralRange?: {
    startWavelength: number;
    endWavelength: number;
    wavelengthInterval: number;
  }
  spectralValues?: number[];
}

export interface ResultColorSpectrum {
  geometry: Geometry;
  filterCondition?: FilterCondition;
  lab?: LAB;
  spectralRange: {
    startWavelength: number;
    endWavelength: number;
    wavelengthInterval: number;
  }
  spectralValues: number[];
}

export interface Measurement {
  backing?: BackingType;
  surface?: SurfaceType;
  colorSpectra: ColorSpectrum[];
}

export interface ResultMeasurement {
  backing?: BackingType;
  surface?: SurfaceType;
  colorSpectra: ResultColorSpectrum[];
}

export interface Substrate {
  measurements: Measurement[];
  name: string;
  type: SubstrateType;
  calibrationData?: CalibrationData[];
}

export interface Assortment {
  availableColorants: Colorant[];
  substrate: Substrate;
  calibrationData?: CalibrationData[];
}

export interface CombinationSettings {
  combinationType: CombinationType;
  minNumberOfColorants: number;
  maxNumberOfColorants: number;
  maxNumberOfCombinations: number;
  fixedColorants: { id: string }[];
}

export interface FormulationSettingsEFX {
  opacitySettings: OpacitySettings;
  maxDeltaE?: number;
  colorVersusOpacity?: number;
}

export interface FormulationSettingsIFS {
  opacitySettings: OpacitySettings;
  minThickness?: number;
  maxThickness?: number;
  targetOpacity?: number;
  recipeOutputType: RecipeOutputType;
  totalMode: TotalMode;
}

export type FormulationSettings = FormulationSettingsEFX | FormulationSettingsIFS;

// correction settings

export type CorrectionMode = 'New' | 'Add';

interface CorrectionSettingsNewMode {
  correctionMode: 'New';
}

interface CorrectionSettingsAddMode {
  correctionMode: 'Add';
  minAddPercentage: number;
  maxAddPercentage: number;
}

type CorrectionSettingsMode = CorrectionSettingsNewMode | CorrectionSettingsAddMode;

export type ResinRestrictionType =
  | 'None'
  | 'FixAmount'
  | 'FixPercentage';

export type ColorOnlyCorrectionMode = 'On' | 'Off';

type CorrectionSettingsCommon = {
  selectedColorants?: { id: string }[];
} & CorrectionSettingsMode;

export type CorrectionSettingsEFX =
  & {
    resinRestrictionType: ResinRestrictionType;
    colorOnlyCorrectionMode: ColorOnlyCorrectionMode;
  }
  & CorrectionSettingsCommon;

export type CorrectionSettingsIFS =
  & {
    recipeOutputType?: RecipeOutputType;
    totalMode?: TotalMode;
    correctionPenalty?: number;
    allowRemoveColorantsForCorrection?: boolean;
  }
  & CorrectionSettingsCommon;

export type CorrectionSettings = CorrectionSettingsEFX | CorrectionSettingsIFS;

export interface IlluminantWeight {
  illuminant: IlluminantType;
  weight: number;
}

export interface MetricSettingsIFS {
  observer: ObserverType;
  illuminants: [IlluminantWeight, IlluminantWeight, IlluminantWeight];
  deltaEFormula?: DeltaEFormulaType;
  deltaEFormulaParameters?: number[];
  lchWeights?: [number, number, number];
  labComputationType: IFSLabComputationType;
}

export interface MetricSettingsEFX {
  observer: ObserverType;
  illuminants: [IlluminantWeight, IlluminantWeight, IlluminantWeight];
  weightShape?: number;
  weightSpectral?: number;
  weightFlop?: number;
  exponentShape?: number;
  exponentSpectral?: number;
  lchWeights?: [number, number, number];
}

export type MetricSettings = MetricSettingsEFX | MetricSettingsIFS;

export type FormulationInputSample = {
  name: string;
  substrate: Substrate;
  measurements: Measurement[];
  formula?: Formula;
  midcoatFormula?: Formula;
  relativeThickness: number;
};

export type FormulationResultSample = {
  name: string;
  measurements: ResultMeasurement[];
  formula: Formula;
  midcoatFormula?: Formula;
  relativeThickness: number;
}

export interface FormulationInput {
  industryType: IndustryType;
  industrySubtype?: IndustrySubType;
  computationType: ComputationType;
  maxResults?: number;
  assortment: {
    availableColorants: Colorant[];
    substrate?: Substrate;
    calibrationData?: CalibrationData[];
  };
  targetSample: FormulationInputSample;
  substrate: Substrate;
  combinationSettings: CombinationSettings;
  formulationSettings: FormulationSettings;
  metricSettings: MetricSettings;
  colorantConstraints?: ColorantConstraint[];
}

export interface FormulationResult {
  sample: FormulationResultSample;
  score: number;
}

export interface TrialSample {
  name: string;
  substrate: Substrate;
  measurements: Measurement[];
  formula: Formula;
  midcoatFormula?: Formula;
  relativeThickness: number;
}

export type TrialSampleNoMeasurement = Omit<TrialSample, 'measurements'>;

export interface CorrectionInput {
  industryType: IndustryType;
  industrySubtype?: IndustrySubType;
  computationType: ComputationType;
  maxResults?: number;
  assortment: {
    availableColorants: Colorant[];
    substrate?: Substrate;
    calibrationData?: CalibrationData[];
  };
  trialSample: TrialSample;
  targetSample?: FormulationInputSample;
  correctionSettings: CorrectionSettings;
  metricSettings?: MetricSettings;
  colorantConstraints?: ColorantConstraint[];
}

export interface CorrectionResult {
  sample: FormulationResultSample;
  score: number;
}

export interface PredictionInput {
  industryType: IndustryType;
  industrySubtype?: IndustrySubType;
  assortment: Assortment;
  sample: TrialSampleNoMeasurement;
}

export interface CalibrationInput {
  industryType: IndustryType;
  industrySubtype?: IndustrySubType;
  assortment: Assortment;
  inputColorants: Colorant[];
  letdowns: TrialSample[];
}

export type FormulationResults = FormulationResult[];
export type CorrectionResults = CorrectionResult[];
export type PredictionResults = ResultMeasurement[];
export type CalibrationResults = Colorant[];

export type AdditiveWithConcentration = {
  id?: string | undefined;
  creationDateTime?: string | undefined;
  creatorId?: string | undefined;
  aclId?: string | undefined;
  name?: string | undefined;
  type?: string | undefined;
  price?: {
    amount: number;
    currencyCode: string;
  };
  concentrationPercentage: number;
}

export type ColorantRestriction = {
  id: string;
  minConcentrationPercentage: number;
  maxConcentrationPercentage: number;
};

export type ColorimetricSettings = {
  illuminants: {
    illuminant: CFDM.IlluminantType;
    weight: number;
  }[];
  observer: CFDM.ObserverType;
  deltaE2000Weights: { kl: number, kc: number, kh: number };
};

export type EngineBaseParameters = {
  assortment: CFDM.Assortment;
  calibrationCondition: CFDM.CalibrationCondition;
  substrate: CFDM.Substrate;
  standard: CFDM.Standard;
  colorants: CFDM.Colorant[];
  clearId: string;
  fixedColorantIds: string[];
  relativeThicknessMin: number;
  relativeThicknessMax: number;
  recipeOutputMode: RecipeOutputMode;
  opacityMode: OpacityMode;
  opacityMinPercent: number;
  opacityMaxPercent: number;
  viscosity: number;
  totalMode: TotalMode;
  additives: AdditiveWithConcentration[];
  colorimetricSettings: ColorimetricSettings;
  canSize: number;
  canUnit: RecipeUnit;
  metricType: MetricType;
};

export type FormulationParameters = EngineBaseParameters & {
  requiredColorantIds: string[];
  combinatorialMode: CombinatorialMode;
  maxNumberOfColorants: number;
};

export type CorrectionParameters = EngineBaseParameters & {
  trialSample: CFDM.AppearanceSample;
  selectedColorantIds: string[];
  formula: CFDM.Formula;
  correctionMode: CorrectionMode;
  minAddPercentage?: number;
  maxAddPercentage?: number;
  correctionPenalty?: number;
  allowRemoveColorantsForCorrection?: boolean;
  resinRestrictionType?: ResinRestrictionType;
  colorOnlyCorrectionMode?: ColorOnlyCorrectionMode;
};

export type PredictionParameters = {
  assortment: CFDM.Assortment;
  calibrationCondition: CFDM.CalibrationCondition;
  colorants: CFDM.Colorant[];
  substrate: CFDM.Substrate;
  formula: CFDM.Formula;
};

export type CalibrationParameters = {
  substrate: CFDM.Substrate;
  formula: CFDM.Formula;
  measurements: CFDM.Measurement[];
  calibrationCondition: CFDM.CalibrationCondition;
  assortment: CFDM.Assortment;
  colorants?: CFDM.Colorant[];
};
