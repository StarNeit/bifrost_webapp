/* eslint-disable @typescript-eslint/no-explicit-any */
import round from 'lodash/round';
import { useSelector } from 'react-redux';
import { useCallback, useRef, useState } from 'react';
import { RGB } from '@xrite/colorimetry-js';
import {
  Measurement,
  MeasurementSample,
  SpectralSampling,
  CalibrationCondition,
  Colorant,
  CalibrationParameter,
} from '@xrite/cloud-formulation-domain-model';
import ColorantType from '@xrite/cloud-formulation-domain-model/ColorantType';
import { v4 as uuid } from 'uuid';
import debounce from 'lodash/debounce';

import { getGeometryName } from './colorimetry';
import { ViewingCondition } from '../types/layout';
import { RecipeOutputMode } from '../types/recipe';
import { OpacityMode } from '../types/formulation';

export const filterTruthy = <T>(list: (T | undefined)[]): T[] => list.filter(
  (value: T | undefined): value is T => Boolean(value),
);

export function getCSSColorString([r, g, b]: RGB): string {
  return `rgb(${r},${g},${b})`;
}

// todo: add format from date-fns after cleaning up the data
export function getDateDisplayString(value?: Date, includeTime = false): string {
  if (!value || value.getFullYear() === 1000) return '-'; // dummy date from CFDB?
  return includeTime
    ? value.toLocaleString()
    : value.toLocaleDateString();
}

export function linspace(start: number, interval: number, end: number): number[] {
  const result = [] as number[];
  let x = start;
  while (x < end + 1e-10) {
    result.push(x);
    x += interval;
  }
  return result;
}

export function getAllWavelengths(sampling: SpectralSampling): number[] {
  return linspace(sampling.startWavelength, sampling.wavelengthInterval, sampling.endWavelength);
}

export function kSReflectanceValue(value: number): number {
  const K = (1 - value) ** 2;
  const S = 2 * value;
  return K / S;
}

function closestIndex(values: number[], searchValue: number): number {
  return values.reduce(
    (prev, curr, currentIndex) => {
      return (Math.abs(curr - searchValue)
        < Math.abs(values[prev] - searchValue) ? currentIndex : prev);
    },
    0,
  );
}

export function getCalibrationEngineClass(
  calibration?: CalibrationCondition,
): string {
  if (!calibration) return '';
  // * Format: "<engineType>-<version>[-<mathModel>]".
  // * E.g "EFX-1.6.1", "IFS-6.5", "IFS-6.5-Roughness"
  const [type/* , version , mathModel */] = calibration.engineId.split('-');
  return type.toUpperCase();
}

export function getCalibrationEngineClassAndVersion(
  calibration?: CalibrationCondition,
): string {
  if (!calibration) return '';
  // * Format: "<engineType>-<version>[-<mathModel>]".
  // * E.g "EFX-1.6.1", "IFS-6.5", "IFS-6.5-Roughness"
  const [type, version/* , mathModel */] = calibration.engineId.split('-');
  // const [major, minor] = version.split('.');
  return `${type.toUpperCase()}-${version}`;
}

export function resampleSpectrum(
  spectrum: number[],
  spectrumSampling: SpectralSampling,
  targetSampling: SpectralSampling,
): number[] {
  const inputWLs = getAllWavelengths(spectrumSampling);
  const outputWLs = getAllWavelengths(targetSampling);
  // TODO: this implementation is stupid, make a better one including interpolation
  return outputWLs.map((wavelength) => {
    const srcIndex = closestIndex(inputWLs, wavelength);
    return spectrum[srcIndex];
  });
}

export function getSpectraWithCommonSampling(
  spectrum1: number[],
  sampling1: SpectralSampling,
  spectrum2: number[],
  sampling2: SpectralSampling,
): {
  spectrum1: number[],
  spectrum2: number[],
  sampling: SpectralSampling,
} {
  const startWavelength = Math.max(sampling1.startWavelength, sampling2.startWavelength);
  const endWavelength = Math.min(sampling1.endWavelength, sampling2.endWavelength);
  const wavelengthInterval = Math.min(sampling1.wavelengthInterval, sampling2.wavelengthInterval);
  const sampling = SpectralSampling.parse({
    startWavelength,
    endWavelength,
    wavelengthInterval,
  });

  const spectrum1Out = resampleSpectrum(spectrum1, sampling1, sampling);
  const spectrum2Out = resampleSpectrum(spectrum2, sampling2, sampling);

  return {
    spectrum1: spectrum1Out,
    spectrum2: spectrum2Out,
    sampling,
  };
}

export function createCalibrationCondition(measurement: Measurement): CalibrationCondition {
  return new CalibrationCondition({
    id: uuid(),
    engineId: '',
    measurementConditions: measurement.measurementSamples
      .map((sample) => sample.measurementCondition),
  });
}

export function transformReflectanceToKOverS(spectrum: number[]): number[] {
  return spectrum.map((value) => {
    return kSReflectanceValue(value);
  });
}

export function computeDeltaReflectance(
  standardSpectrum: number[],
  standardSampling: SpectralSampling,
  trialSpectrum: number[],
  trialSampling: SpectralSampling,
): {
  spectrum: number[],
  sampling: SpectralSampling,
} {
  const common = getSpectraWithCommonSampling(
    standardSpectrum,
    standardSampling,
    trialSpectrum,
    trialSampling,
  );

  const spectrum = common.spectrum1.map((s1, index) => s1 - common.spectrum2[index]);

  return {
    spectrum,
    sampling: common.sampling,
  };
}

export const isMeasurementMultiAngle = (
  measurement: Measurement,
): boolean => measurement.measurementSamples.some(
  (sample) => getGeometryName(sample.measurementCondition.geometry) === '45as45',
);

type SpectralData = {
  name: string;
  spectralValues: number[];
  sampling: SpectralSampling;
};

export const transformToKS = (input?: SpectralData): SpectralData | undefined => input && {
  ...input,
  spectralValues: transformReflectanceToKOverS(input.spectralValues),
};

export function toSpectralData(sample: MeasurementSample, name: string): SpectralData | undefined {
  const sampling = sample.colorSpecification.spectralSampling;
  const extent = sample.data.extentPixels;
  if (!sampling || (extent.width * extent.height !== 1)) return undefined;
  return {
    name,
    spectralValues: sample.data.data,
    sampling,
  };
}

export const isRecipeOutputMode = (outputMode?: unknown): outputMode is RecipeOutputMode => {
  if (!outputMode) return false;
  return (typeof outputMode === 'number') && (outputMode >= 1 && outputMode <= 3);
};

export const isOpacityMode = (opacityMode?: unknown): opacityMode is OpacityMode => {
  if (!opacityMode) return false;
  return (typeof opacityMode === 'number') && (opacityMode >= 1 && opacityMode <= 8);
};

export function isColorantAClear(colorant: {type: ColorantType}): boolean {
  return ((colorant.type === ColorantType.Clear)
    || (colorant.type === ColorantType.AdditionalClear));
}

export function isColorantATechnicalVarnish(colorant: {type: ColorantType}): boolean {
  return (colorant.type === ColorantType.TechnicalVarnish);
}

export function hasColorantBasicMaterials(colorant: Colorant): boolean {
  return (colorant.components.length > 0);
}

export function getCalibrationParameterValue(
  { calibrationParameters }: { calibrationParameters: CalibrationParameter[] },
  calibrationConditionId: string,
  name: string,
): number[] | undefined {
  const parameter = calibrationParameters.find(
    (param) => (
      ((param.calibrationConditionId === calibrationConditionId) || !param.calibrationConditionId)
      && param.type === name
    ),
  );
  return parameter?.data?.values;
}

export function getCalibrationParameterScalarValue(
  { calibrationParameters }: { calibrationParameters: CalibrationParameter[] },
  calibrationConditionId: string,
  name: string,
): number | undefined {
  const values = getCalibrationParameterValue(
    { calibrationParameters },
    calibrationConditionId,
    name,
  );
  return values?.[0];
}

export const getViewingConditionLabel = (
  viewingCondition: ViewingCondition,
) => `${viewingCondition.illuminant}-${viewingCondition.observer}`;

/** Hook similar to useState. Allows partial updates. */
export function useStateObject<S extends Record<string, unknown>>(initialState: S | (() => S)) {
  const [data, setData] = useState<S>(initialState);
  const updateData = useCallback((update: Partial<S>) => setData({ ...data, ...update }), [data]);
  return [data, updateData] as const;
}

export const getCurrencySymbol = (currencyCode: string | undefined) => {
  switch (currencyCode) {
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case undefined:
      return '';
    default:
      return currencyCode;
  }
};

/**
 * Create a lodash debounced callback. The invoked function is always the one passed as a parameter.
 */
export function useDebouncedCallback<TFunction extends(...args: any[]) => any>(
  callback: TFunction, wait: number) {
  const callbackRef = useRef<TFunction>(callback);
  callbackRef.current = callback;
  return useCallback(
    debounce(
      (...args: Parameters<TFunction>): ReturnType<TFunction> => callbackRef.current(...args),
      wait,
    ),
    [],
  );
}

type Numerical = string | number;
type Nullish = null | undefined;
type Transform<T> = (x: number) => T;

export function useDefaultPrecision() {
  const precision = useSelector((state) => state.common.defaultRealNumbersPrecision);
  const toString = (x: Numerical) => (Number.isNaN(Number(x))
    ? String(x)
    : Number(x).toFixed(precision));
  const toNumber = (x: Numerical) => parseFloat(toString(x));
  // it's noop, an identity function
  const id = (x: any) => x;
  function defaultRound<T extends Numerical | Nullish>(value: T): number;
  function defaultRound<T extends Numerical | Nullish, U>(value: T, transform: Transform<U>): U;
  function defaultRound<T extends Numerical | Nullish, U>(
    value: T,
    transform: Transform<U> = id,
  ): T | U {
    if (value === undefined || value === null) return value;
    return transform(round(toNumber(value), precision));
  }
  return { round: defaultRound, toString, toNumber };
}
