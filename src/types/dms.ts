import type {
  Instrument, MeasurementSample,
} from '@xrite/cloud-formulation-domain-model';

export type Measurement = {
  creationDateTime: string;
  dmsMeasurementId: string;
  id: UUID;
  instrument: Instrument;
  measurementSamples: MeasurementSample[];
  jobId: string;
};

//--------------------------------------------------------------------------------
// dms
//--------------------------------------------------------------------------------
/**
 * Describes the data format used by the DMS and the BridgeApp.
 * Based on "https://github.com/X-Rite/job-data-format".
 */

//----------------------------------------------------------
// DmsDevice
//----------------------------------------------------------
/**
 * Information about the device with which the measurement was made.
 */
export interface DmsDevice {
  /** The device type (e.g. "MA-3/5", "MA-Tx") */
  type: string,
  /** The device model */
  model?: string,
  /** The device SKU (e.g. "TP5A" */
  sku?: string,
  /** The serial number of the device */
  serialNumber: string,
  /** The time the measurement data was sent (seconds since 1970-01-01) */
  currentTimestamp: number,
  /** The firmware version of the device */
  firmwareVersion?: string,
}

//----------------------------------------------------------
// DmsSpectral
//----------------------------------------------------------
/**
 * A spectrum including the wavelength range.
 */
export interface DmsSpectral {
  /** The start of the wavelength range (nm) */
  wavelengthStart: number,
  /** The wavelength interval (nm) */
  wavelengthInterval: number,
  /** The spectrum values (Base64 encoded floats, 0...1) */
  values: string;
}

//----------------------------------------------------------
// DmsLab
//----------------------------------------------------------
/**
 * An Lab value including the measurement conditions.
 */
export interface DmsLab {
  /** The illuminant (e.g. "D65") */
  illuminant: string,
  /** The observer (e.g. "10") */
  observer: string,
  /** The L value */
  l: number,
  /** The a value */
  a: number,
  /** The b value */
  b: number,
}

//----------------------------------------------------------
// DmsColorValue
//----------------------------------------------------------
/**
 * A spectrum and/or Lab value of a given geometry.
 */
export interface DmsColorValue {
  /** The geometry (e.g. "45as25") */
  geometry: string,
  /** The illumination (e.g. "D65") */
  illumination?: string,
  /** The gloss */
  gloss?: 'included' | 'excluded'
  /** The filter */,
  filter?: 'no' | 'polarized',
  /** The spectral values */
  spectral?: DmsSpectral,
  /** The Lab value */
  lab?: DmsLab,
}

//----------------------------------------------------------
// DmsDataMode
//----------------------------------------------------------
/**
 * The data modes.
 */
export type DmsDataMode = 'ma9x' | 'mat' | 'byk' | 'ma3_5' | 'xrga' | 'gmdi' | 'xrdi';

//----------------------------------------------------------
// DmsColorValues
//----------------------------------------------------------
/**
 * Color values for each data mode.
 */
export type DmsColorValues = {
  /** The color values per data mode */
  [dataMode in DmsDataMode]: DmsColorValue[];
}

//----------------------------------------------------------
// DmsImage
//----------------------------------------------------------
/**
 * A single image including the format.
 */
export interface DmsImage {
  /** The format of the image (e.g. "exr") */
  format: string,
  /** The type of the image */
  type?: 'preview' | 'fullSize',
  /** The image data (Base64 encoded) */
  data: string,
}

//----------------------------------------------------------
// DmsTextureValue
//----------------------------------------------------------
/**
 * A single texture value.
 */
export interface DmsTextureValue {
  /** The name of the texture value (e.g. "Sparkle Grade") */
  name: string,
  /** The texture version (e.g. "5.2") */
  version?: string,
  /** The texture value */
  value: number,
}

//----------------------------------------------------------
// DmsImageValue
//----------------------------------------------------------
/**
 * An image and/or texture values of a given geometry.
 */
export interface DmsImageValue {
  /** The geometry (e.g. "45as25") */
  geometry: string,
  /** The image */
  image?: DmsImage,
  /** The texture values */
  textureValues?: DmsTextureValue[],
}

//----------------------------------------------------------
// DmsMeasurement
//----------------------------------------------------------
/**
 * A single measurement with spectra and images for each geometry.
 */
export interface DmsMeasurement {
  /** The ID of the measurement */
  id: string,
  /** The time when this measurement was created on the device (seconds since 1970-01-01) */
  timestamp: number,
  /** The temperature when the measurement was taken (Celcius) */
  temperature?: number,
  /** The color values */
  colorValues?: DmsColorValues,
  /** The image values */
  imageValues?: DmsImageValue[],
}

//----------------------------------------------------------
// DmsMeasurementSet
//----------------------------------------------------------
/**
 * A set of measurements of the same job.
 */
export interface DmsMeasurementSet {
  /** The ID of the measurement set (e.g. "20181207_102856") */
  id: string,
  /* The name of the job (e.g. "Audi ZH001122") */
  name: string,
  /** The time when the job was created on the device (seconds since 1970-01-01) */
  creationTimestamp: number,
  /** The averaging mode (e.g. "average", "smc-5", "smc-7") */
  averagingMode?: string,
  /** The measurements. */
  measurements: DmsMeasurement[],
}

//----------------------------------------------------------
// DmsMeasurementData
//----------------------------------------------------------
/**
 * A complete set of measurement data generated by a single
 * click on the measurement button of a typical measuring device.
 */
export interface DmsMeasurementData {
  /** Information about the device with which the measurement was made */
  device: DmsDevice,
  /** The measurements */
  measurementSet: DmsMeasurementSet,
  jobId: string,
}

export type Job = {
  id: string;
  simulation: {
    rgb: {
      r: number;
      g: number;
      b: number;
    };
  }[];
  name: string;
  dateCreated: string;
  isMultiAngle: boolean;
};
