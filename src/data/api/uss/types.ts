/* eslint-disable @typescript-eslint/no-explicit-any */

/** Error indicating a failure to recognize the type of incoming data */
export class ValidationError extends Error {}

/** Configuration data */
export type Values = Record<string, any>;

/** Rules for merging user settings with overrides set higher in the hierarchy */
export type Rules<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]?: T[P] extends object
    ? Rules<T[P]> | true
    : true
};

/** Representation of the user's settings */
export type Settings<T = Values> = {
  values: T,
  lockedForDescendants: Rules<T>,
};

/** Merged settings */
export type MergedSettings<T> = {
  values: T,
  lockedForDescendants?: Rules<T>,
  // TODO: this doesn't work when specifying sections, need to fix on uss, disabling for now
  // MergedSettings/Settings distinction is only important when we work on overrides (EFXW-2655)
  // lockedFromAncestors: Rules<T>,
};

export function isValues(data: any): data is Values {
  return typeof data === 'object' && data !== null;
}

export function isRules<T extends Values>(data: any, values: T): data is Rules<T> {
  if (typeof data !== 'object' || data === null) return false;

  return Object.keys(data).every((key) => {
    if (!(key in values)) return false;
    const value = values[key];
    if (!isValues(value)) return false;
    if (!isRules(data[key], value)) return false;
    return true;
  });
}

export const isSettings = <T>(
  data: any,
  valuesPredicate: (values: any) => values is T,
): data is Settings => (
    typeof data === 'object' && data !== null
    && valuesPredicate(data.values)
    && isRules(data.lockedForDescendants, data.values)
  );

export const isMergedSettings = <T>(
  data: any,
  valuesPredicate: (values: any) => values is T,
): data is MergedSettings<T> => (
    typeof data === 'object' && data !== null
    && valuesPredicate(data.values)
    && isRules(data.lockedForDescendants, data.values)
    // && isRules(data.lockedFromAncestors, data.values)
  );

export type SectionSettings<T> = {
  id: string,
  defaultConfiguration: MergedSettings<T>,
  configurationValidator: (data: any) => data is T,
  set: (
    token: string,
    config: T,
    lockedForDescendants?: Rules<T>,
  ) => Promise<void>;
  get: (
    token: string,
  ) => Promise<MergedSettings<T>>;
};
