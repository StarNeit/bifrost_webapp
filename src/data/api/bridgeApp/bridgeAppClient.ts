import i18n from 'i18next';

import {
  BridgeAppParameters, BridgeAppCallbacks, BridgeErrorOptions, BridgeAppConfiguration,
} from './types';
import { convertDmsMeasurementToDomainModel } from '../../../utils/dmsDataConverter';
import { DmsDataMode, DmsMeasurementData } from '../../../types/dms';
import config from '../../../config';
import { storeTestData } from '../../../utils/test-utils';

interface BridgeAppRequestMeasurementMessage {
  applicationName: string,
  conditions: {
    dataModes?: DmsDataMode[],
    numberOfAveragingSamples?: number,
  },
}

interface BridgeAppResponse {
  success: boolean,
  errorCode?: BridgeErrorOptions,
  errorMessage?: string,
}

interface BridgeAppRequestMeasurementResponse extends BridgeAppResponse {
  measurement?: DmsMeasurementData,
}

export function getBridgeAppClient() {
  let webSocket: WebSocket;
  let closeExpected = false;

  const connect = (configuration: BridgeAppConfiguration, callbacks: BridgeAppCallbacks) => {
    return new Promise<void>((resolve, reject) => {
      closeExpected = false;
      const url = `ws://${configuration.hostName}`;
      webSocket = new WebSocket(url);

      webSocket.onopen = () => {
        callbacks.handleConnectionOpened?.();

        webSocket.onclose = () => {
          callbacks.handleConnectionClosed?.();
          if (!closeExpected) {
            callbacks.handleErrorOccurred(i18n.t('messages.bridgeApp.errors.connectionUnexpectedlyClosed'));
          }
        };

        resolve();
      };

      webSocket.onclose = (event) => {
        const errorMessage = `${i18n.t('messages.bridgeApp.errors.couldNotConnect')}${event.reason ? ` (${event.reason})` : ''}`;
        reject(new Error(errorMessage));
      };
    });
  };

  const disconnect = () => {
    if (webSocket) {
      closeExpected = true;
      webSocket.close();
    }
  };

  const send = (command: string, parameters: BridgeAppRequestMeasurementMessage) => {
    const message = { command, parameters };
    const stringifiedMessage = JSON.stringify(message);
    webSocket.send(stringifiedMessage);
  };

  const formatRequestMeasurementMessage = (
    parameters: BridgeAppParameters,
  ): BridgeAppRequestMeasurementMessage => {
    return {
      conditions: {
        dataModes: parameters.dataModes,
        numberOfAveragingSamples: parameters.numberOfAveragingSamples,
      },
      applicationName: config.APP_NAME,
    };
  };

  const formatErrorMessage = (errorMessage: string, debugMessage?: string) => {
    if (debugMessage) {
      return `${errorMessage} (${debugMessage})`;
    }

    return errorMessage;
  };

  const convertErrorCode = (errorCode?: BridgeErrorOptions, errorMessage?: string) => {
    if (errorCode) {
      switch (errorCode) {
        case 'applicationBusy':
          return i18n.t('messages.bridgeApp.errors.applicationBusy');

        case 'requestCanceledByUser':
          return i18n.t('messages.bridgeApp.errors.requestCanceledByUser');

        case 'invalidMessageFormat':
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.invalidMessageFormat'), errorMessage);

        case 'unknownCommand':
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.unknownCommand'), errorMessage);

        case 'invalidParameter':
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.invalidParameter'), errorMessage);

        case 'noInstrumentConnected':
          return i18n.t('messages.bridgeApp.errors.noInstrumentConnected');

        case 'instrumentCommunicationError':
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.instrumentCommunicationError'), errorMessage);

        case 'instrumentFeatureNotSupported':
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.instrumentFeatureNotSupported'), errorMessage);

        case 'internalError':
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.internalError'), errorMessage);

        default:
          return formatErrorMessage(i18n.t('messages.bridgeApp.errors.unknownError'), errorMessage);
      }
    }

    if (errorMessage) {
      return errorMessage;
    }

    return i18n.t('messages.bridgeApp.errors.noErrorInfoReceived');
  };

  const parseRequestMeasurementResponse = (
    response: BridgeAppRequestMeasurementResponse, callbacks: BridgeAppCallbacks,
  ) => {
    try {
      if (response.success) {
        if (response.measurement) {
          const convertedMeasurement = convertDmsMeasurementToDomainModel(response.measurement);
          callbacks.handleDataReceived(convertedMeasurement);
        } else {
          callbacks.handleErrorOccurred(i18n.t('messages.bridgeApp.errors.noMeasurementDataReceived'));
        }
      } else {
        const errorMessage = convertErrorCode(
          response.errorCode,
          response.errorMessage,
        );
        callbacks.handleErrorOccurred(errorMessage);
        closeExpected = true;
      }
    } catch (exception) {
      callbacks.handleErrorOccurred(exception.message);
    }
  };

  const requestMeasurement = (
    parameters: BridgeAppParameters, callbacks: BridgeAppCallbacks, dataTestId?: string,
  ) => {
    webSocket.onmessage = (event) => {
      const parsedData = JSON.parse(event.data);

      const data = parsedData.success && parsedData.measurement;
      storeTestData(dataTestId, data);

      parseRequestMeasurementResponse(parsedData, callbacks);
    };

    const messageParameters = formatRequestMeasurementMessage(parameters);
    send('requestMeasurement', messageParameters);
  };

  const startMeasurementRequest = (
    parameters: BridgeAppParameters, callbacks: BridgeAppCallbacks, dataTestId?: string,
  ) => {
    connect(parameters, callbacks)
      .then(() => {
        requestMeasurement(parameters, callbacks, dataTestId);
      })
      .catch((error) => {
        callbacks.handleErrorOccurred(error.message);
      });
  };

  const stopMeasurementRequest = () => {
    disconnect();
  };

  return {
    startMeasurementRequest,
    stopMeasurementRequest,
  };
}
