import colorimetricSettings from './api/uss/colorimetric';
import formulationSettings from './api/uss/formulation';
import { createPageSectionSettings } from './api/uss/pages';
import { createModalWidgetSectionSettings } from './api/uss/modals';

import {
  defaultFormulationWidgetSettingsCollection,
  defaultCorrectionWidgetSettingsCollection,
  defaultQCWidgetSettingsCollection,
} from './api/uss/pages/defaults';
import {
  defaultStandardModalWidgetSettings,
  defaultSampleModalWidgetSettings,
  defaultSubstrateModalWidgetSettings,
  defaultColorSearchModalWidgetSettings,
  defaultLeftoversModalWidgetSettings,
} from './api/uss/modals/defaults';
import { createUseSettings } from './configurationsUtils';

export const useColorimetricConfiguration = createUseSettings({
  sectionSettings: colorimetricSettings,
  showDefaultWarning: true,
});

export const useFormulationConfiguration = createUseSettings({
  sectionSettings: formulationSettings,
  showDefaultWarning: true,
});

export const useFormulationPageConfiguration = createUseSettings({
  sectionSettings: createPageSectionSettings('formulation', defaultFormulationWidgetSettingsCollection),
});
export const useCorrectionPageConfiguration = createUseSettings({
  sectionSettings: createPageSectionSettings('correction', defaultCorrectionWidgetSettingsCollection),
});
export const useQCPageConfiguration = createUseSettings({
  sectionSettings: createPageSectionSettings('qc', defaultQCWidgetSettingsCollection),
});

export const useStandardModalWidgetConfiguration = createUseSettings({
  sectionSettings: createModalWidgetSectionSettings('standard', defaultStandardModalWidgetSettings),
});
export const useSampleModalWidgetConfiguration = createUseSettings({
  sectionSettings: createModalWidgetSectionSettings('sample', defaultSampleModalWidgetSettings),
});
export const useSubstrateModalWidgetConfiguration = createUseSettings({
  sectionSettings: createModalWidgetSectionSettings('substrate', defaultSubstrateModalWidgetSettings),
});
export const useColorSearchModalWidgetConfiguration = createUseSettings({
  sectionSettings: createModalWidgetSectionSettings('colorsearch', defaultColorSearchModalWidgetSettings),
});
export const useLeftoversModalWidgetConfiguration = createUseSettings({
  sectionSettings: createModalWidgetSectionSettings('leftovers', defaultLeftoversModalWidgetSettings),
});
