//--------------------------------------------------------------------------------
// dmsDataConverter
//--------------------------------------------------------------------------------
/**
 * Converts DMS data to domain model data.
 */

import { v4 } from 'uuid';
import { fromDate } from '@xrite/cloud-formulation-domain-model/Timestamp';
import * as PredefinedMeasurementConditions from '@xrite/cloud-formulation-domain-model/measurement/PredefinedMeasurementConditions';

import {
  ColorSpecification,
  DataCube,
  Instrument,
  Measurement,
  MeasurementCondition,
  MeasurementSample,
  SpectralSampling,
  Transformation,
  TransformType,
} from '@xrite/cloud-formulation-domain-model';

import {
  DmsColorValue,
  DmsColorValues,
  DmsDevice,
  DmsImageValue,
  DmsMeasurement,
  DmsMeasurementData,
  DmsSpectral,
} from '../types/dms';

//----------------------------------------------------------
// validateDefined
//----------------------------------------------------------
/**
 * Throws an exception if the given value is null or undefined.
 */
const validateDefined = (value: unknown, valueName: string) => {
  if (!value) {
    throw new Error(`[dmsDataConverter] ${valueName} is not defined`);
  }
};

//----------------------------------------------------------
// convertDmsTimestampToDateTime
//----------------------------------------------------------
/**
 * Converts a DMS timestamp (seconds since 1970-01-01) to
 * a domain model timestamp (ISO data/time string).
 */
const convertDmsTimestampToDateTime = (dmsTimestamp: number, dmsTimestampName: string) => {
  validateDefined(dmsTimestamp, dmsTimestampName);

  const date = new Date(dmsTimestamp * 1000);
  return fromDate(date);
};

//----------------------------------------------------------
// convertDmsDeviceToInstrument
//----------------------------------------------------------
/**
 * Converts a DMS device to an instrument. Note that there
 * is no "manufacturer" property in the DMS device type.
 */
const convertDmsDeviceToInstrument = (dmsDevice: DmsDevice, dmsDeviceName: string): Instrument => {
  validateDefined(dmsDevice, dmsDeviceName);
  validateDefined(dmsDevice.type, `${dmsDeviceName}.type`);
  validateDefined(dmsDevice.serialNumber, `${dmsDeviceName}.serialNumber`);

  return Instrument.parse({
    manufacturer: 'X-Rite', // Currently all supported devices are from X-Rite
    model: dmsDevice.type,
    serialNumber: dmsDevice.serialNumber,
    firmwareVersion: dmsDevice.firmwareVersion,
  });
};

//----------------------------------------------------------
// convertBase64toNumber
//----------------------------------------------------------
/**
 * Converts a Base64 formatted string to the corresponding
 * array of numbers.
 */
const convertBase64toNumber = (base64String: string, base64StringName: string): number[] => {
  validateDefined(base64String, base64StringName);

  const byteArray = atob(base64String);
  const length = byteArray.length / Float32Array.BYTES_PER_ELEMENT;
  const dataView = new DataView(new ArrayBuffer(Float32Array.BYTES_PER_ELEMENT));
  const numberArray = new Array(length);

  for (let i = 0; i < length; i += 1) {
    const index = i * 4;

    dataView.setUint8(0, byteArray.charCodeAt(index));
    dataView.setUint8(1, byteArray.charCodeAt(index + 1));
    dataView.setUint8(2, byteArray.charCodeAt(index + 2));
    dataView.setUint8(3, byteArray.charCodeAt(index + 3));

    numberArray[i] = dataView.getFloat32(0, true);
  }

  return numberArray;
};

//----------------------------------------------------------
// convertDms450GeometryToMeasurementCondition
//----------------------------------------------------------
/**
 * Converts a DMS 45/0 geometry to a measurement condition.
 */
const convertDms450GeometryToMeasurementCondition = (
  dmsColorValue: DmsColorValue, dmsColorValueName: string,
): MeasurementCondition => {
  switch (dmsColorValue.illumination) {
    case 'A':
      if (dmsColorValue.filter === 'polarized') {
        return PredefinedMeasurementConditions.D45_0_M3();
      }
      return PredefinedMeasurementConditions.D45_0_M0();
    case 'M2':
      return PredefinedMeasurementConditions.D45_0_M2();
    case 'D50':
      return PredefinedMeasurementConditions.D45_0_M1();
    case 'M3':
      if (dmsColorValue.filter === 'polarized') {
        return PredefinedMeasurementConditions.D45_0_M3();
      }
      throw new Error(`[dmsDataConverter] Unknown DMS 45/0 illumination-filter combination ('${dmsColorValue.illumination}', '${dmsColorValue.filter}') in ${dmsColorValueName}`);
    default:
      throw new Error(`[dmsDataConverter] Unknown DMS 45/0 illumination '${dmsColorValue.illumination}' in ${dmsColorValueName}.illumination`);
  }
};

//----------------------------------------------------------
// convertDmsMAGeometryToMeasurementCondition
//----------------------------------------------------------
/**
 * Converts a DMS multi-angle geometry to a measurement condition.
 */
const convertDmsMAGeometryToMeasurementCondition = (
  dmsGeometry: string, dmsGeometryName: string,
): MeasurementCondition => {
  validateDefined(dmsGeometry, dmsGeometryName);

  const geometry = dmsGeometry.startsWith('r') ? dmsGeometry.substring(1) : dmsGeometry;

  switch (geometry) {
    case '45as-15':
      return PredefinedMeasurementConditions.MA45asMinus15;
    case '45as0':
      return PredefinedMeasurementConditions.MA45as0;
    case '45as15':
      return PredefinedMeasurementConditions.MA45as15;
    case '45as25':
      return PredefinedMeasurementConditions.MA45as25;
    case '45as45':
      return PredefinedMeasurementConditions.MA45as45;
    case '45as75':
      return PredefinedMeasurementConditions.MA45as75;
    case '45as110':
      return PredefinedMeasurementConditions.MA45as110;
    case '15as-45':
      return PredefinedMeasurementConditions.MA15asMinus45;
    case '15as-30':
      return PredefinedMeasurementConditions.MA15asMinus30;
    case '15as-15':
      return PredefinedMeasurementConditions.MA15asMinus15;
    case '15as-5':
      return PredefinedMeasurementConditions.MA15asMinus5;
    case '15as15':
      return PredefinedMeasurementConditions.MA15as15;
    case '15as45':
      return PredefinedMeasurementConditions.MA15as45;
    case '15as80':
      return PredefinedMeasurementConditions.MA15as80;
    case '45as25az90':
      return PredefinedMeasurementConditions.MA45as25az90;
    case '45as25az-90':
      return PredefinedMeasurementConditions.MA45as25azMinus90;
    case '45as60az125.3':
      return PredefinedMeasurementConditions.MA45as60az125_3;
    case '45as60az-125.3':
      return PredefinedMeasurementConditions.MA45as60azMinus125_3;
    case '15as38.3az-43':
      return PredefinedMeasurementConditions.MA15as38_3azMinus43;
    case '15as38.3az43':
      return PredefinedMeasurementConditions.MA15as38_3az43;
    case '15as46.9az104.5':
      return PredefinedMeasurementConditions.MA15as46_9az104_5;
    case '15as46.9az-104.5':
      return PredefinedMeasurementConditions.MA15as46_9azMinus104_5;

    default:
      throw new Error(`[dmsDataConverter] Unknown DMS geometry '${geometry}' in ${dmsGeometryName}`);
  }

  // 45/0, Sphere etc. not implemented yet
};

//----------------------------------------------------------
// convertDmsDataModeToTransformationType
//----------------------------------------------------------
/**
 * Converts a DMS data mode to a transformation type.
 */
const convertDmsDataModeToTransformationType = (dmsDataMode: string): TransformType => {
  switch (dmsDataMode) {
    case 'ma9x':
      return TransformType.MA9x;
    case 'mat':
      return TransformType.MATx;
    case 'byk':
      return TransformType.BYK;
    case 'ma3_5':
      return TransformType.MA3_5;
    case 'xrga':
      return TransformType.None;
    default:
      throw new Error(`[dmsDataConverter] Unknown DMS data mode '${dmsDataMode}'`);
  }

  // Legacy data modes 'xrga', 'gmdi', 'xrdi' not supported
};

//----------------------------------------------------------
// convertDmsDataModeToTransformation
//----------------------------------------------------------
/**
 * Converts a DMS data mode to a transformation.
 */
const convertDmsDataModeToTransformation = (dmsDataMode: string): Transformation => {
  return Transformation.parse({
    transformType: convertDmsDataModeToTransformationType(dmsDataMode),
    netProfilerSignature: '',
  });
};

//----------------------------------------------------------
// convertDmsColorValueToMeasurementCondition
//----------------------------------------------------------
/**
 * Converts a DMS color value to a measurement condition.
 */
const convertDmsColorValueToMeasurementCondition = (
  dmsDataMode: string, dmsColorValue: DmsColorValue, dmsColorValueName: string,
): MeasurementCondition => {
  validateDefined(dmsColorValue, dmsColorValueName);

  if (dmsColorValue.geometry === '45_0') {
    return MeasurementCondition.parse({
      ...convertDms450GeometryToMeasurementCondition(
        dmsColorValue,
        dmsColorValueName,
      ),
      transformation: convertDmsDataModeToTransformation(dmsDataMode),
    });
  }

  return MeasurementCondition.parse({
    ...convertDmsMAGeometryToMeasurementCondition(
      dmsColorValue.geometry,
      `${dmsColorValueName}.geometry`,
    ),
    transformation: convertDmsDataModeToTransformation(dmsDataMode),
  });
};

//----------------------------------------------------------
// convertDmsSpectralToColorSpecification
//----------------------------------------------------------
/**
 * Converts a DMS spectral to a color specification.
 */
const convertDmsSpectralToColorSpecification = (
  dmsSpectral: DmsSpectral, dmsSpectralName: string, numberOfSpectralValues: number,
): ColorSpecification => {
  validateDefined(dmsSpectral, dmsSpectralName);
  validateDefined(dmsSpectral.wavelengthStart, `${dmsSpectralName}.wavelengthStart`);
  validateDefined(dmsSpectral.wavelengthInterval, `${dmsSpectralName}.wavelengthInterval`);

  const spectralSampling = SpectralSampling.parse({
    startWavelength: dmsSpectral.wavelengthStart,
    endWavelength: dmsSpectral.wavelengthStart
      + (numberOfSpectralValues - 1) * dmsSpectral.wavelengthInterval,
    wavelengthInterval: dmsSpectral.wavelengthInterval,
  });

  return ColorSpecification.spectrum(spectralSampling);
};

//----------------------------------------------------------
// convertDmsSpectralColorValueToMeasurementSample
//----------------------------------------------------------
/**
 * Converts a spectral DMS color value to a measurement sample.
 */
const convertDmsSpectralColorValueToMeasurementSample = (
  dmsDataMode: string, dmsColorValue: DmsColorValue, dmsColorValueName: string,
): MeasurementSample => {
  validateDefined(dmsColorValue, dmsColorValueName);
  validateDefined(dmsColorValue.spectral, `${dmsColorValueName}.spectral`);

  const dmsSpectral = dmsColorValue.spectral as DmsSpectral;

  const spectralValues = Array.isArray(dmsSpectral.values)
    ? dmsSpectral.values
    : convertBase64toNumber(dmsSpectral.values, `${dmsColorValueName}.spectral.values`);

  return MeasurementSample.parse({
    measurementCondition: convertDmsColorValueToMeasurementCondition(
      dmsDataMode, dmsColorValue, dmsColorValueName,
    ),
    colorSpecification: convertDmsSpectralToColorSpecification(
      dmsSpectral, `${dmsColorValueName}.spectral`, spectralValues.length,
    ),
    data: new DataCube({ data: spectralValues }),
  });
};

//----------------------------------------------------------
// convertDmsDataModeColorValuesToMeasurementSamples
//----------------------------------------------------------
/**
 * Converts the DMS color values of a given data mode to
 * measurement samples.
 */
const convertDmsDataModeColorValuesToMeasurementSamples = (
  dmsDataMode: string, dmsColorValues: DmsColorValue[], dmsColorValuesName: string,
): MeasurementSample[] => {
  validateDefined(dmsColorValues, dmsColorValuesName);

  const measurementSamples: MeasurementSample[] = [];

  dmsColorValues.forEach((dmsColorValue, dmsColorValueIndex) => {
    if (dmsColorValue.spectral) {
      measurementSamples.push(
        convertDmsSpectralColorValueToMeasurementSample(
          dmsDataMode, dmsColorValue, `${dmsColorValuesName}[${dmsColorValueIndex}]`,
        ),
      );
    }

    if (dmsColorValue.lab) {
      // Lab not implemented yet
    }
  });

  return measurementSamples;
};

//----------------------------------------------------------
// convertDmsColorValuesToMeasurementSamples
//----------------------------------------------------------
/**
 * Converts the DMS color values of a single measurement to
 * measurement samples.
 */
const convertDmsColorValuesToMeasurementSamples = (
  dmsColorValues: DmsColorValues | undefined, dmsColorValuesName: string,
): MeasurementSample[] => {
  if (dmsColorValues) {
    const measurementSampleArrays = Object.entries(dmsColorValues)
      .filter(([, b]) => Array.isArray(b)).map(
        ([key, dmsDataModeColorValues]) => (
          convertDmsDataModeColorValuesToMeasurementSamples(
            key, dmsDataModeColorValues, `${dmsColorValuesName}.${key}`,
          )),
      );
    return measurementSampleArrays.flat();
  }

  return [];
};

//----------------------------------------------------------
// convertDmsImageValuesToMeasurementSamples
//----------------------------------------------------------
/**
 * Converts the DMS images values of a single measurement to
 * measurement samples (not implemented yet).
 */
const convertDmsImageValuesToMeasurementSamples = (
  dmsImageValues: DmsImageValue[] | undefined,
): MeasurementSample[] => {
  if (dmsImageValues && (dmsImageValues.length > 0)) {
    // images not implemented yet
  }

  return [];
};

//----------------------------------------------------------
// convertDmsMeasurementToMeasurementSamples
//----------------------------------------------------------
/**
 * Converts a single DMS measurement to measurement samples.
 */
const convertDmsMeasurementToMeasurementSamples = (
  dmsMeasurement: DmsMeasurement, dmsMeasurementName: string,
): MeasurementSample[] => {
  validateDefined(dmsMeasurement, dmsMeasurementName);

  let measurementSampleArrays: MeasurementSample[][] = [];

  measurementSampleArrays = measurementSampleArrays.concat(
    convertDmsColorValuesToMeasurementSamples(
      dmsMeasurement.colorValues, `${dmsMeasurementName}.colorValues`,
    ),
  );

  measurementSampleArrays = measurementSampleArrays.concat(
    convertDmsImageValuesToMeasurementSamples(
      dmsMeasurement.imageValues,
    ),
  );

  return measurementSampleArrays.flat();
};

//----------------------------------------------------------
// convertDmsMeasurementsToMeasurementSamples
//----------------------------------------------------------
/**
 * Converts DMS measurements to measurement samples.
 */
const convertDmsMeasurementsToMeasurementSamples = (
  dmsMeasurements: DmsMeasurement[], dmsMeasurementsName: string,
): MeasurementSample[] => {
  validateDefined(dmsMeasurements, dmsMeasurementsName);

  const measurementsSampleArrays = dmsMeasurements.map((dmsMeasurement, dmsMeasurementIndex) => (
    convertDmsMeasurementToMeasurementSamples(
      dmsMeasurement, `${dmsMeasurementsName}[${dmsMeasurementIndex}]`,
    )
  ));

  return measurementsSampleArrays.flat();
};

//----------------------------------------------------------
// convertDmsMeasurementToDomainModel
//----------------------------------------------------------
/**
 * Converts DMS measurement data to a single domain model
 * measurement.
 */
export function convertDmsMeasurementToDomainModel(
  dmsMeasurementData: DmsMeasurementData,
): Measurement {
  validateDefined(dmsMeasurementData, 'measurementData');

  const dmsMeasurementSet = dmsMeasurementData.measurementSet;
  validateDefined(dmsMeasurementSet, 'measurementData.measurementSet');
  validateDefined(dmsMeasurementSet.id, 'measurementData.measurementSet.id');

  const dmsMeasurements = dmsMeasurementSet.measurements;
  validateDefined(dmsMeasurements, 'measurementData.measurementSet.measurements');

  return Measurement.parse({
    id: v4(),
    dmsMeasurementId: dmsMeasurementSet.id,
    creationDateTime: convertDmsTimestampToDateTime(dmsMeasurementSet.creationTimestamp, 'measurementData.measurementSet.creationTimestamp'),
    instrument: convertDmsDeviceToInstrument(dmsMeasurementData.device, 'measurementData.device'),
    measurementSamples: convertDmsMeasurementsToMeasurementSamples(dmsMeasurements, 'measurementData.measurementSet.measurements'),
  });
}
