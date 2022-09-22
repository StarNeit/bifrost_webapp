import axios from 'axios';

import config from '../../../config';
import {
  isMergedSettings,
  isSettings,
  isValues,
  Rules,
  ValidationError,
  Values,
} from './types';

export * from './types';

// TODO: make this file application-agnostic, configurable (EFXW-2652)
const APPLICATION_ID = 'bifrost';
export const urls = {
  USER: `${config.USS_URL}/user/${APPLICATION_ID}`,
  COMPANY: `${config.USS_URL}/company/${APPLICATION_ID}`,
  DEFAULTS: `${config.USS_URL}/defaults/${APPLICATION_ID}`,
  settings: {
    USER: `${config.USS_URL}/settings/user/${APPLICATION_ID}`,
    COMPANY: `${config.USS_URL}/settings/company/${APPLICATION_ID}`,
    DEFAULTS: `${config.USS_URL}/settings/defaults/${APPLICATION_ID}`,
  },
};

function createGetFunction(url: string) {
  return async ({
    token,
    section = '',
  }: {
    token: string,
    section?: string,
  }) => {
    const { data } = await axios.get(
      section ? `${url}/${section}` : url,
      { headers: { 'xr-token': token } },
    );
    if (!isSettings(data, isValues)) throw new ValidationError('Unknown data format');
    return data;
  };
}

function createGetSettingsFunction(url: string) {
  return async ({
    token,
    section = '',
  }: {
    token: string,
    section?: string,
  }) => {
    const { data } = await axios.get(
      section ? `${url}/${section}` : url,
      { headers: { 'xr-token': token } },
    );

    if (!isMergedSettings(data, isValues)) throw new ValidationError('Unknown data format');
    return data;
  };
}

function createSetFunction<T extends Values>(url: string) {
  return ({
    token,
    section = '',
    values,
    lockedForDescendants = {},
  }: {
    token: string,
    section?: string,
    values: T,
    lockedForDescendants?: Rules<T>,
  }) => axios.put(
    section ? `${url}/${section}` : url,
    {
      values,
      lockedForDescendants,
    }, {
      headers: { 'xr-token': token },
    },
  );
}

function createDeleteFunction(url: string) {
  return ({
    token,
    section = '',
  }: {
    token: string,
    section?: string,
  }) => axios.delete(
    section ? `${url}/${section}` : url,
    {
      headers: { 'xr-token': token },
    },
  );
}

function createHierarchyLevel(url: string) {
  return {
    url,
    /** Get overrides. */
    get: createGetFunction(url),
    /** Set overrides. */
    set: createSetFunction(url),
    /** Delete overrides. */
    delete: createDeleteFunction(url),
  };
}

function createSettingsHierarchyLevel(url: string) {
  return {
    url,
    /** Get settings merged with overrides from ancestors. */
    get: createGetSettingsFunction(url),
  };
}

export default {
  user: createHierarchyLevel(urls.USER),
  company: createHierarchyLevel(urls.COMPANY),
  defaults: createHierarchyLevel(urls.DEFAULTS),
  settings: {
    user: createSettingsHierarchyLevel(urls.settings.USER),
    // TODO: confirm use-case for settings.company.get, settings.defaults.get (EFXW-2654)
    company: createSettingsHierarchyLevel(urls.settings.COMPANY),
    defaults: createSettingsHierarchyLevel(urls.settings.DEFAULTS),
  },
};
