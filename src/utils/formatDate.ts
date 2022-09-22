/* eslint-disable no-restricted-globals */
import format from 'date-fns/format';

export const formatDate = (
  dateString: string,
  dateFormat: string,
): string | null => {
  if (!dateString) return null;

  const date = new Date(dateString);

  if (date instanceof Date && !Number.isNaN(Number(date))) {
    return format(date, dateFormat);
  }
  return null;
};
