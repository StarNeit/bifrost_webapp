/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/export */
import {
  CalibrationParameter,
  Industry,
  Colorant,
  MeasurementSample,
  Measurement,
  Substrate,
  CalibrationCondition,
  SpectralSampling,
  Spectrum,
  MeasurementCondition,
  AppearanceSample,
  BackingType,
  IlluminationLightType,
  PolarizationFilterType,
  UVFilter,
  ColorantType,
  SurfaceType,
  Formula,
  FormulaLayer,
  IlluminantType,
  ObserverType,
  FormulaComponent, ColorSpaceType, NumberArray, Assortment,
} from '@xrite/cloud-formulation-domain-model';
import { v4 as uuid } from 'uuid';

import * as CFE from '../types/cfe';
import {
  CombinatorialMode,
  MetricType,
  OpacityMode,
} from '../types/formulation';
import { RecipeOutputMode, RecipeUnit, TotalMode } from '../types/recipe';
import {
  isArray,
  isNumber,
  isString,
  isUnionType,
  Unvalidated,
} from '../types/utils';
import { getGeometryName } from '../utils/colorimetry';
import {
  getCalibrationEngineClass,
  getCalibrationEngineClassAndVersion,
} from '../utils/utils';
import { isCompatibleMeasurementCondition } from '../utils/utilsMeasurement';
import {
  computeCanSizeFromComponents,
  convertRecipeUnit,
  defaultGravimetricUnit,
} from '../utils/utilsRecipe';

export const isIFSEngine = (engineId: CFE.EngineType): boolean => (engineId.substr(0, 3).toUpperCase() === 'IFS');

// TODO: some magic numbers turned into magic constants
const IFS_MAX_COLORANTS_COUNT = 3;
const EFX_MAX_COLORANTS_COUNT = 8;

export const getEngineType = (engineId: string): CFE.EngineType => {
  // * Format: "<engineType>-<version>[-<mathModel>]".
  // * E.g "EFX-1.6.1", "IFS-6.5", "IFS-6.5-Roughness"
  const [type, version/* , mathModel */] = engineId.split('-');
  const [major, minor] = version.split('.');
  const versionPart = `${major}.${minor}`;
  if (type === 'EFX') {
    if (versionPart === '1.3' || versionPart === '1.6') return 'EFX1.6';
  }
  if (type === 'IFS') {
    if (versionPart === '6.5') return 'IFS6.5';
  }
  throw new Error('Unrecognized engineId');
};

const getIFSMathModelFromEngineModel = (engineModel?: string) => {
  const modelClean = engineModel?.toLowerCase() || '';
  if (modelClean === 'roughness') return 5;
  if (modelClean === 'absorption') return 51;
  return 0;
};

const convertObserver = (observer: ObserverType): CFE.ObserverType => {
  switch (observer) {
    case ObserverType.TwoDegree: return 'TwoDeg';
    case ObserverType.TenDegree: return 'TenDeg';
    default: throw new Error('Unsupported observer');
  }
};

const convertIlluminant = (illuminant: IlluminantType): CFE.IlluminantType => {
  switch (illuminant) {
    case IlluminantType.A: return 'A';
    case IlluminantType.C: return 'C';
    case IlluminantType.D50: return 'D50';
    case IlluminantType.D55: return 'D55';
    case IlluminantType.D65: return 'D65';
    case IlluminantType.D75: return 'D75';
    case IlluminantType.E: return 'E';
    case IlluminantType.FL1: return 'F1';
    case IlluminantType.FL2: return 'F2';
    case IlluminantType.FL3: return 'F3';
    case IlluminantType.FL4: return 'F4';
    case IlluminantType.FL5: return 'F5';
    case IlluminantType.FL6: return 'F6';
    case IlluminantType.FL7: return 'F7';
    case IlluminantType.FL8: return 'F8';
    case IlluminantType.FL9: return 'F9';
    case IlluminantType.FL10: return 'F10';
    case IlluminantType.FL11: return 'F11';
    case IlluminantType.FL12: return 'F12';
    default: throw new Error('Unsupported illuminant');
  }
};

const convertIlluminantWeight = (illuminantWeight: {
  illuminant: IlluminantType;
  weight: number;
}): CFE.IlluminantWeight => ({
  illuminant: convertIlluminant(illuminantWeight.illuminant),
  weight: illuminantWeight.weight,
});

const convertBackingType = (backing: BackingType): CFE.BackingType | undefined => {
  switch (backing) {
    case 'White':
      return 'Light';
    case 'Black':
      return 'Dark';
    default:
      return undefined;
  }
};

const convertBackingTypeToDomainModel = (backing?: CFE.BackingType): BackingType | undefined => {
  switch (backing) {
    case 'Light':
      return BackingType.White;
    case 'Dark':
      return BackingType.Black;
    default:
      return undefined;
  }
};

const convertSurfaceType = (surface: SurfaceType): CFE.SurfaceType | undefined => {
  switch (surface) {
    case SurfaceType.Coated:
      return 'Coated';
    case SurfaceType.Uncoated:
      return 'Uncoated';
    case SurfaceType.Metallic:
      return 'Metalized';
    default:
      return undefined;
  }
};

const convertSurfaceTypeToDomainModel = (surface?: CFE.SurfaceType): SurfaceType | undefined => {
  switch (surface) {
    case 'Coated':
      return SurfaceType.Coated;
    case 'Uncoated':
      return SurfaceType.Uncoated;
    default:
      return undefined;
  }
};

const getGeometryNameAndFilterCondition = (
  condition: MeasurementCondition,
): [CFE.Geometry | undefined, CFE.FilterCondition | undefined] => {
  const geometryName = getGeometryName(condition.geometry);

  let filterCondition: CFE.FilterCondition | undefined;
  if (geometryName === '45_0') {
    if ((condition.illumination.illuminationLight === IlluminationLightType.A)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.none)
      && (condition.illumination.uvFilter === UVFilter.none)) filterCondition = 'M0';
    if ((condition.illumination.illuminationLight === IlluminationLightType.D50)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.none)
      && (condition.illumination.uvFilter === UVFilter.none)) filterCondition = 'M1';
    if ((condition.illumination.illuminationLight === IlluminationLightType.A)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.none)
      && (condition.illumination.uvFilter === UVFilter.uv420)) filterCondition = 'M2';
    if ((condition.illumination.illuminationLight === IlluminationLightType.A)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.polarized)
      && (condition.illumination.uvFilter === UVFilter.none)) filterCondition = 'M3';
  }

  return [geometryName, filterCondition];
};

const isSampleUniform = (
  sample: MeasurementSample,
) => (sample.data.extentPixels.width * sample.data.extentPixels.height) === 1;

const createColorSpectrum = (
  sample: MeasurementSample,
  calibrationCondition: CalibrationCondition,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  spectralSampling: SpectralSampling,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  allowLab: boolean,
): CFE.ColorSpectrum | undefined => {
  const [geometry, filterCondition] = getGeometryNameAndFilterCondition(
    sample.measurementCondition,
  );
  if (!geometry) return undefined;

  const { colorSpecification } = sample;
  if (allowLab && colorSpecification.colorSpace === ColorSpaceType.CIELab
    && colorSpecification.illuminant && colorSpecification.observer) {
    return {
      geometry,
      filterCondition,
      lab: {
        illuminant: convertIlluminant(colorSpecification.illuminant),
        observer: convertObserver(colorSpecification.observer),
        values: [sample.data.data[0], sample.data.data[1], sample.data.data[2]],
      },
    };
  }

  if (!sample.colorSpecification.spectralSampling) return undefined;
  if (!isSampleUniform(sample)) return undefined;

  const isConditionSupported = calibrationCondition.measurementConditions.some(
    (cond) => isCompatibleMeasurementCondition(sample.measurementCondition, cond),
  );
  if (!isConditionSupported) return undefined;

  // TODO: we might need to resample the spectrum to the engine sampling (spectralSampling)

  return {
    geometry,
    filterCondition,
    spectralRange: {
      startWavelength: sample.colorSpecification.spectralSampling.startWavelength,
      endWavelength: sample.colorSpecification.spectralSampling.endWavelength,
      wavelengthInterval: sample.colorSpecification.spectralSampling.wavelengthInterval,
    },
    spectralValues: sample.data.data,
  };
};

const getSpectralCalibrationData = (
  colorant: Colorant,
  calibrationConditionId: string,
): CalibrationParameter | undefined => colorant.calibrationParameters.find(
  (data) => (
    (
      (!data.calibrationConditionId)
      || (data.calibrationConditionId === calibrationConditionId)
    )
    && (data.data instanceof Spectrum)
  ),
);

const getSpectralSamplingFromColorants = (
  colorants: Colorant[],
  calibrationConditionId: string,
): SpectralSampling | undefined => {
  const spectralCalibrationData = colorants.map(
    (colorant) => getSpectralCalibrationData(colorant, calibrationConditionId),
  );
  const firstData = spectralCalibrationData.find((data) => !!data);
  if (!firstData) return undefined;
  return (firstData.data as Spectrum).spectralSampling;
};

export const createMeasurement = (
  measurement: Measurement,
  calibrationCondition: CalibrationCondition,
  spectralSampling: SpectralSampling,
  allowLab: boolean,
) => {
  const colorSpectra = measurement.measurementSamples
    .map((sample) => createColorSpectrum(sample, calibrationCondition, spectralSampling, allowLab))
    .filter((sample): sample is CFE.ColorSpectrum => !!sample);
  const result: CFE.Measurement = { colorSpectra };
  if (measurement.backing) result.backing = convertBackingType(measurement.backing);
  if (measurement.surfaceType) result.surface = convertSurfaceType(measurement.surfaceType);
  return result;
};

const createCalibrationData = (
  parameters: CalibrationParameter[],
  calibrationConditionId: string,
): CFE.CalibrationData[] => (
  parameters
    .filter((parameter) => {
      if (!parameter.calibrationConditionId) return true;
      return parameter.calibrationConditionId === calibrationConditionId;
    })
    .map((parameter) => ({
      name: parameter.type,
      values: Array.isArray(parameter.data) ? parameter.data : parameter.data.values,
    }))
);

const determineSubstrateType = (
  calibrationData: CFE.CalibrationData[],
): CFE.SubstrateType => {
  const isTransparent = calibrationData
    .some((data) => (data.name === 'isTransparent' && data.values[0] === 1));
  if (isTransparent) return 'Transparent';

  const isMetallicSurface = calibrationData
    .some((data) => (data.name === 'metalizationFactor' && data.values[0] === 1));
  if (isMetallicSurface) return 'MetallicSurface';

  return 'OpaqueSubstrate';
};

const getRoughnessFromCalibrationData = (
  calibrationData: CFE.CalibrationData[],
): number | undefined => {
  const data = calibrationData.find(({ name }) => name.toLowerCase() === 'roughness');
  if (!data || data.values.length === 0) return undefined;
  return data.values[0];
};

const createSubstrate = (
  substrate: Substrate,
  calibrationCondition: CalibrationCondition,
  spectralSampling: SpectralSampling,
): CFE.Substrate => {
  // find calibration condition of substrate matching either exactly the right engine identifier
  // or at least being for the same engine class

  const engineClass = getCalibrationEngineClass(calibrationCondition);
  const engineClassAndVersion = getCalibrationEngineClassAndVersion(calibrationCondition);

  const substrateCalibrationCondition = substrate.calibrationConditions.find((cond) => (
    cond.engineId === calibrationCondition.engineId
  )) || substrate.calibrationConditions.find(
    (cond) => getCalibrationEngineClassAndVersion(cond) === engineClassAndVersion,
  ) || substrate.calibrationConditions.find(
    (cond) => getCalibrationEngineClass(cond) === engineClass,
  );

  const substrateCalibrationConditionId = substrateCalibrationCondition?.id || 'none';

  const calibrationData = createCalibrationData(
    substrate.calibrationParameters,
    substrateCalibrationConditionId,
  );

  const type = determineSubstrateType(calibrationData);

  const measurements = substrate.measurements.map((measurement) => (
    createMeasurement(measurement, calibrationCondition, spectralSampling, false)
  )).filter(
    (measurement): measurement is CFE.Measurement => !!measurement,
  );

  // fix issue with substrates being uncoated but the measurements saying coated
  const roughness = getRoughnessFromCalibrationData(calibrationData);
  if (type === 'OpaqueSubstrate' && (roughness || 0) > 0) {
    measurements.forEach((measurement) => {
      // eslint-disable-next-line no-param-reassign
      measurement.surface = 'Uncoated';
    });
  }

  return {
    name: substrate.name,
    type,
    measurements,
    calibrationData,
  };
};

const convertColorantType = (type: ColorantType): CFE.ColorantType => {
  switch (type) {
    case ColorantType.Clear:
      return 'Base';
    case ColorantType.AdditionalClear:
      return 'AlternativeBase';
    case ColorantType.White:
      return 'White';
    case ColorantType.Black:
      return 'Black';
    case ColorantType.Colorant:
      return 'Colorant';
    case ColorantType.Disorienter:
      return 'Disorienter';
    case ColorantType.Metallic:
      return 'Metallic';
    case ColorantType.Pearl:
      return 'Pearl';
    case ColorantType.SpecialEffect:
      return 'Special';
    case ColorantType.TechnicalVarnish:
      return 'TechnicalVarnish';
    default:
      throw new Error('Invalid colorant type');
  }
};

const convertCFEColorantType = (type: CFE.ColorantType): ColorantType => {
  switch (type) {
    case 'Base':
      return ColorantType.Clear;
    case 'AlternativeBase':
      return ColorantType.AdditionalClear;
    case 'White':
      return ColorantType.White;
    case 'Black':
      return ColorantType.Black;
    case 'Colorant':
      return ColorantType.Colorant;
    case 'Disorienter':
      return ColorantType.Disorienter;
    case 'Metallic':
      return ColorantType.Metallic;
    case 'Pearl':
      return ColorantType.Pearl;
    case 'Special':
      return ColorantType.SpecialEffect;
    case 'TechnicalVarnish':
      return ColorantType.TechnicalVarnish;
    default:
      throw new Error('Invalid colorant type');
  }
};

const createColorant = (colorant: Colorant, calibrationConditionId: string): CFE.Colorant => ({
  id: colorant.id,
  name: colorant.name,
  type: convertColorantType(colorant.type),
  isLeftover: colorant.isLeftover,
  specificWeight: colorant.specificMass,
  minConcentrationPercentage: colorant.minConcentrationPercentage,
  maxConcentrationPercentage: colorant.maxConcentrationPercentage,
  calibrationData: createCalibrationData(colorant.calibrationParameters, calibrationConditionId),
});

const convertIndustry = (industry: Industry): CFE.IndustryType => {
  switch (industry) {
    case Industry.Textile:
      throw new Error('Unsupported industry');
    case Industry.Effect:
      return 'Effects';

    default:
      return industry;
  }
};

const convertRecipeOutputMode = (recipeOutputMode?: RecipeOutputMode): CFE.RecipeOutputType => {
  switch (recipeOutputMode) {
    case RecipeOutputMode.BasicInksAndSolvent: return 'BasicInksAndSolvent';
    case RecipeOutputMode.BasicMaterial: return 'BasicMaterials';
    default: return 'PrintReadyInks';
  }
};

const convertCombinatorialMode = (combinatorialMode: CombinatorialMode): CFE.CombinationType => {
  switch (combinatorialMode) {
    case CombinatorialMode.FastMatch: return 'FastMatch';
    // TODO: @mrumpxrite to fix these type errors
    // case CombinatorialMode.ColorantGroups: return 'ColorantGroups';
    // case CombinatorialMode.TypeRestricted: return 'TypeRestricted';
    // case CombinatorialMode.ClearWhiteBlackPlusColorants: return 'ClearWhiteBlackPlusColorants';
    default: return 'FullCombinatorial';
  }
};

const convertOtherOpacityMode = (
  opacityMode: OpacityMode,
): Exclude<CFE.OpacitySettingsType, 'None' | 'DeltaEDifference'> => {
  switch (opacityMode) {
    case OpacityMode.Opaque: return 'Opaque';
    case OpacityMode.Transparent: return 'Transparent';
    case OpacityMode.OpacityFixed: return 'Opacity';
    case OpacityMode.OpacityMinimum: return 'Opacity';
    case OpacityMode.ContrastRatioFixed: return 'Contrast';
    case OpacityMode.ContrastRatioMinimum: return 'Contrast';
    default: throw new Error('Incorrect implementation');
  }
};

const convertOpacitySettings = (
  opacityMode: OpacityMode,
  opacityMinPercent: number,
  opacityMaxPercent: number,
): CFE.OpacitySettings => {
  if (opacityMode === OpacityMode.None) {
    return { opacitySettingsType: 'None' };
  }
  if (opacityMode === OpacityMode.OpacityFixed) {
    return {
      opacitySettingsType: 'Opacity',
      minValuePercentage: opacityMinPercent,
      maxValuePercentage: opacityMinPercent,
    };
  }
  if (opacityMode === OpacityMode.OpacityMinimum) {
    return {
      opacitySettingsType: 'Opacity',
      minValuePercentage: opacityMinPercent,
      maxValuePercentage: 100.0,
    };
  }
  if (opacityMode === OpacityMode.ContrastRatioFixed) {
    return {
      opacitySettingsType: 'Contrast',
      minValuePercentage: opacityMinPercent,
      maxValuePercentage: opacityMinPercent,
    };
  }
  if (opacityMode === OpacityMode.ContrastRatioMinimum) {
    return {
      opacitySettingsType: 'Contrast',
      minValuePercentage: opacityMinPercent,
      maxValuePercentage: 100.0,
    };
  }
  return {
    opacitySettingsType: convertOtherOpacityMode(opacityMode),
    minValuePercentage: opacityMinPercent,
    maxValuePercentage: opacityMaxPercent,
  };
};

const createFormulationSettingsIFS = (
  opacityMode: OpacityMode,
  opacityMinPercent: number,
  opacityMaxPercent: number,
  recipeOutputMode: RecipeOutputMode | undefined,
  relativeThicknessMin: number,
  relativeThicknessMax: number,
  totalMode: TotalMode,
): CFE.FormulationSettingsIFS => ({
  opacitySettings: convertOpacitySettings(opacityMode, opacityMinPercent, opacityMaxPercent),
  recipeOutputType: convertRecipeOutputMode(recipeOutputMode),
  totalMode,
  minThickness: relativeThicknessMin,
  maxThickness: relativeThicknessMax,
});

const createFormulationSettingsEFX = (
  opacityMode: OpacityMode,
  opacityMinPercent: number,
  opacityMaxPercent: number,
): CFE.FormulationSettingsEFX => ({
  opacitySettings: convertOpacitySettings(opacityMode, opacityMinPercent, opacityMaxPercent),
  colorVersusOpacity: 1,
});

const createFormulationSettings = (
  engineType: CFE.EngineType,
  opacityMode: OpacityMode,
  opacityMinPercent: number,
  opacityMaxPercent: number,
  recipeOutputMode: RecipeOutputMode | undefined,
  relativeThicknessMin: number,
  relativeThicknessMax: number,
  totalMode: TotalMode,
): CFE.FormulationSettings => (
  isIFSEngine(engineType)
    ? createFormulationSettingsIFS(
      opacityMode,
      opacityMinPercent,
      opacityMaxPercent,
      recipeOutputMode,
      relativeThicknessMin,
      relativeThicknessMax,
      totalMode,
    )
    : createFormulationSettingsEFX(opacityMode, opacityMinPercent, opacityMaxPercent)
);

const createCombinationSettingsIFS = (
  combinatorialMode: CombinatorialMode,
  fixedColorantIds: string[],
  maxNumberOfColorants: number,
) => ({
  combinationType: convertCombinatorialMode(combinatorialMode),
  minNumberOfColorants: 2,
  maxNumberOfColorants,
  maxNumberOfCombinations: 65535,
  fixedColorants: fixedColorantIds.map((id) => ({ id })),
});

const createCombinationSettingsEFX = (
  combinatorialMode: CombinatorialMode,
  fixedColorantIds: string[],
  maxNumberOfColorants: number,
) => ({
  combinationType: convertCombinatorialMode(combinatorialMode),
  minNumberOfColorants: 4,
  maxNumberOfColorants,
  maxNumberOfCombinations: 65535,
  fixedColorants: fixedColorantIds.map((id) => ({ id })),
});

const createCombinationSettings = (
  engineType: CFE.EngineType,
  combinatorialMode: CombinatorialMode,
  fixedColorantIds: string[],
  maxNumberOfColorants: number,
) => (isIFSEngine(engineType)
  ? createCombinationSettingsIFS(
    combinatorialMode,
    fixedColorantIds,
    maxNumberOfColorants === 0 ? IFS_MAX_COLORANTS_COUNT : maxNumberOfColorants,
  )
  : createCombinationSettingsEFX(
    combinatorialMode,
    fixedColorantIds,
    maxNumberOfColorants === 0 ? EFX_MAX_COLORANTS_COUNT : maxNumberOfColorants,
  ));

const getIlluminantWeight = (
  illuminants: {
    illuminant: IlluminantType;
    weight: number;
  }[],
  index: number,
): {
  illuminant: IlluminantType;
  weight: number;
} => ((index < illuminants.length) ? illuminants[index] : {
  illuminant: IlluminantType.D50,
  weight: (index === 0) ? 1.0 : 0.0,
});

const createCFEIlluminants = (
  illuminants: {
    illuminant: IlluminantType;
    weight: number;
  }[],
): [CFE.IlluminantWeight, CFE.IlluminantWeight, CFE.IlluminantWeight] => ([
  convertIlluminantWeight(getIlluminantWeight(illuminants, 0)),
  convertIlluminantWeight(getIlluminantWeight(illuminants, 1)),
  convertIlluminantWeight(getIlluminantWeight(illuminants, 2)),
]);

const createMetricSettingsIFS = (
  colorimetricSettings: {
    illuminants: {
      illuminant: IlluminantType;
      weight: number;
    }[];
    observer: ObserverType;
    deltaE2000Weights: { kl: number, kc: number, kh: number };
  },
): CFE.MetricSettingsIFS => ({
  illuminants: createCFEIlluminants(colorimetricSettings.illuminants),
  observer: convertObserver(colorimetricSettings.observer),
  labComputationType: 'CIELab',
  deltaEFormula: 'DE2000',
  deltaEFormulaParameters: [
    colorimetricSettings.deltaE2000Weights.kl,
    colorimetricSettings.deltaE2000Weights.kc,
    colorimetricSettings.deltaE2000Weights.kh,
  ],
  lchWeights: [
    colorimetricSettings.deltaE2000Weights.kl,
    colorimetricSettings.deltaE2000Weights.kc,
    colorimetricSettings.deltaE2000Weights.kh,
  ],
});

const createMetricSettingsEFX = (
  matchingMode: MetricType,
  colorimetricSettings: {
    illuminants: {
      illuminant: IlluminantType;
      weight: number;
    }[];
    observer: ObserverType;
    deltaE2000Weights: { kl: number, kc: number, kh: number };
  },
): CFE.MetricSettingsEFX => {
  if (matchingMode === MetricType.SpectralShape) {
    return {
      observer: 'TenDeg',
      illuminants: [
        {
          illuminant: 'D65',
          weight: 0.0,
        },
        {
          illuminant: 'A',
          weight: 0.0,
        },
        {
          illuminant: 'F11',
          weight: 0.0,
        },
      ],
      weightShape: 1.0,
      weightSpectral: 0.0,
      weightFlop: 1.0,
      exponentShape: 0.333333,
      exponentSpectral: 0.333333,
    };
  }
  if (matchingMode === MetricType.Spectral) {
    return {
      observer: 'TenDeg',
      illuminants: [
        {
          illuminant: 'D65',
          weight: 0.0,
        },
        {
          illuminant: 'A',
          weight: 0.0,
        },
        {
          illuminant: 'F11',
          weight: 0.0,
        },
      ],
      weightShape: 0.0,
      weightSpectral: 1.0,
      weightFlop: 0.0,
      exponentShape: 0.333333,
      exponentSpectral: 0.333333,
    };
  }
  return {
    observer: 'TenDeg',
    illuminants: createCFEIlluminants(colorimetricSettings.illuminants),
    lchWeights: [
      colorimetricSettings.deltaE2000Weights.kl,
      colorimetricSettings.deltaE2000Weights.kc,
      colorimetricSettings.deltaE2000Weights.kh,
    ],
  };
};

const createMetricSettings = (
  engineType: CFE.EngineType,
  metricType: MetricType,
  colorimetricSettings: {
    illuminants: {
      illuminant: IlluminantType;
      weight: number;
    }[];
    observer: ObserverType;
    deltaE2000Weights: { kl: number, kc: number, kh: number };
  },
): CFE.MetricSettings => (
  isIFSEngine(engineType)
    ? createMetricSettingsIFS(colorimetricSettings)
    : createMetricSettingsEFX(metricType, colorimetricSettings)
);

const createFormulationTargetSample = (
  engineType: CFE.EngineType,
  name: string,
  measurements: CFE.Measurement[],
  substrate: CFE.Substrate,
  relativeThickness: number,
  viscosity?: number,
) => {
  const sample: CFE.FormulationInputSample = {
    name,
    substrate,
    measurements,
    relativeThickness,
  };
  if (isIFSEngine(engineType)) {
    sample.formula = {
      viscosity,
      components: [],
    };
  }
  return sample;
};

const createCorrectionTrialSample = (
  engineType: CFE.EngineType,
  name: string,
  measurements: CFE.Measurement[],
  substrate: CFE.Substrate,
  relativeThickness: number,
  formula: Formula,
  viscosity?: number,
): CFE.TrialSample => {
  const components = formula.formulaLayers[0].formulaComponents
    .map((component) => ({
      colorantId: component.colorant.id,
      massAmount: component.massAmount,
    }));
  if (isIFSEngine(engineType)) {
    return {
      name,
      substrate,
      measurements,
      relativeThickness,
      formula: { components, viscosity },
    };
  }
  return {
    name,
    substrate,
    measurements,
    relativeThickness,
    formula: { components },
  };
};

export const createFormulationInput = (
  parameters: CFE.FormulationParameters,
): CFE.FormulationInput => {
  const {
    assortment,
    colorants: inputColorants,
    calibrationCondition,
    standard: targetSampleIn,
  } = parameters;
  if (inputColorants.length === 0) throw new Error('No colorants supplied');
  const spectralSampling = getSpectralSamplingFromColorants(
    parameters.colorants,
    calibrationCondition.id,
  );
  if (!spectralSampling) {
    throw new Error('Cannot find spectral calibration data for engine');
  }

  const [engineClass, , engineModel] = calibrationCondition.engineId.split('-');
  const engineType = getEngineType(calibrationCondition.engineId);
  const substrate = createSubstrate(
    parameters.substrate,
    calibrationCondition,
    spectralSampling,
  );

  const availableColorants = inputColorants
    .map((colorant) => createColorant(colorant, calibrationCondition.id));

  const formulationSettings = createFormulationSettings(
    engineType,
    parameters.opacityMode,
    parameters.opacityMinPercent,
    parameters.opacityMaxPercent,
    parameters.recipeOutputMode,
    parameters.relativeThicknessMin,
    parameters.relativeThicknessMax,
    parameters.totalMode,
  );
  const combinationSettings = createCombinationSettings(
    engineType,
    parameters.combinatorialMode,
    parameters.fixedColorantIds,
    parameters.maxNumberOfColorants,
  );
  const metricSettings = createMetricSettings(
    engineType,
    parameters.metricType,
    parameters.colorimetricSettings,
  );

  const targetMeasurements = targetSampleIn.measurements.map((measurement) => {
    return createMeasurement(measurement, calibrationCondition, spectralSampling, true);
  }).filter((measurement): measurement is CFE.Measurement => !!measurement);

  const targetSample = createFormulationTargetSample(
    engineType,
    targetSampleIn.name,
    targetMeasurements,
    substrate,
    parameters.relativeThicknessMin,
    parameters.viscosity,
  );

  const assortmentCalibrationData = createCalibrationData(
    assortment.calibrationParameters, calibrationCondition.id,
  );

  if (engineClass === 'IFS') {
    if (!assortmentCalibrationData.some(({ name }) => name.toLowerCase() === 'roughness')) {
      assortmentCalibrationData.push({
        name: 'roughness',
        values: [0],
      });
    }

    const mathModel = getIFSMathModelFromEngineModel(engineModel);
    if (!assortmentCalibrationData.some(({ name }) => name.toLowerCase() === 'mathmodel') && mathModel) {
      assortmentCalibrationData.push({
        name: 'mathModel',
        values: [mathModel],
      });
    }
  }

  return {
    industryType: convertIndustry(assortment.industry),
    ...assortment.subIndustry && { industrySubtype: assortment.subIndustry },
    computationType: 'LookupTable',
    assortment: {
      availableColorants,
      substrate,
      calibrationData: assortmentCalibrationData,
    },
    targetSample,
    substrate,
    combinationSettings,
    formulationSettings,
    metricSettings,
    colorantConstraints: [],
    maxResults: isIFSEngine(engineType) ? 35 : 10,
  };
};

const createCorrectionSettings = ({
  engineType,
  recipeOutputMode,
  correctionMode,
  minAddPercentage = 0,
  maxAddPercentage = 100,
  correctionPenalty,
  allowRemoveColorantsForCorrection = false,
  resinRestrictionType = 'None',
  colorOnlyCorrectionMode = 'Off',
  totalMode,
  selectedColorantIds,
}: {
  engineType: CFE.EngineType;
  recipeOutputMode?: RecipeOutputMode;
  correctionMode: CFE.CorrectionMode;
  minAddPercentage?: number;
  maxAddPercentage?: number;
  correctionPenalty?: number;
  allowRemoveColorantsForCorrection?: boolean;
  resinRestrictionType?: CFE.ResinRestrictionType;
  colorOnlyCorrectionMode?: CFE.ColorOnlyCorrectionMode;
  totalMode: TotalMode;
  selectedColorantIds: string[];
}): CFE.CorrectionSettings => {
  const correctionModeSettings = correctionMode === 'New'
    ? { correctionMode }
    : {
      correctionMode,
      minAddPercentage,
      maxAddPercentage,
    };

  const selectedColorants = selectedColorantIds.map((id) => ({
    id,
  }));

  if (isIFSEngine(engineType)) {
    return {
      recipeOutputType: convertRecipeOutputMode(recipeOutputMode),
      totalMode,
      correctionPenalty,
      allowRemoveColorantsForCorrection,
      selectedColorants,
      ...correctionModeSettings,
    };
  }

  return {
    resinRestrictionType,
    colorOnlyCorrectionMode,
    selectedColorants,
    ...correctionModeSettings,
  };
};

export const createCorrectionInput = (
  parameters: CFE.CorrectionParameters,
): CFE.CorrectionInput => {
  const {
    assortment,
    colorants: inputColorants,
    calibrationCondition,
    standard: targetSampleIn,
    trialSample: trial,
    selectedColorantIds,
  } = parameters;
  if (inputColorants.length === 0) throw new Error('No colorants supplied');
  const spectralSampling = getSpectralSamplingFromColorants(
    parameters.colorants,
    calibrationCondition.id,
  );
  if (!spectralSampling) {
    throw new Error('Cannot find spectral calibration data for engine');
  }

  const engineType = getEngineType(calibrationCondition.engineId);
  const substrate = createSubstrate(
    parameters.substrate,
    calibrationCondition,
    spectralSampling,
  );

  const availableColorants = inputColorants
    .map((colorant) => createColorant(colorant, calibrationCondition.id));

  const correctionSettings = createCorrectionSettings({
    engineType,
    recipeOutputMode: parameters.recipeOutputMode,
    correctionMode: parameters.correctionMode,
    minAddPercentage: parameters.minAddPercentage,
    maxAddPercentage: parameters.maxAddPercentage,
    correctionPenalty: parameters.correctionPenalty,
    allowRemoveColorantsForCorrection: parameters.allowRemoveColorantsForCorrection,
    resinRestrictionType: parameters.resinRestrictionType,
    colorOnlyCorrectionMode: parameters.colorOnlyCorrectionMode,
    totalMode: parameters.totalMode,
    selectedColorantIds,
  });
  const metricSettings = createMetricSettings(
    engineType,
    parameters.metricType,
    parameters.colorimetricSettings,
  );

  const createMeasurements = (measurements: Measurement[]) => measurements
    .map((measurement) => createMeasurement(
      measurement, calibrationCondition, spectralSampling, true,
    ));

  const targetMeasurements = createMeasurements(targetSampleIn.measurements);
  const targetSample = createFormulationTargetSample(
    engineType,
    targetSampleIn.name,
    targetMeasurements,
    substrate,
    parameters.relativeThicknessMin,
    parameters.viscosity,
  );

  const trialMeasurements = createMeasurements(trial.measurements);
  const trialSample = createCorrectionTrialSample(
    engineType,
    trial.name,
    trialMeasurements,
    substrate,
    parameters.formula.formulaLayers[0].relativeThickness,
    parameters.formula,
    parameters.viscosity,
  );

  return {
    industryType: convertIndustry(assortment.industry),
    ...assortment.subIndustry && { industrySubtype: assortment.subIndustry },
    computationType: 'LookupTable',
    assortment: {
      availableColorants,
      substrate,
      calibrationData: createCalibrationData(
        assortment.calibrationParameters, calibrationCondition.id,
      ),
    },
    targetSample,
    trialSample,
    metricSettings,
    correctionSettings,
    colorantConstraints: [],
  };
};

export const createPredictionInput = (
  parameters: CFE.PredictionParameters,
): CFE.PredictionInput => {
  const {
    assortment,
    colorants: inputColorants,
    calibrationCondition,
    formula,
    substrate: inputSubstrate,
  } = parameters;
  if (inputColorants.length === 0) throw new Error('No colorants supplied');
  const spectralSampling = getSpectralSamplingFromColorants(
    inputColorants,
    calibrationCondition.id,
  );
  if (!spectralSampling) {
    throw new Error('Cannot find spectral calibration data for engine');
  }

  const [engineClass, , engineModel] = calibrationCondition.engineId.split('-');
  const substrate = createSubstrate(
    inputSubstrate,
    calibrationCondition,
    spectralSampling,
  );

  const availableColorants = inputColorants
    .filter(({ id }) => formula.formulaLayers.some(
      (layer) => layer.formulaComponents.some(
        (comp) => comp.colorant.id === id,
      ),
    ))
    .map((colorant) => createColorant(colorant, calibrationCondition.id));

  const assortmentCalibrationData = createCalibrationData(
    assortment.calibrationParameters, calibrationCondition.id,
  );

  if (engineClass === 'IFS') {
    if (!assortmentCalibrationData.some(({ name }) => name.toLowerCase() === 'roughness')) {
      assortmentCalibrationData.push({
        name: 'roughness',
        values: [0],
      });
    }

    const mathModel = getIFSMathModelFromEngineModel(engineModel);
    if (!assortmentCalibrationData.some(({ name }) => name.toLowerCase() === 'mathmodel') && mathModel) {
      assortmentCalibrationData.push({
        name: 'mathModel',
        values: [mathModel],
      });
    }
  }

  const {
    relativeThickness,
    viscosity,
    formulaComponents,
  } = formula.formulaLayers[0];

  const predicitionFormula = {
    viscosity: viscosity || 0,
    components: formulaComponents.map((component) => {
      return {
        colorantId: component.colorant.id,
        massAmount: component.massAmount,
      };
    }),
  };

  const predicitionSample: CFE.TrialSampleNoMeasurement = {
    name: 'pred',
    relativeThickness,
    substrate,
    formula: predicitionFormula,
  };

  const predictionAssortment: CFE.Assortment = {
    availableColorants,
    substrate,
    calibrationData: assortmentCalibrationData,
  };

  return {
    industryType: convertIndustry(assortment.industry),
    industrySubtype: assortment.subIndustry,
    assortment: predictionAssortment,
    sample: {
      ...predicitionSample,
      formula: predicitionFormula,
    },
  };
};

export const createCalibrationInput = (
  parameters: CFE.CalibrationParameters,
): CFE.CalibrationInput => {
  const {
    assortment,
    colorants: inputColorants,
    calibrationCondition,
    formula,
    measurements,
  } = parameters;

  const spectralSampling = measurements[0]
    ?.measurementSamples[0]
    ?.colorSpecification
    ?.spectralSampling;

  if (!spectralSampling) throw Error('No spectral measurement');

  const engineType = getEngineType(calibrationCondition.engineId);
  const substrate = createSubstrate(
    parameters.substrate,
    calibrationCondition,
    spectralSampling,
  );

  const availableColorants = inputColorants
    ?.map((colorant) => createColorant(colorant, calibrationCondition.id)) ?? [];

  const createMeasurements = (cfdmMeasurements: Measurement[]) => cfdmMeasurements
    .map((measurement) => createMeasurement(
      measurement, calibrationCondition, spectralSampling, true,
    ));

  const formulaMeasurements = createMeasurements(measurements);
  const formulaSample = createCorrectionTrialSample(
    engineType,
    'letdown',
    formulaMeasurements,
    substrate,
    formula.formulaLayers[0].relativeThickness,
    formula,
    formula.formulaLayers[0].viscosity,
  );

  const assortmentCalibrationData = createCalibrationData(
    assortment.calibrationParameters, calibrationCondition.id,
  );

  return {
    industryType: convertIndustry(assortment.industry),
    ...assortment.subIndustry && { industrySubtype: assortment.subIndustry },
    assortment: {
      availableColorants: [],
      substrate,
      calibrationData: assortmentCalibrationData,
    },
    letdowns: [formulaSample],
    inputColorants: availableColorants,
  };
};

// type validation

const isLab = (lab: Unvalidated<CFE.LAB>): lab is CFE.LAB => Boolean(
  lab
  && isUnionType(lab.illuminant, CFE.illuminantTypes)
  && isUnionType(lab.observer, CFE.observerTypes)
  && isArray(lab.values, isNumber) && lab.values.length === 3,
);

const isResultColorSpectrum = (
  spectrum: Unvalidated<CFE.ColorSpectrum>,
): spectrum is CFE.ColorSpectrum => Boolean(
  spectrum
  && spectrum.spectralRange
  && isNumber(spectrum.spectralRange.startWavelength)
  && isNumber(spectrum.spectralRange.endWavelength)
  && isNumber(spectrum.spectralRange.wavelengthInterval)
  && isUnionType(spectrum.geometry, CFE.geometries)
  && isArray(spectrum.spectralValues, isNumber)
  && (!spectrum.lab || isLab(spectrum.lab)),
);

const isCalibrationData = (
  calibrationData: Unvalidated<CFE.CalibrationData>,
): calibrationData is CFE.CalibrationData => Boolean(
  calibrationData
  && typeof calibrationData.name === 'string'
  && isArray(calibrationData.values, isNumber),
);

export const isResultMeasurement = (
  measurement: Unvalidated<CFE.ResultMeasurement>,
): measurement is CFE.ResultMeasurement => Boolean(
  measurement
  && isArray(measurement.colorSpectra, isResultColorSpectrum),
);

export const isColorant = (
  colorant: Unvalidated<CFE.Colorant>,
): colorant is CFE.Colorant => Boolean(
  colorant
  && isArray(colorant.calibrationData, isCalibrationData),
);

const isFormulaComponent = (
  component: Unvalidated<CFE.FormulaComponent>,
): component is CFE.FormulaComponent => Boolean(
  component
  && isString(component.colorantId)
  && isNumber(component.massAmount),
);

const isFormula = (
  formula: Unvalidated<CFE.Formula>,
): formula is CFE.Formula => Boolean(
  formula
  && isArray(formula.components, isFormulaComponent),
);

const isResultSample = (
  sample: Unvalidated<CFE.FormulationResultSample>,
): sample is CFE.FormulationResultSample => Boolean(
  sample
  && isString(sample.name)
  && isNumber(sample.relativeThickness)
  && isArray(sample.measurements, isResultMeasurement)
  && isFormula(sample.formula),
);

const isFormulationResult = (
  result: Unvalidated<CFE.FormulationResult>,
): result is CFE.FormulationResult => Boolean(
  result
  && isResultSample(result.sample)
  && isNumber(result.score),
);

export const isFormulationResults = (results: unknown): results is CFE.FormulationResults => (
  isArray(results, isFormulationResult)
);

export const isPredictionResults = (results: unknown): results is CFE.PredictionResults => (
  isArray(results, isResultMeasurement)
);

export const isCalibrationResults = (results: unknown): results is CFE.CalibrationResults => (
  isArray(results, isColorant)
);

// data conversion

const getMeasurementCondition = (
  geometry: CFE.Geometry,
  calibrationCondition: CalibrationCondition,
): MeasurementCondition => {
  const measurementCondition = calibrationCondition.measurementConditions
    .find((condition) => geometry === getGeometryName(condition.geometry));
  if (!measurementCondition) throw new Error('Matching MeasurementCondition not found');
  return measurementCondition;
};

const createFormulaLayerFromCFEFormula = (
  relativeThickness: number,
  formula: CFE.Formula,
  colorants: Colorant[],
  calibrationConditionId: string,
  assortment: Assortment,
  totalMode: TotalMode,
  additionFormula?: FormulaLayer,
  canSize?: number,
  canUnit?: RecipeUnit,
): FormulaLayer => {
  const formulaComponents = formula.components.map((component) => ({
    colorant: { id: component.colorantId },
    massAmount: component.massAmount,
  } as FormulaComponent));
  if (additionFormula) {
    additionFormula.formulaComponents.forEach((component) => {
      const existingComponent = formulaComponents.find(
        ({ colorant }) => colorant.id === component.colorant.id,
      );
      if (existingComponent) {
        existingComponent.massAmount += component.massAmount;
      } else {
        formulaComponents.push({
          colorant: { id: component.colorant.id },
          massAmount: component.massAmount,
        });
      }
    });
  } else if (canSize && canUnit) {
    const sums = computeCanSizeFromComponents(
      formulaComponents,
      formula.viscosity ?? 0,
      colorants,
      calibrationConditionId,
      totalMode,
      assortment?.solvent,
    );
    const averageDensity = sums.massSum / sums.volumeSum;
    const canSizeDefaultGravi = convertRecipeUnit(
      canSize,
      canUnit,
      defaultGravimetricUnit,
      averageDensity,
    );
    const multiplier = canSizeDefaultGravi / sums.massSum;
    formulaComponents.forEach((component: FormulaComponent) => {
      // eslint-disable-next-line no-param-reassign
      component.massAmount *= multiplier;
    });
  }
  return new FormulaLayer({
    formulaComponents,
    relativeThickness,
    viscosity: formula.viscosity,
  });
};

const createMeasurementSampleFromResult = (
  spectrum: CFE.ResultColorSpectrum,
  calibrationCondition: CalibrationCondition,
) => ({
  measurementCondition: getMeasurementCondition(spectrum.geometry, calibrationCondition),
  colorSpecification: {
    spectralSampling: {
      startWavelength: spectrum.spectralRange.startWavelength,
      endWavelength: spectrum.spectralRange.endWavelength,
      wavelengthInterval: spectrum.spectralRange.wavelengthInterval,
    },
  },
  data: {
    data: spectrum.spectralValues,
  },
});

const createMeasurementFromResult = (
  measurement: CFE.ResultMeasurement,
  calibrationCondition: CalibrationCondition,
) => ({
  id: uuid(),
  backing: convertBackingTypeToDomainModel(measurement.backing),
  surfaceType: convertSurfaceTypeToDomainModel(measurement.surface),
  measurementSamples: measurement.colorSpectra.map(
    (spectrum) => createMeasurementSampleFromResult(spectrum, calibrationCondition),
  ),
});

const createAppearanceSampleFromFormulationResult = ({
  sample,
  name,
  assortmentId,
  standardId,
  parentAppearanceSampleId,
  substrateId,
  calibrationCondition,
  colorants,
  additionFormula,
  formulationSettings,
  assortment,
  totalMode,
  canSize,
  canUnit,
}: {
  sample: CFE.FormulationResultSample;
  name: string;
  assortmentId: string;
  standardId: string;
  parentAppearanceSampleId?: string;
  substrateId: string;
  calibrationCondition: CalibrationCondition;
  colorants: Colorant[],
  assortment: Assortment,
  totalMode: TotalMode,
  recipeOutputMode?: RecipeOutputMode,
  additionFormula?: Formula,
  canSize?: number,
  canUnit?: RecipeUnit,
  formulationSettings: Record<string, unknown>,
}) => AppearanceSample.parse({
  id: uuid(), // use ID from CFE once it is available
  creationDateTime: (new Date()).toISOString(),
  name,
  formula: {
    id: uuid(),
    assortmentId,
    formulationSettings,
    predictionMeasurements: sample.measurements.map(
      (measurement) => createMeasurementFromResult(measurement, calibrationCondition),
    ),
    formulaLayers: [
      createFormulaLayerFromCFEFormula(
        sample.relativeThickness,
        sample.formula,
        colorants,
        calibrationCondition.id,
        assortment,
        totalMode,
        additionFormula?.formulaLayers?.[0],
        canSize,
        canUnit,
      ),
      ...(
        sample.midcoatFormula
          ? [createFormulaLayerFromCFEFormula(
            sample.relativeThickness,
            sample.midcoatFormula,
            colorants,
            calibrationCondition.id,
            assortment,
            totalMode,
            additionFormula?.formulaLayers?.[1],
            canSize,
            canUnit,
          )]
          : []
      ),
    ],
  },
  standardId,
  substrateId,
  parentAppearanceSampleId,
});

export const convertFormulationResultsToAppearanceSamples = ({
  results,
  name,
  ...params
}: {
  results: CFE.FormulationResults;
  name: string;
  assortmentId: string;
  standardId: string;
  parentAppearanceSampleId?: string;
  substrateId: string;
  calibrationCondition: CalibrationCondition;
  colorants: Colorant[],
  assortment: Assortment,
  formulationSettings: Record<string, unknown>,
  totalMode: TotalMode,
  additionFormula?: Formula,
  canSize?: number,
  canUnit?: RecipeUnit,
}) => results.map(({ sample, score }, index) => ({
  sample: createAppearanceSampleFromFormulationResult({ sample, name: `${name} ${index + 1}`, ...params }),
  score,
}));

export const convertPredictionResultsToAppearanceSamples = ({
  results,
  calibrationCondition,
}: {
  results: CFE.PredictionResults;
  calibrationCondition: CalibrationCondition;
}) => results.map(
  (measurement) => Measurement.parse(
    createMeasurementFromResult(measurement, calibrationCondition),
  ),
);

const convertCalibrationArray = (name: string, values: number[]): Spectrum | NumberArray => {
  // TODO: do a proper implementation
  if (values.length === 31) {
    return new Spectrum({
      id: uuid(),
      spectralSampling: new SpectralSampling({
        startWavelength: 400,
        endWavelength: 700,
        wavelengthInterval: 10,
      }),
      values,
    });
  }

  if (values.length === 36) {
    return new Spectrum({
      id: uuid(),
      spectralSampling: new SpectralSampling({
        startWavelength: 380,
        endWavelength: 730,
        wavelengthInterval: 10,
      }),
      values,
    });
  }

  return new NumberArray({ values });
};

export const convertCalibrationResultsToColorants = ({
  calibrationResults,
  calibrationCondition,
}: {
  calibrationResults: CFE.CalibrationResults,
  calibrationCondition: CalibrationCondition;
}) => calibrationResults.map((colorant) => new Colorant({
  id: uuid(),
  name: colorant.name,
  specificMass: colorant.specificWeight,
  type: convertCFEColorantType(colorant.type),
  isLeftover: colorant.isLeftover,
  minConcentrationPercentage: colorant.minConcentrationPercentage,
  maxConcentrationPercentage: colorant.maxConcentrationPercentage,
  calibrationParameters: colorant.calibrationData.map((parameterData) => ({
    type: parameterData.name,
    calibrationConditionId: calibrationCondition.id,
    data: convertCalibrationArray(parameterData.name, parameterData.values),
  })),
}));
