/* eslint-disable @typescript-eslint/no-explicit-any */
import { IlluminantType, ObserverType } from '@xrite/cloud-formulation-domain-model';
import { SortingRule } from 'react-table';

import { ReflectanceCondition, ViewingCondition } from '../../../../types/layout';
import {
  isEnumValue,
  isArray,
  isString,
  isBoolean,
} from '../../../../types/utils';

import {
  TableSettings,
} from '../../../../widgets/WidgetLayout/types';

export const isViewingCondition = (data: any): data is ViewingCondition => (
  data
  && isEnumValue(data.illuminant, IlluminantType)
  && isEnumValue(data.observer, ObserverType)
);

export const isReflectanceCondition = (data: any): data is ReflectanceCondition => (
  isEnumValue(data, ReflectanceCondition)
);

const isSortingRule = (data: any): data is SortingRule<string> => (
  data
  && isString(data.id)
  && (!data.desc || isBoolean(data.desc))
);

export const isTableSettings = (data:any): data is TableSettings => (
  data
  && (!data.activeColumnsIds || isArray(data.activeColumnsIds, isString))
  && (!data.sortBy || isArray(data.sortBy, isSortingRule))
);
