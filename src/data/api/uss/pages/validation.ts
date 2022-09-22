/* eslint-disable @typescript-eslint/no-explicit-any */
import { Layout } from 'react-grid-layout';

import {
  isEnumValue,
  isArray,
  isString,
} from '../../../../types/utils';

import {
  SampleMode,
  WidgetSettings,
  WidgetType,
} from '../../../../widgets/WidgetLayout/types';

import { PageConfiguration } from './types';

import {
  isViewingCondition,
  isReflectanceCondition,
  isTableSettings,
} from '../common/validation';

const isLayout = (data: any): data is Layout => (
  data
  && (typeof data.i === 'string')
  && (typeof data.x === 'number')
  && (typeof data.y === 'number')
  && (typeof data.w === 'number')
  && (typeof data.h === 'number')
);

const isWidgetSettings = (data: any): data is WidgetSettings => (
  data
  && (typeof data.id === 'string')
  && (isLayout(data.layout))
  && (isEnumValue(data.type, WidgetType))
  && (isEnumValue(data.sampleMode, SampleMode))
  && isArray(data.viewingConditions, isViewingCondition)
  && isArray(data.measurementConditions, isString)
  && isArray(data.reflectanceConditions, isReflectanceCondition)
  && (!data.tableSettings || isTableSettings(data.tableSettings))
);

const isPageConfiguration = (data: any): data is PageConfiguration => (
  data
    && isString(data.name)
    && isArray(data.widgetSettingsCollection, isWidgetSettings)
);

export const isPageConfigurationCollection = (data: any): data is PageConfiguration[] => (
  isArray(data, isPageConfiguration)
);
