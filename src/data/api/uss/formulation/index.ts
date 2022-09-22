import { createSectionSettings } from '../settingsSection';
import defaults from './defaults';
import { isFormulationConfiguration } from './validation';

export default createSectionSettings(
  'formulation',
  defaults,
  isFormulationConfiguration,
);
