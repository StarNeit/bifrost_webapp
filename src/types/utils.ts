/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Generic type with all non-object properties mapped to unknown.
 */
export type Unvalidated<T> = null | undefined | {
  [P in keyof T]:
    // eslint-disable-next-line @typescript-eslint/ban-types
    T[P] extends object | undefined
      ? Unvalidated<T[P]>
      : unknown
};

/**
 * Generic to extract the type of an array element
 */
export type ArrayElement<A extends unknown[]> = A extends (infer T)[] ? T : never;

export const isString = (value: unknown): value is string => typeof value === 'string';

export const isNumber = (value: unknown): value is number => typeof value === 'number';

export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';

export const isEnumValue = <T>(value: any, enumValues: Record<string, T>): value is T => (
  Object.values(enumValues).includes(value)
);

export const isArray = <T>(
  value: any,
  predicate: (element: T) => element is T,
): value is T[] => (
    Array.isArray(value) && value.every(predicate)
  );

export const isValue = <T>(
  element: T,
): element is NonNullable<T> => element !== null && element !== undefined;

export const isUnionType = <T>(value: any, unionValues: readonly T[]): value is T => (
  unionValues.includes(value)
);

export type ColorRange = {
  max: number,
  min: number,
}

export type ExtractKeys<T, Z> = {
  [K in keyof T]: T[K] extends Z ? K : never;
}[keyof T];
