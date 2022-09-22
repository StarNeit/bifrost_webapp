/* eslint-disable @typescript-eslint/no-unused-vars */
/*
  Disabling max-len rule.
  Variable and function names are quite long in this file due to complex logic.
  This leads to many cases of lines past 100 characters, where breaking into multiple lines
  would hurt readability.
*/
/* eslint-disable max-len */

import { useEffect, useState } from 'react';
import {
  getColorimetrySDK,
  SDK,
  GeometryName,
  Spectrum as ColorimetrySpectrum,
  RGB,
  Lab,
  XYZ,
} from '@xrite/colorimetry-js';
import { Vector3D } from '@xrite/cloud-formulation-domain-model/utils/vector';
import {
  IlluminantType,
  ObserverType,
  MeasurementSample,
  Measurement,
  Geometry,
  IlluminationGeometryType,
  ColorSpaceType,
  DirectionalGeometryDescription,
  Spectrum,
  CalibrationParameter,
  Colorant,
  NumberArray, UVFilter,
} from '@xrite/cloud-formulation-domain-model';
import * as PredefinedMeasurementConditions
  from '@xrite/cloud-formulation-domain-model/measurement/PredefinedMeasurementConditions';
import { isCompatibleMeasurementCondition } from './utilsMeasurement';
import { MeasurementAvailableCondition } from '../types/formulation';

let sdk: SDK;

export function useColorimetry(): { isLoaded: boolean } {
  const [isLoaded, setIsLoaded] = useState(false);

  async function onMount() {
    sdk = await getColorimetrySDK();
    setIsLoaded(true);
  }

  useEffect(() => {
    onMount();
  }, []);

  return { isLoaded };
}

const isSampleUniform = (sample: MeasurementSample): boolean => (sample.data.extentPixels.width * sample.data.extentPixels.height) === 1;

const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;

// const degreesToRadians = (degrees: number) => (degrees / 180) * Math.PI;

const REQUIRED_ANGULAR_ACCURACY = 0.1;

const isAngleApproximate = (angle: number, reference: number) => {
  return Math.abs(angle - reference) < REQUIRED_ANGULAR_ACCURACY;
};

const isDirectionDegrees = ([, , z]: Vector3D, thetaReferenceDegrees: number) => {
  const thetaDegrees = radiansToDegrees(Math.acos(z));
  return isAngleApproximate(thetaDegrees, thetaReferenceDegrees);
};

export const getThetaAspecularCoordinates = (
  illuminationVector: Vector3D,
  detectionVector: Vector3D,
): [number, number, number] => {
  /* Theta-aspecular notation:
      theta = theta angle of light direction
      aspecular = view direction angle difference to light reflection direction
      azimuth = rotation of view direction around reflection direction
    */
  const angles = DirectionalGeometryDescription.fromCarthesian(illuminationVector, detectionVector);
  return [angles.illuminationAngle, angles.aspecular, angles.azimuthal ? angles.azimuthal : 0.0];
};

const getMultiAngleGeometryNameFromAngles = (
  [elevation, aspecular, azimuth]: number[],
): GeometryName | undefined => {
  if (isAngleApproximate(elevation, 45)) {
    if (isAngleApproximate(azimuth, 0)) {
      if (isAngleApproximate(aspecular, -15)) return '45asMinus15';
      if (isAngleApproximate(aspecular, 15)) return '45as15';
      if (isAngleApproximate(aspecular, 25)) return '45as25';
      if (isAngleApproximate(aspecular, 45)) return '45as45';
      if (isAngleApproximate(aspecular, 75)) return '45as75';
      if (isAngleApproximate(aspecular, 110)) return '45as110';
    }
    if (isAngleApproximate(aspecular, 60) && isAngleApproximate(azimuth, -125.3)) return '45as60azMinus125.3';
    if (isAngleApproximate(aspecular, 60) && isAngleApproximate(azimuth, 125.3)) return '45as60az125.3';
    if (isAngleApproximate(aspecular, 25) && isAngleApproximate(azimuth, -90)) return '45as25azMinus90';
    if (isAngleApproximate(aspecular, 25) && isAngleApproximate(azimuth, 90)) return '45as25az90';
  }
  if (isAngleApproximate(elevation, 15)) {
    if (isAngleApproximate(azimuth, 0)) {
      if (isAngleApproximate(aspecular, -45)) return '15asMinus45';
      if (isAngleApproximate(aspecular, -15)) return '15asMinus15';
      if (isAngleApproximate(aspecular, 15)) return '15as15';
      if (isAngleApproximate(aspecular, 45)) return '15as45';
      if (isAngleApproximate(aspecular, 80)) return '15as80';
    }
    if (isAngleApproximate(aspecular, 46.9) && isAngleApproximate(azimuth, -104.5)) return '15as46.9azMinus104.5';
    if (isAngleApproximate(aspecular, 46.9) && isAngleApproximate(azimuth, 104.5)) return '15as46.9az104.5';
    if (isAngleApproximate(aspecular, 38.3) && isAngleApproximate(azimuth, -43)) return '15as38.3azMinus43';
    if (isAngleApproximate(aspecular, 38.3) && isAngleApproximate(azimuth, 43)) return '15as38.3az43';
  }
  return undefined;
};

export const getGeometryName = (geometry: Geometry): GeometryName | undefined => {
  switch (geometry.illuminationGeometryType) {
    case IlluminationGeometryType.Circumferential: {
      const is450 = isDirectionDegrees(geometry.illuminationParameter, 45)
        || isDirectionDegrees(geometry.detectorParameter, 0);
      if (is450) return '45_0';
      break;
    }

    case IlluminationGeometryType.DiffuseSCI: {
      if (isDirectionDegrees(geometry.detectorParameter, 8)) return 'SphereSpecularIncluded';
      break;
    }

    case IlluminationGeometryType.DiffuseSCE: {
      if (isDirectionDegrees(geometry.detectorParameter, 8)) return 'SphereSpecularExluded';
      break;
    }

    case IlluminationGeometryType.Directional:
    case IlluminationGeometryType.Point: {
      const anglesStandard = getThetaAspecularCoordinates(
        geometry.illuminationParameter, geometry.detectorParameter,
      );
      const anglesStandardGeometryName = getMultiAngleGeometryNameFromAngles(anglesStandard);
      if (anglesStandardGeometryName) return anglesStandardGeometryName;

      const anglesReverse = getThetaAspecularCoordinates(
        geometry.detectorParameter, geometry.illuminationParameter,
      );
      const anglesReverseGeometryName = getMultiAngleGeometryNameFromAngles(anglesReverse);
      if (anglesReverseGeometryName) return anglesReverseGeometryName;
      break;
    }

    default:
      break;
  }

  return undefined;
};

const convertMeasurementSampleToSpectrum = (sample: MeasurementSample): ColorimetrySpectrum => {
  if (!sample.colorSpecification.spectralSampling) {
    throw new Error('Missing spectral sampling');
  }

  const geometryName = getGeometryName(sample.measurementCondition.geometry);
  if (!isSampleUniform(sample)) {
    throw new Error('Invalid pixel count');
  }

  if (!geometryName) {
    throw new Error('Unsupported geometry');
  }

  return {
    values: sample.data.data,
    geometry: sdk.geometryFromString(geometryName),
    start: sample.colorSpecification.spectralSampling.startWavelength,
    end: sample.colorSpecification.spectralSampling.endWavelength,
    interval: sample.colorSpecification.spectralSampling.wavelengthInterval,
  };
};

// const getIlluminant = (illuminantType: Exclude<IlluminantType, IlluminantType.E>) => {
const getIlluminant = (illuminantType: IlluminantType) => {
  if (illuminantType === IlluminantType.E) {
    throw new Error('Unsupported IlluminantType');
  }

  const illuminantMap: Record<IlluminantType, number> = {
    A: sdk.ILLUMINANT_A,
    C: sdk.ILLUMINANT_C,
    D50: sdk.ILLUMINANT_D50,
    D55: sdk.ILLUMINANT_D55,
    D65: sdk.ILLUMINANT_D65,
    D75: sdk.ILLUMINANT_D75,
    E: -1,
    FL1: sdk.ILLUMINANT_F1,
    FL2: sdk.ILLUMINANT_F2,
    FL3: sdk.ILLUMINANT_F3,
    FL4: sdk.ILLUMINANT_F4,
    FL5: sdk.ILLUMINANT_F5,
    FL6: sdk.ILLUMINANT_F6,
    FL7: sdk.ILLUMINANT_F7,
    FL8: sdk.ILLUMINANT_F8,
    FL9: sdk.ILLUMINANT_F9,
    FL10: sdk.ILLUMINANT_F10,
    FL11: sdk.ILLUMINANT_F11,
    FL12: sdk.ILLUMINANT_F12,
  };
  return illuminantMap[illuminantType];
};

const getObserver = (observerType: ObserverType) => {
  const observerMap: Record<ObserverType, number> = {
    2: sdk.OBSERVER_2_DEGREES,
    10: sdk.OBSERVER_10_DEGREES,
  };
  return observerMap[observerType];
};

const convertMeasurementSampleToLab = (sample: MeasurementSample) => {
  if (
    sample.colorSpecification.colorSpace !== ColorSpaceType.CIELab
    || !sample.colorSpecification.illuminant
    || !sample.colorSpecification.observer
  ) {
    throw new Error('Not an Lab value');
  }

  if (!isSampleUniform(sample)) {
    throw new Error('Invalid pixel count');
  }

  return {
    lab: sample.data.data as Lab,
    illuminant: getIlluminant(sample.colorSpecification.illuminant),
    observer: getObserver(sample.colorSpecification.observer),
  };
};

const convertMeasurementSampleToRGB = (sample: MeasurementSample) => {
  if (
    sample.colorSpecification.colorSpace !== ColorSpaceType.RGB
    || !sample.colorSpecification.illuminant
    || !sample.colorSpecification.observer
    || !sample.colorSpecification.rgbPrimaries
  ) {
    throw new Error('Not an RGB value');
  }

  if (!isSampleUniform(sample)) {
    throw new Error('Invalid pixel count');
  }

  return {
    rgb: sample.data.data as RGB,
    rgbPrimaries: sample.colorSpecification.rgbPrimaries,
    illuminant: getIlluminant(sample.colorSpecification.illuminant),
    observer: getObserver(sample.colorSpecification.observer),
  };
};

// XYZ conversion not implemented yet. Disabling rule to allow this function.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const convertMeasurementSampleToXYZ = (sample: MeasurementSample) => {
  if (
    sample.colorSpecification.colorSpace !== ColorSpaceType.XYZ
    || !sample.colorSpecification.illuminant
    || !sample.colorSpecification.observer
  ) {
    throw new Error('Not an XYZ value');
  }

  if (!isSampleUniform(sample)) {
    throw new Error('Invalid pixel count');
  }

  return {
    XYZ: sample.data.data as XYZ,
    illuminant: getIlluminant(sample.colorSpecification.illuminant),
    observer: getObserver(sample.colorSpecification.observer),
  };
};

export const isMeasurementSampleSupported = (sample: MeasurementSample): boolean => {
  if (!isSampleUniform(sample)) {
    return false;
  }

  const geometryName = getGeometryName(sample.measurementCondition.geometry);
  if (!geometryName) {
    return false;
  }

  return true;
};

const convertMeasurementToSpectrums = (measurement: Measurement) => measurement.measurementSamples
  .filter(isMeasurementSampleSupported)
  .map(convertMeasurementSampleToSpectrum);

export const calculatePreviewRGB = (sample: MeasurementSample): RGB => {
  const rgbIlluminant = sdk.ILLUMINANT_D65;
  const rgbObserver = sdk.OBSERVER_2_DEGREES;

  if (sample.colorSpecification.spectralSampling) {
    const spectrum = convertMeasurementSampleToSpectrum(sample);
    const lab = sdk.spectrumToLab(spectrum, rgbIlluminant, rgbObserver);
    return sdk.labToRGB(lab, rgbIlluminant, rgbObserver);
  }

  if (sample.colorSpecification?.colorSpace === ColorSpaceType.CIELab) {
    const { lab, illuminant, observer } = convertMeasurementSampleToLab(sample);
    return sdk.labToRGB(
      lab,
      illuminant,
      observer,
    );
  }

  if (sample.colorSpecification?.colorSpace === ColorSpaceType.XYZ) {
    // to be implemented
    // const { XYZ, illuminant, observer} = convertMeasurementSampleToXYZ(sample);
    throw new Error('XYZ not supported');
  }

  if (sample.colorSpecification?.colorSpace === ColorSpaceType.RGB) {
    const { rgb: [r, g, b] } = convertMeasurementSampleToRGB(sample);
    // TODO: add color space conversion
    return [Math.sqrt(r), Math.sqrt(g), Math.sqrt(b)] as RGB;
  }
  // throw new Error('Unknown color specification');
  // Todo: this returns random color until it is fixed
  const c = Math.floor(Math.random() * 256);
  return [c, c, c] as RGB;
};

export const calculateLab = (
  sample: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
): Lab => {
  if (sample.colorSpecification?.spectralSampling) {
    const spectrum = convertMeasurementSampleToSpectrum(sample);
    const illuminant = getIlluminant(illuminantType);
    const observer = getObserver(observerType);
    return sdk.spectrumToLab(spectrum, illuminant, observer);
  }

  if (
    sample.colorSpecification.illuminant !== illuminantType
    || sample.colorSpecification.observer !== observerType
  ) {
    throw new Error('Invalid illuminant or observer');
  }

  if (sample.colorSpecification.colorSpace === ColorSpaceType.CIELab) {
    return sample.data.data as Lab;
  }

  if (sample.colorSpecification.colorSpace === ColorSpaceType.XYZ) {
    // const { XYZ, illuminant, observer} = convertMeasurementSampleToXYZ(sample);
    throw new Error('XYZ not supported');
  }

  if (sample.colorSpecification.colorSpace === ColorSpaceType.RGB) {
    // const { rgb, rgbPrimaries illuminant, observer} = convertMeasurementSampleToRGB(sample);
    throw new Error('RGB not supported');
  }

  throw new Error('Unknown color specification');
};

export const calculateLabCh = (
  sample: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
): { lab: Lab, C: number, h: number } => {
  const lab = calculateLab(sample, illuminantType, observerType);
  const lch = sdk.labToLCh(lab);
  return {
    lab,
    C: lch[1],
    h: lch[2],
  };
};

const getCommonLabValuesSpectral = (
  sample1: MeasurementSample,
  sample2: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
) => ({
  lab1: calculateLab(sample1, illuminantType, observerType),
  lab2: calculateLab(sample2, illuminantType, observerType),
  illuminantType,
  observerType,
});

const getCommonLabValuesSpectralAndLab = (
  sample1: MeasurementSample,
  sample2: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
) => ({
  lab1: calculateLab(sample1, illuminantType, observerType),
  lab2: convertMeasurementSampleToLab(sample2).lab,
  illuminantType,
  observerType,
});

const getCommonLabValuesLabAndSpectral = (
  sample1: MeasurementSample,
  sample2: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
) => ({
  lab1: convertMeasurementSampleToLab(sample1).lab,
  lab2: calculateLab(sample2, illuminantType, observerType),
  illuminantType,
  observerType,
});

export const getCommonLabValuesFromMeasurementSamples = (
  sample1: MeasurementSample,
  sample2: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
): {
  lab1: Lab;
  lab2: Lab;
  illuminantType: IlluminantType,
  observerType: ObserverType,
} => {
  const hasSpectralValues1 = !!sample1.colorSpecification?.spectralSampling;
  const hasSpectralValues2 = !!sample2.colorSpecification?.spectralSampling;

  // both spectral
  if (hasSpectralValues1 && hasSpectralValues2) {
    return getCommonLabValuesSpectral(sample1, sample2, illuminantType, observerType);
  }

  // only first one is spectral
  if (hasSpectralValues1 && sample2.colorSpecification?.illuminant && sample2.colorSpecification?.observer) {
    return getCommonLabValuesSpectralAndLab(
      sample1,
      sample2,
      sample2.colorSpecification.illuminant,
      sample2.colorSpecification.observer,
    );
  }

  // only second one is spectral
  if (sample1.colorSpecification?.illuminant && sample1.colorSpecification?.observer && hasSpectralValues2) {
    return getCommonLabValuesLabAndSpectral(
      sample1,
      sample2,
      sample1.colorSpecification.illuminant,
      sample1.colorSpecification.observer,
    );
  }

  // neither one is spectral, both have the same illuminant and observer
  if (
    sample1.colorSpecification?.illuminant
    && sample1.colorSpecification?.observer
    && sample1.colorSpecification?.illuminant === sample2?.colorSpecification?.illuminant
    && sample1.colorSpecification?.observer === sample2?.colorSpecification?.observer
  ) {
    return {
      lab1: convertMeasurementSampleToLab(sample1).lab,
      lab2: convertMeasurementSampleToLab(sample2).lab,
      illuminantType: sample1.colorSpecification.illuminant,
      observerType: sample1.colorSpecification.observer,
    };
  }

  throw new Error('Unsupported sample data');
};

export const deltaE2000 = (
  target: MeasurementSample,
  sample: MeasurementSample,
  illuminant: IlluminantType,
  observer: ObserverType,
  parameters: { kc: number; kh: number; kl: number; },
): number => {
  const { lab1, lab2 } = getCommonLabValuesFromMeasurementSamples(target, sample, illuminant, observer);
  return sdk.deltaE2000(
    lab1,
    lab2,
    parameters.kl,
    parameters.kc,
    parameters.kh,
  );
};

export const deltaE76 = (
  target: MeasurementSample,
  sample: MeasurementSample,
  illuminant: IlluminantType,
  observer: ObserverType,
): number => {
  const { lab1, lab2 } = getCommonLabValuesFromMeasurementSamples(target, sample, illuminant, observer);
  return sdk.deltaE76(
    lab1,
    lab2,
  );
};

export const getDeltaH = (deltaa: number, deltab: number, deltaC: number): number => {
  const squareDiff = (deltaa * deltaa) + (deltab * deltab) + -(deltaC * deltaC);

  if (squareDiff < 0) return 0;

  return Math.sqrt(squareDiff);
};

export const getLabchValues = (
  sample: MeasurementSample,
  target: MeasurementSample,
  illuminantType: IlluminantType,
  observerType: ObserverType,
): {
  l: number;
  a: number;
  b: number;
  C: number;
  h: number;
  dL: number;
  dA: number;
  dB: number;
  dC: number;
  dH: number;
} => {
  const { lab1, lab2 } = getCommonLabValuesFromMeasurementSamples(sample, target, illuminantType, observerType);
  const LCh1 = sdk.labToLCh(lab1);
  const LCh2 = sdk.labToLCh(lab2);
  const dL = lab1[0] - lab2[0];
  const dA = lab1[1] - lab2[1];
  const dB = lab1[2] - lab2[2];
  const dC = LCh1[1] - LCh2[1];
  const dH = getDeltaH(dA, dB, dC);

  return {
    l: lab1[0], a: lab1[1], b: lab1[2], C: LCh1[1], h: LCh1[2], dL, dA, dB, dC, dH,
  };
};

export const getAverageColorDifference = (
  target: Measurement,
  trial: Measurement,
  differenceFunction: (targetSample: MeasurementSample, trialSample: MeasurementSample) => number,
) => {
  const differencePerGeometry = target.measurementSamples.map(
    (targetSample) => {
      const trialSample = trial.measurementSamples.find(
        (sample) => isCompatibleMeasurementCondition(
          targetSample.measurementCondition,
          sample.measurementCondition,
        ),
      );
      if (!trialSample) return -1;
      return differenceFunction(targetSample, trialSample);
    },
  );
  const validDifferences = differencePerGeometry.filter((x) => (x >= 0));
  if (validDifferences.length === 0) return 0;
  const sumDE = validDifferences.reduce((sum, value) => sum + value, 0);
  return sumDE / validDifferences.length;
};

export const getAverageDeltaE76 = (
  target: Measurement,
  trial: Measurement,
  illuminant: IlluminantType,
  observer: ObserverType,
): number => {
  const de76 = (
    targetSample: MeasurementSample,
    trialSample: MeasurementSample,
  ) => deltaE76(targetSample, trialSample, illuminant, observer);
  return getAverageColorDifference(
    target,
    trial,
    de76,
  );
};

export const getAverageDeltaE2000 = (
  target: Measurement,
  trial: Measurement,
  illuminant: IlluminantType,
  observer: ObserverType,
  parameters: { kc: number; kh: number; kl: number; },
): number => {
  const de2000 = (
    targetSample: MeasurementSample,
    trialSample: MeasurementSample,
  ) => deltaE2000(targetSample, trialSample, illuminant, observer, parameters);
  return getAverageColorDifference(
    target,
    trial,
    de2000,
  );
};

export const getShapeMetric = (target: Measurement, trial: Measurement): number => {
  const targetSpectra = convertMeasurementToSpectrums(target);
  const trialSpectra = convertMeasurementToSpectrums(trial);

  return 100 * sdk.shape(targetSpectra, trialSpectra);
};

const getFlopIndex = (
  sample: Measurement,
  illuminantType: IlluminantType,
  observerType: ObserverType,
) => {
  const spectra = convertMeasurementToSpectrums(sample);
  const illuminant = getIlluminant(illuminantType);
  const observer = getObserver(observerType);
  return sdk.flopIndex(spectra, illuminant, observer);
};

export const getFlopIndexDifference = (
  target: Measurement,
  sample: Measurement,
  illuminantType: IlluminantType,
  observerType: ObserverType,
): number => {
  const targetFlopIndex = getFlopIndex(target, illuminantType, observerType);
  const sampleFlopIndex = getFlopIndex(sample, illuminantType, observerType);
  return targetFlopIndex - sampleFlopIndex;
};

const KM_EPSILON = 1e-6;
const kmReflectanceInfiniteThickness = (K: number, S: number): number => {
  if (S < KM_EPSILON) {
    // special case from Chapter 5: glaze coating
    return 0;
  }
  const a = 1 + (K / S);
  return a - Math.sqrt((a * a) - 1);
};
const kmReflectanceFiniteThickness = (
  K: number,
  S: number,
  albedoBack: number,
  thickness: number,
): number => {
  if (S < KM_EPSILON) {
    // special case from Chapter 5: glaze coating
    return albedoBack * Math.exp(-2 * thickness * K);
  }
  const rX = S * thickness;
  const Hdash = albedoBack;
  if (K < KM_EPSILON) {
    // special case from Chapter 4: ideal white paint
    const term = (1 - Hdash) * rX;
    return (term + Hdash) / (term + 1);
  }
  const Hinf = kmReflectanceInfiniteThickness(K, S);
  const invHinf = 1 / Hinf;
  const Hdiff = Hdash - Hinf;
  const termExp = (Hdash - invHinf) * Math.exp(rX * (invHinf - Hinf));
  const nom = (invHinf * Hdiff) - (Hinf * termExp);
  const denom = Hdiff - termExp;
  return nom / denom;
};

const COLORANT_PREVIEW_CONCENTRATION = 0.5;

function isSpectrum(obj: Spectrum | NumberArray): obj is Spectrum {
  if ('spectralSampling' in obj) return !!obj.spectralSampling;
  return false;
}

function doesParameterConditionMatch(
  parameter: CalibrationParameter,
  calibrationConditionId: string,
): boolean {
  // return parameter.calibrationConditionId ? (parameter.calibrationConditionId === calibrationConditionId) : true;
  return true;
}

const isParameterK = (parameter: CalibrationParameter): boolean => (parameter.type === 'K' || parameter.type === 'k' || parameter.type === 'K-45as45');

const isParameterS = (parameter: CalibrationParameter): boolean => (parameter.type === 'S' || parameter.type === 's' || parameter.type === 'S-45as45');

const getCalibrationSpectrum = (colorant: Colorant, acceptanceFunc: (arg: CalibrationParameter) => boolean): Spectrum | undefined => {
  const calibrationParameter = colorant.calibrationParameters
    .find((param) => acceptanceFunc(param));
  if (!calibrationParameter) return undefined;
  const calibData = calibrationParameter.data;
  if (isSpectrum(calibData)) return calibData;
  return undefined;
};

export const getPreviewRGBForColorant = (colorant: Colorant, calibrationConditionId: string): RGB => {
  const K = getCalibrationSpectrum(colorant, (param: CalibrationParameter) => (isParameterK(param) && doesParameterConditionMatch(param, calibrationConditionId)));
  const S = getCalibrationSpectrum(colorant, (param: CalibrationParameter) => (isParameterS(param) && doesParameterConditionMatch(param, calibrationConditionId)));
  if (K && S) {
    const concentration = COLORANT_PREVIEW_CONCENTRATION * ((colorant.maxConcentrationPercentage ?? 100) / 100.0);
    const reflectance: number[] = [];
    for (let i = 0; i < K.values.length; i += 1) {
      reflectance[i] = kmReflectanceFiniteThickness(
        concentration * 2 * K.values[i],
        concentration * S.values[i],
        1, 1,
      );
    }

    const spectrum: ColorimetrySpectrum = {
      values: reflectance,
      geometry: sdk.GEOMETRY_45_0,
      start: K.spectralSampling.startWavelength,
      end: K.spectralSampling.endWavelength,
      interval: K.spectralSampling.wavelengthInterval,
    };
    const lab = sdk.spectrumToLab(spectrum, sdk.ILLUMINANT_D65, sdk.OBSERVER_2_DEGREES);
    const rgb = sdk.labToRGB(lab, sdk.ILLUMINANT_D65, sdk.OBSERVER_2_DEGREES);
    return rgb;
  }
  return [127, 127, 127] as RGB;
};

export const getNewMeasurementCondition = (condition: MeasurementAvailableCondition) => {
  switch (condition) {
    case 'M0':
      return PredefinedMeasurementConditions.D45_0_M0();
    case 'M1':
      return PredefinedMeasurementConditions.D45_0_M1();
    case 'M2':
      return PredefinedMeasurementConditions.D45_0_M2();
    case 'M3':
      return PredefinedMeasurementConditions.D45_0_M3();
    case 'D8spin':
      return PredefinedMeasurementConditions.D8_SCI(UVFilter.none);
    case 'D8spex':
      return PredefinedMeasurementConditions.D8_SCE(UVFilter.none);
    default:
      return PredefinedMeasurementConditions.D45_0_M0();
  }
};
