import useSWR, { mutate } from 'swr';
import _ from 'lodash';
import * as cfss from './cfss';
import { BridgeAppConfiguration } from './bridgeApp/types';

const store = _.debounce(
  async (configuration: BridgeAppConfiguration) => {
    await cfss.storeBridgeAppConfiguration(configuration);
    mutate('bridgeApp');
  },
  1000,
);

export const useConfiguration = (): [
  BridgeAppConfiguration | undefined,
  (newConfiguration: BridgeAppConfiguration) => void,
] => {
  const { data } = useSWR('bridgeApp', cfss.loadBridgeAppConfiguration);

  async function setConfiguration(newConfiguration: BridgeAppConfiguration) {
    mutate('bridgeApp', newConfiguration, false);
    store(newConfiguration);
  }

  return [
    data,
    setConfiguration,
  ];
};
