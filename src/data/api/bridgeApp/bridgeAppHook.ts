import { useEffect, useState } from 'react';

import { Measurement } from '@xrite/cloud-formulation-domain-model';
import { BridgeAppParameters, BridgeAppCallbacks, BridgeAppConfiguration } from './types';
import { getBridgeAppClient } from './bridgeAppClient';
import useToast from '../../useToast';
import { useConfiguration as useBridgeAppConfiguration } from '../bridgeAppConfiguration';

const getBridgeAppParameters = (
  config: BridgeAppConfiguration,
  singleMeasurement: boolean,
): BridgeAppParameters => ({
  ...config,
  singleMeasurement,
  dataModes: config.dataModes || [],
});

export function useBridgeApp() {
  const [isRequestInProgress, setIsRequestInProgress] = useState(false);
  const [measurement, setMeasurement] = useState<Measurement>();
  const [config] = useBridgeAppConfiguration();

  const isReadyForRequest = !!config;

  const { showToast } = useToast();

  const [{ startMeasurementRequest, stopMeasurementRequest }] = useState(getBridgeAppClient);

  const requestMeasurements = (singleMeasurement = true, dataTestId?: string) => new Promise(
    (resolve, reject) => {
      if (!config) {
        reject(new Error('Config data is missing'));
        return;
      }
      const parameters = getBridgeAppParameters(config, singleMeasurement);
      setMeasurement(undefined);
      let temporaryMeasurement: Measurement;

      const callbacks: BridgeAppCallbacks = {

        handleDataReceived: (data: Measurement) => {
          setMeasurement(data);
          temporaryMeasurement = data;

          if (singleMeasurement) {
            stopMeasurementRequest();
            setIsRequestInProgress(false);
            resolve(data);
          }
        },

        handleErrorOccurred: (errorMessage: string) => {
          showToast(errorMessage, 'error');
          setIsRequestInProgress(false);
          reject(new Error(errorMessage));
        },

        handleConnectionOpened: () => {
          setIsRequestInProgress(true);
        },

        handleConnectionClosed: () => {
          setIsRequestInProgress(false);
          resolve(temporaryMeasurement);
        },
      };

      setIsRequestInProgress(true);

      startMeasurementRequest(parameters, callbacks, dataTestId);
    },
  );

  useEffect(() => {
    return stopMeasurementRequest;
  }, []);

  return {
    requestMeasurements,
    cancelRequest: stopMeasurementRequest,
    isRequestInProgress,
    measurement,
    isReadyForRequest,
  };
}
