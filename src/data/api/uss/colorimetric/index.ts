import { createSectionSettings } from '../settingsSection';
import defaults from './defaults';
import { isColorimetricConfiguration } from './validation';

export default createSectionSettings(
  'colorimetry',
  defaults,
  isColorimetricConfiguration,
);
