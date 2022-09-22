/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  isEnumValue,
  isArray,
  isString,
} from '../../../../types/utils';

import {
  SampleMode,
  WidgetType,
  ModalWidgetSettings,
} from '../../../../widgets/WidgetLayout/types';

import {
  isViewingCondition,
  isReflectanceCondition,
  isTableSettings,
} from '../common/validation';

export const isModalWidgetSettings = (data: any): data is ModalWidgetSettings => (
  data
  && (isEnumValue(data.type, WidgetType))
  && (isEnumValue(data.sampleMode, SampleMode))
  && isArray(data.viewingConditions, isViewingCondition)
  && isArray(data.measurementConditions, isString)
  && isArray(data.reflectanceConditions, isReflectanceCondition)
  && (!data.tableSettings || isTableSettings(data.tableSettings))
);
