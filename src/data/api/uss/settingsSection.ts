/* eslint-disable @typescript-eslint/no-explicit-any */
import api, {
  isMergedSettings,
  Rules,
  ValidationError,
} from './api';
import { SectionSettings } from './types';

export const createSectionSettings = <T>(
  id: string,
  defaultConfiguration: T,
  configurationValidator: (data: any) => data is T,
) : SectionSettings<T> => ({
    id: `sectionSettings-${id}`,
    defaultConfiguration: {
      values: defaultConfiguration,
      lockedForDescendants: {},
    },
    configurationValidator,

    set: async (
      token: string,
      config: T,
      lockedForDescendants?: Rules<T>,
    ) => {
      await api.user.set({
        token,
        section: id,
        values: config,
        lockedForDescendants,
      });
    },

    get: async (token: string) => {
      const data = await api.settings.user.get({
        token,
        section: id,
      });

      if (!isMergedSettings(data, configurationValidator)) throw new ValidationError();
      return data;
    },
  });
