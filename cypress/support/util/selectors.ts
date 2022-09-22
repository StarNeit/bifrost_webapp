/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, parse } from 'date-fns';
import { getDateStringFromLocale } from './date-locales';

export const toPrecise = (value: number): string => value.toFixed(2);

export const makeMismatchMessage = (mismatchMessage: string, item: string) => `${mismatchMessage} ${item} is `;

export const findElementText = (row: any, selector: string) => row.find(`[data-testid="cell-${selector?.toLowerCase()}"]`).text();

export const makeSafeSelector = (selector: string) => selector?.replace(/\//gm, '_');

export const removeExtraSpaces = (selector?: string) => selector?.replace(/  +/g, ' ');

export const replaceSpaceInSelector = (selector?: string) => removeExtraSpaces(selector)?.replace(/\s/g, '-')
  .replace(/\./g, '')
  .toLowerCase();

export const makeShortName = (selector?: string) => selector?.split('-')
  .filter((x) => x[0]?.match('[A-Za-z0-9]'))
  .map((x) => x[0]).join('');

export const formatDate = (date?: string): Date | null => {
  if (!date) return null;

  const { locale } = Intl.DateTimeFormat().resolvedOptions();
  const dateFormat = getDateStringFromLocale(locale);

  return new Date(
    format(
      parse(date, dateFormat, new Date()),
      'yyyy-MM-dd',
    ),
  );
};
