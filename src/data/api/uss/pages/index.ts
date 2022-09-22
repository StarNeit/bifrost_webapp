import { WidgetSettings } from '../../../../widgets/WidgetLayout/types';
import { createSectionSettings } from '../settingsSection';
import { isPageConfigurationCollection } from './validation';

export const DEFAULT_PAGE_CONFIGURATION_NAME = 'Default';

export const createPageSectionSettings = (
  pageId: string,
  defaultWidgetSettingsCollection: WidgetSettings[],
) => createSectionSettings(
  `page-${pageId}`,
  [{
    name: DEFAULT_PAGE_CONFIGURATION_NAME,
    widgetSettingsCollection: defaultWidgetSettingsCollection,
  }],
  isPageConfigurationCollection,
);
