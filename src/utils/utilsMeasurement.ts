import {
  Geometry,
  Measurement,
  MeasurementSample,
  Transformation,
  Illumination,
  IlluminationLightType,
  MeasurementCondition,
  PolarizationFilterType,
  UVFilter,
  CalibrationCondition,
  BackingType,
  ColorSpaceType,
} from '@xrite/cloud-formulation-domain-model';
import { DescribedMeasurementCondition, SamplesDataForCondition } from '../types/measurement';
import { getGeometryName } from './colorimetry';

export const getMeasurementConditionDescription = (condition: MeasurementCondition): string => {
  const geomName = (getGeometryName(condition.geometry) || '').replace('Minus', '-');
  if (geomName === 'SphereSpecularIncluded') return 'D8spin';
  if (geomName === 'SphereSpecularExluded') return 'D8spex';
  if (geomName === '45_0') {
    if ((condition.illumination.illuminationLight === IlluminationLightType.A)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.none)
      && (condition.illumination.uvFilter === UVFilter.none)) return 'M0';
    if ((condition.illumination.illuminationLight === IlluminationLightType.D50)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.none)
      && (condition.illumination.uvFilter === UVFilter.none)) return 'M1';
    if ((condition.illumination.illuminationLight === IlluminationLightType.A)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.none)
      && (condition.illumination.uvFilter === UVFilter.uv420)) return 'M2';
    if ((condition.illumination.illuminationLight === IlluminationLightType.A)
      && (condition.illumination.polarizationFilter === PolarizationFilterType.polarized)
      && (condition.illumination.uvFilter === UVFilter.none)) return 'M3';
  }
  if (condition.description) return condition.description;
  return geomName;
};

export function getAllSamplesFromMeasurements(
  measurements: Measurement[] | undefined,
  noOverBlack = true,
): MeasurementSample[] {
  if (!measurements) {
    return [] as MeasurementSample[];
  }
  return measurements.reduce(
    (acc: MeasurementSample[], measurement: Measurement): MeasurementSample[] => {
      if (noOverBlack && measurement.backing === BackingType.Black) {
        return acc;
      }
      return [...acc, ...measurement.measurementSamples];
    },
    [] as MeasurementSample[],
  );
}

export const getPreviewMeasurement = (
  measurements?: Measurement[],
): Measurement|undefined => {
  if (!measurements) return undefined;
  if (measurements.length === 0) return undefined;

  // for now only avoid measurement over black backing and show the one for white backing
  // if backing is not specified then use this (this normally means over white)
  return measurements.find((measurement) => (
    !measurement.backing || (measurement.backing !== BackingType.Black)
  )) || measurements[0];
};

export function isCompatibleMeasurementGeometry(geometry1: Geometry, geometry2: Geometry): boolean {
  // TODO: improve
  return getGeometryName(geometry1) === getGeometryName(geometry2);
}

export function isCompatibleMeasurementIllumination(
  illumination1: Illumination,
  illumination2: Illumination,
): boolean {
  // TODO: improve
  return (illumination1.polarizationFilter === illumination2.polarizationFilter)
    && (illumination1.uvFilter === illumination2.uvFilter)
    && (illumination1.illuminationLight === illumination2.illuminationLight);
}

export function isCompatibleMeasurementTransform(
  transform1?: Transformation,
  transform2?: Transformation,
): boolean {
  if (!transform1 && !transform2) return true;
  if (!transform1 || !transform2) return false;
  return transform1.transformType === transform2.transformType;
}

export function isCompatibleMeasurementCondition(
  condition1: MeasurementCondition,
  condition2: MeasurementCondition,
): boolean {
  return isCompatibleMeasurementGeometry(condition1.geometry, condition2.geometry)
    && isCompatibleMeasurementIllumination(condition1.illumination, condition2.illumination)
    && isCompatibleMeasurementTransform(condition1.transformation, condition2.transformation);
}

export function isCompatibleWithCondition(
  { measurements }: { measurements: Measurement[] },
  calibrationCondition: CalibrationCondition,
): boolean {
  const mappedMeasurements = measurements.map(
    (measurement) => measurement.measurementSamples.filter(
      (sample) => calibrationCondition.measurementConditions.some(
        (cond) => isCompatibleMeasurementCondition(sample.measurementCondition, cond),
      ),
    ),
  );
  return mappedMeasurements.some((goodSamples) => (goodSamples.length > 0));
}

export function getSampleForCondition(
  samples: MeasurementSample[],
  condition: MeasurementCondition,
): MeasurementSample | undefined {
  return samples.find(
    (sample) => isCompatibleMeasurementCondition(sample.measurementCondition, condition),
  );
}

export function isColorimetricMeasurementSample(
  sample: MeasurementSample,
): boolean {
  const { colorSpecification } = sample;
  return Boolean(
    colorSpecification
    && colorSpecification.illuminant
    && colorSpecification.observer
    && colorSpecification.colorSpace === ColorSpaceType.CIELab,
  );
}

export function isColorimetricMeasurement(
  measurement: Measurement,
): boolean {
  const sample = measurement.measurementSamples[0];
  return sample
    ? isColorimetricMeasurementSample(sample)
    : false;
}

export function getSampleForConditionFromMeasurements(
  measurements: Measurement[] | undefined,
  condition: MeasurementCondition,
): MeasurementSample | undefined {
  return getSampleForCondition(getAllSamplesFromMeasurements(measurements), condition);
}

// todo: Martin, you can do the logic for getting the default measurement sample here
export const deriveDefaultSampleFromSamples = (
  measurementSamples: MeasurementSample[],
): MeasurementSample => {
  const defaultMeasurementSample = measurementSamples[0];
  return defaultMeasurementSample;
};

export function assembleMeasurementSamplesByConditionSingle(
  standardMeasurements: Measurement[] | undefined,
  sampleMeasurements: Measurement[],
): SamplesDataForCondition[] {
  // retrieve list of possible measurement conditions from the standards measurements
  const standardMeasurementSamples = getAllSamplesFromMeasurements(
    standardMeasurements,
  );

  const measurementConditions = standardMeasurementSamples
    .reduce((acc: DescribedMeasurementCondition[],
      sample: MeasurementSample): DescribedMeasurementCondition[] => {
      const condition = sample.measurementCondition;
      if (!condition) return acc;
      const description = getMeasurementConditionDescription(condition);
      return [...acc, { description, condition }];
    }, [] as DescribedMeasurementCondition[]);

  // now cycle through the measurement conditions
  // and collect standard and samples measurement samples
  // that are compatible with the respective condition
  return measurementConditions.reduce(
    (acc: SamplesDataForCondition[], namedCondition): SamplesDataForCondition[] => {
      const standardMeasurementSample = getSampleForCondition(
        standardMeasurementSamples,
        namedCondition.condition,
      );
      if (!standardMeasurementSample) return acc;
      const samplesMeasurementSample = getSampleForConditionFromMeasurements(
        sampleMeasurements,
        namedCondition.condition,
      );
      if (!samplesMeasurementSample) return acc;
      const dataForCond = {
        condition: namedCondition,
        standardMeasurementSample,
        samplesMeasurementSamples: [samplesMeasurementSample],
      };
      return [...acc, dataForCond];
    },
    [] as SamplesDataForCondition[],
  );
}
