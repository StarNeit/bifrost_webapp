import { Measurement } from '@xrite/cloud-formulation-domain-model';
import { DmsDataMode } from '../../../types/dms';

export interface BridgeAppConfiguration {
  hostName: string,
  numberOfAveragingSamples?: number,
  dataModes: DmsDataMode[],
}

export interface BridgeAppParameters {
  hostName: string,
  dataModes: DmsDataMode[],
  numberOfAveragingSamples?: number,
  singleMeasurement?: boolean,
}

export interface BridgeAppCallbacks {
  handleDataReceived: (measurement: Measurement) => void,
  handleErrorOccurred: (message: string) => void,
  handleConnectionOpened?: () => void,
  handleConnectionClosed?: () => void,
}

export enum BridgeErrorOptions {
  applicationBusy = 'applicationBusy',
  requestCanceledByUser = 'requestCanceledByUser',
  invalidMessageFormat = 'invalidMessageFormat',
  unknownCommand = 'unknownCommand',
  invalidParameter = 'invalidParameter',
  noInstrumentConnected = 'noInstrumentConnected',
  instrumentNotCalibrated = 'instrumentNotCalibrated',
  instrumentCommunicationError = 'instrumentCommunicationError',
  instrumentFeatureNotSupported = 'instrumentFeatureNotSupported',
  internalError = 'internalError',
}
