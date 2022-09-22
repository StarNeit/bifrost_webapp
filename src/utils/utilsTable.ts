import { isNumber } from '../types/utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isNumericValue = (value: any) => {
  const numericValue = Number(value);

  if (Array.isArray(value)) return false;

  return Number.isNaN(numericValue)
    ? false
    : isNumber(numericValue);
};
