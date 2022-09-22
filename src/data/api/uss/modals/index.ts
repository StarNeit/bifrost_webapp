import { ModalWidgetSettings } from '../../../../widgets/WidgetLayout/types';
import { createSectionSettings } from '../settingsSection';
import { isModalWidgetSettings } from './validation';

export const createModalWidgetSectionSettings = (
  modalId: string,
  defaultModalWidgetSettings: ModalWidgetSettings,
) => createSectionSettings(
  `modal-${modalId}`,
  defaultModalWidgetSettings,
  isModalWidgetSettings,
);
