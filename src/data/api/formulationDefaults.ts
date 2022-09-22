import useSWR, { mutate } from 'swr';
import _ from 'lodash';
import * as cfss from './cfss';
import { FormulationDefaults } from '../../types/formulation';

const store = _.debounce(
  async (defaults: FormulationDefaults) => {
    await cfss.storeFormulationDefaults(defaults);
    mutate('formulation');
  },
  1000,
);

export const useFormulationDefaults = (): [
  FormulationDefaults | undefined,
  (newConfiguration: FormulationDefaults) => void,
] => {
  const { data } = useSWR('formulation', cfss.loadFormulationDefaults);

  async function setConfiguration(newDefaults: FormulationDefaults) {
    mutate('formulation', newDefaults, false);
    store(newDefaults);
  }

  return [
    data,
    setConfiguration,
  ];
};
