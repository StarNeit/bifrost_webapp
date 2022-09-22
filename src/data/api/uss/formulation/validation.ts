/* eslint-disable @typescript-eslint/no-explicit-any */

import { isArray, isNumber } from '../../../../types/utils';
import { FormulationConfiguration, SortingCriterion, SortingCriterionColumn } from './types';

const isSortingColumn = (data: any): data is SortingCriterionColumn => (
  Object.values(SortingCriterionColumn).includes(data)
);

const isSortingCriterion = (data: any): data is SortingCriterion => (
  data
  && isSortingColumn(data.column)
  && isNumber(data.weight)
);

export const isFormulationConfiguration = (data: any): data is FormulationConfiguration => (
  data
  // && isNumber(data.maxColorantCount)
  // && isNumber(data.defaultCanSize)
  && isArray(data.sortingCriteria, isSortingCriterion)
);
